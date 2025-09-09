import { type NextRequest, NextResponse } from "next/server"
import { YahooFantasyAPI } from "@/lib/yahoo-api"

export async function GET(request: NextRequest) {
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
    const leagues = await yahooAPI.getUserLeagues()

    return NextResponse.json({ leagues })
  } catch (error) {
    console.error("Error fetching leagues:", error)
    return NextResponse.json({ error: "Failed to fetch leagues" }, { status: 500 })
  }
}
