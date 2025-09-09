import { type NextRequest, NextResponse } from "next/server"
import { YahooFantasyAPI } from "@/lib/yahoo-api"

const yahooAPI = new YahooFantasyAPI({
  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,
  redirectUri: process.env.YAHOO_REDIRECT_URI!,
})

export async function GET(request: NextRequest) {
  console.log("[v0] Yahoo OAuth request received")
  console.log("[v0] Environment check:", {
    hasClientId: !!process.env.YAHOO_CLIENT_ID,
    hasClientSecret: !!process.env.YAHOO_CLIENT_SECRET,
    hasRedirectUri: !!process.env.YAHOO_REDIRECT_URI,
    redirectUri: process.env.YAHOO_REDIRECT_URI,
  })

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    console.log("[v0] Yahoo OAuth error:", error)
    const errorDescription = searchParams.get("error_description")
    console.log("[v0] Error description:", errorDescription)
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || "")}`,
        request.url,
      ),
    )
  }

  if (!code) {
    // Redirect to Yahoo OAuth
    console.log("[v0] No code, redirecting to Yahoo OAuth")
    const authUrl = yahooAPI.getAuthUrl()
    console.log("[v0] Auth URL:", authUrl)
    return NextResponse.redirect(authUrl)
  }

  try {
    console.log("[v0] Exchanging code for tokens:", code.substring(0, 10) + "...")
    await yahooAPI.exchangeCodeForTokens(code)
    const tokens = yahooAPI.getTokens()

    console.log("[v0] Token exchange successful:", {
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
    })

    // Store tokens securely (you might want to use a database or secure session storage)
    const response = NextResponse.redirect(new URL("/?connected=true", request.url))
    response.cookies.set("yahoo_access_token", tokens.accessToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600, // 1 hour
    })
    response.cookies.set("yahoo_refresh_token", tokens.refreshToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    console.log("[v0] Cookies set, redirecting to home")
    return response
  } catch (error) {
    console.error("[v0] Yahoo OAuth error:", error)
    console.error("[v0] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.redirect(
      new URL(
        `/?error=auth_failed&message=${encodeURIComponent(error instanceof Error ? error.message : "Authentication failed")}`,
        request.url,
      ),
    )
  }
}
