import { type NextRequest, NextResponse } from "next/server"
import { YahooFantasyAPI } from "@/lib/yahoo-api"
import { WaiverWireAnalyzer } from "@/lib/waiver-analyzer"

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

    // Fetch available players from Yahoo API
    const availablePlayers = await yahooAPI.getAvailablePlayers(leagueKey)

    // Analyze waiver wire recommendations
    const analyzer = new WaiverWireAnalyzer()
    const recommendations = await analyzer.analyzeWaiverWire(availablePlayers, leagueKey, Number.parseInt(week))

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error("Error analyzing waiver wire:", error)
    return NextResponse.json({ error: "Failed to analyze waiver wire" }, { status: 500 })
  }
}
