import { type NextRequest, NextResponse } from "next/server"
import { YahooFantasyAPI } from "@/lib/yahoo-api"
import { GameAnalyzer } from "@/lib/game-analyzer"

export async function POST(request: NextRequest) {
  const { leagueKey, week } = await request.json()

  if (!leagueKey || !week) {
    return NextResponse.json({ error: "Missing leagueKey or week parameter" }, { status: 400 })
  }

  const accessToken = request.cookies.get("yahoo_access_token")?.value
  const refreshToken = request.cookies.get("yahoo_refresh_token")?.value

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const yahooAPI = new YahooFantasyAPI({
      clientId: process.env.YAHOO_CLIENT_ID!,
      clientSecret: process.env.YAHOO_CLIENT_SECRET!,
      redirectUri: process.env.YAHOO_REDIRECT_URI!,
    })

    yahooAPI.setTokens(accessToken, refreshToken)

    // Fetch league data
    const [matchups, teams, leagues] = await Promise.all([
      yahooAPI.getWeeklyMatchups(leagueKey, Number.parseInt(week)),
      yahooAPI.getLeagueTeams(leagueKey),
      yahooAPI.getUserLeagues(),
    ])

    const league = leagues.find((l) => l.league_key === leagueKey)
    const leagueName = league?.name || "Unknown League"

    // Analyze the week
    const analyzer = new GameAnalyzer()
    const weeklyReport = analyzer.analyzeWeek(matchups, teams, Number.parseInt(week), leagueName)

    return NextResponse.json({ report: weeklyReport })
  } catch (error) {
    console.error("Error analyzing games:", error)
    return NextResponse.json({ error: "Failed to analyze games" }, { status: 500 })
  }
}
