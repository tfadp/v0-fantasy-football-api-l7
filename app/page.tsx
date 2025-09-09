"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, Mail, TrendingUp, Users, AlertCircle } from "lucide-react"
import { SetupInstructions } from "@/components/setup-instructions"
import { TestingPanel } from "@/components/testing-panel"
import { WeeklyReport } from "@/components/weekly-report"
import { WaiverWireRecommendations } from "@/components/waiver-wire-recommendations"
import { ScheduleManager } from "@/components/schedule-manager"

export default function FantasyFootballDashboard() {
  const [isConnected, setIsConnected] = useState(false)
  const [leagues, setLeagues] = useState([])
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState("Not Connected")
  const [debugInfo, setDebugInfo] = useState("")

  const handleYahooConnect = async () => {
    try {
      console.log("[v0] Starting Yahoo connection...")
      setDebugInfo("Connecting to Yahoo...")

      const response = await fetch("/api/auth/yahoo")
      const data = await response.json()

      if (data.authUrl) {
        console.log("[v0] Redirecting to Yahoo auth:", data.authUrl)
        window.location.href = data.authUrl
      } else {
        throw new Error("No auth URL received")
      }
    } catch (error) {
      console.log("[v0] Yahoo connection error:", error)
      setDebugInfo(`Connection failed: ${error.message}`)
      setConnectionStatus("Connection Failed")
    }
  }

  const testConnection = async () => {
    try {
      console.log("[v0] Testing Yahoo API connection...")
      setDebugInfo("Testing connection...")

      const response = await fetch("/api/fantasy/leagues")
      const data = await response.json()

      console.log("[v0] API response:", data)

      if (data.leagues && data.leagues.length > 0) {
        setLeagues(data.leagues)
        setIsConnected(true)
        setConnectionStatus("Connected")
        setDebugInfo(`Found ${data.leagues.length} leagues`)
      } else {
        setDebugInfo("No leagues found - may need to authenticate first")
      }
    } catch (error) {
      console.log("[v0] API test error:", error)
      setDebugInfo(`API test failed: ${error.message}`)
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")

    if (code) {
      console.log("[v0] Found auth code, testing connection...")
      setDebugInfo("Authentication successful, testing connection...")
      setTimeout(testConnection, 1000)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Fantasy Football Automation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automated weekly game summaries and waiver wire analysis for your Yahoo Fantasy Football league
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Status: {connectionStatus}</AlertTitle>
          <AlertDescription>
            {!isConnected ? (
              <div className="space-y-2">
                <p>Connect to your Yahoo Fantasy league to start generating reports.</p>
                <button
                  onClick={handleYahooConnect}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Connect to Yahoo Fantasy
                </button>
                <button
                  onClick={testConnection}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-2"
                >
                  Test Connection
                </button>
                {debugInfo && <p className="text-sm text-muted-foreground mt-2">Debug: {debugInfo}</p>}
              </div>
            ) : (
              <div>
                <p>✅ Connected! Found {leagues.length} leagues.</p>
                {leagues.map((league, index) => (
                  <p key={index} className="text-sm">
                    League: {league.name || `League ${index + 1}`}
                  </p>
                ))}
              </div>
            )}
          </AlertDescription>
        </Alert>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yahoo API</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isConnected ? "Connected" : "Not Connected"}</div>
              <Badge variant={isConnected ? "default" : "secondary"} className="mt-2">
                {connectionStatus}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Reports</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Reports sent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Report</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Tuesday</div>
              <p className="text-xs text-muted-foreground">10:00 AM EST</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waiver Analysis</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ready</div>
              <Badge variant="secondary" className="mt-2">
                Configured
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="waiver">Waiver Wire</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <SetupInstructions />
          </TabsContent>

          <TabsContent value="testing">
            <TestingPanel />
          </TabsContent>

          <TabsContent value="reports">
            <WeeklyReport />
          </TabsContent>

          <TabsContent value="waiver">
            <WaiverWireRecommendations recommendations={[]} />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
