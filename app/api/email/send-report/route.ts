import { type NextRequest, NextResponse } from "next/server"
import { EmailService } from "@/lib/email-service"
import { YahooFantasyAPI } from "@/lib/yahoo-api"
import { GameAnalyzer } from "@/lib/game-analyzer"

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

    // Fetch data and generate report
    const [matchups, teams, leagues] = await Promise.all([
      yahooAPI.getWeeklyMatchups(leagueKey, Number.parseInt(week)),
      yahooAPI.getLeagueTeams(leagueKey),
      yahooAPI.getUserLeagues(),
    ])

    const league = leagues.find((l) => l.league_key === leagueKey)
    const leagueName = league?.name || "Unknown League"

    const analyzer = new GameAnalyzer()
    const weeklyReport = analyzer.analyzeWeek(matchups, teams, Number.parseInt(week), leagueName)

    // Send email
    await emailService.sendWeeklyReport(weeklyReport, recipientEmail)

    return NextResponse.json({ success: true, message: "Weekly report sent successfully" })
  } catch (error) {
    console.error("Error sending weekly report:", error)
    return NextResponse.json({ error: "Failed to send weekly report" }, { status: 500 })
  }
}
