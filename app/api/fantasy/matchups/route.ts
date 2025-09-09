import { type NextRequest, NextResponse } from "next/server"
import { YahooFantasyAPI } from "@/lib/yahoo-api"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const leagueKey = searchParams.get("league_key")
  const week = searchParams.get("week")

  if (!leagueKey || !week) {
    return NextResponse.json({ error: "Missing league_key or week parameter" }, { status: 400 })
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
    const matchups = await yahooAPI.getWeeklyMatchups(leagueKey, Number.parseInt(week))

    return NextResponse.json({ matchups })
  } catch (error) {
    console.error("Error fetching matchups:", error)
    return NextResponse.json({ error: "Failed to fetch matchups" }, { status: 500 })
  }
}
