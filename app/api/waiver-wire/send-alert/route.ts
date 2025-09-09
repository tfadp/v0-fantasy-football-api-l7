import { type NextRequest, NextResponse } from "next/server"
import { YahooFantasyAPI } from "@/lib/yahoo-api"
import { WaiverWireAnalyzer } from "@/lib/waiver-analyzer"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  const { leagueKey, week, recipientEmail } = await request.json()

  if (!leagueKey || !week || !recipientEmail) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  // Validate email environment variables
  const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    return NextResponse.json({ error: `Missing email configuration: ${missingVars.join(", ")}` }, { status: 500 })
  }

  const accessToken = request.cookies.get("yahoo_access_token")?.value
  const refreshToken = request.cookies.get("yahoo_refresh_token")?.value

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Initialize services
    const yahooAPI = new YahooFantasyAPI({
      clientId: process.env.YAHOO_CLIENT_ID!,
      clientSecret: process.env.YAHOO_CLIENT_SECRET!,
      redirectUri: process.env.YAHOO_REDIRECT_URI!,
    })

    const emailService = new EmailService({
      host: process.env.SMTP_HOST!,
      port: Number.parseInt(process.env.SMTP_PORT!),
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
      from: process.env.SMTP_USER!,
    })

    yahooAPI.setTokens(accessToken, refreshToken)

    // Fetch data
    const [availablePlayers, leagues] = await Promise.all([
      yahooAPI.getAvailablePlayers(leagueKey),
      yahooAPI.getUserLeagues(),
    ])

    const league = leagues.find((l) => l.league_key === leagueKey)
    const leagueName = league?.name || "Unknown League"

    // Analyze waiver wire
    const analyzer = new WaiverWireAnalyzer()
    const recommendations = await analyzer.analyzeWaiverWire(availablePlayers, leagueKey, Number.parseInt(week))

    // Send waiver wire alert
    await emailService.sendWaiverWireAlert(recommendations, leagueName, Number.parseInt(week), recipientEmail)

    return NextResponse.json({ success: true, message: "Waiver wire alert sent successfully", recommendations })
  } catch (error) {
    console.error("Error sending waiver wire alert:", error)
    return NextResponse.json({ error: "Failed to send waiver wire alert" }, { status: 500 })
  }
}
