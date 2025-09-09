import { type NextRequest, NextResponse } from "next/server"
import { YahooFantasyAPI } from "@/lib/yahoo-api"
import { WaiverWireAnalyzer } from "@/lib/waiver-analyzer"
import { EmailService } from "@/lib/email-service"
import { globalScheduler } from "@/lib/scheduler"

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Validate required environment variables
  const requiredEnvVars = ["YAHOO_CLIENT_ID", "YAHOO_CLIENT_SECRET", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    return NextResponse.json({ error: `Missing environment variables: ${missingVars.join(", ")}` }, { status: 500 })
  }

  const results = []
  const enabledSchedules = globalScheduler.getEnabledSchedules()

  for (const schedule of enabledSchedules) {
    if (!globalScheduler.shouldSendWaiverWireAlert(schedule.leagueKey)) {
      continue
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

      // Note: In production, you'd need to store and retrieve user tokens securely
      // For now, this assumes tokens are available (you'd implement token storage)

      const currentWeek = globalScheduler.getCurrentWeek()

      // Fetch data
      const [availablePlayers, leagues] = await Promise.all([
        yahooAPI.getAvailablePlayers(schedule.leagueKey),
        yahooAPI.getUserLeagues(),
      ])

      const league = leagues.find((l) => l.league_key === schedule.leagueKey)
      const leagueName = league?.name || "Unknown League"

      // Analyze waiver wire
      const analyzer = new WaiverWireAnalyzer()
      const recommendations = await analyzer.analyzeWaiverWire(availablePlayers, schedule.leagueKey, currentWeek)

      // Send waiver wire alert
      await emailService.sendWaiverWireAlert(recommendations, leagueName, currentWeek, schedule.recipientEmail)

      // Record success
      globalScheduler.addToHistory({
        type: "waiver-wire-alert",
        leagueKey: schedule.leagueKey,
        week: currentWeek,
        sentAt: new Date(),
        status: "success",
      })

      results.push({
        leagueKey: schedule.leagueKey,
        status: "success",
        week: currentWeek,
        recommendations: recommendations.length,
      })
    } catch (error) {
      console.error(`Failed to send waiver wire alert for league ${schedule.leagueKey}:`, error)

      // Record failure
      globalScheduler.addToHistory({
        type: "waiver-wire-alert",
        leagueKey: schedule.leagueKey,
        week: globalScheduler.getCurrentWeek(),
        sentAt: new Date(),
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })

      results.push({
        leagueKey: schedule.leagueKey,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  return NextResponse.json({
    success: true,
    processed: results.length,
    results,
    timestamp: new Date().toISOString(),
  })
}
