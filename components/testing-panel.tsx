"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, CheckCircle, XCircle, Loader2, Mail, TrendingUp, Users } from "lucide-react"
import { useState } from "react"

interface TestResult {
  status: "idle" | "loading" | "success" | "error"
  message?: string
}

export function TestingPanel() {
  const [yahooTest, setYahooTest] = useState<TestResult>({ status: "idle" })
  const [emailTest, setEmailTest] = useState<TestResult>({ status: "idle" })
  const [waiverTest, setWaiverTest] = useState<TestResult>({ status: "idle" })

  const testYahooConnection = async () => {
    setYahooTest({ status: "loading" })
    try {
      const response = await fetch("/api/fantasy/leagues")
      if (response.ok) {
        setYahooTest({ status: "success", message: "Successfully connected to Yahoo Fantasy API" })
      } else {
        setYahooTest({ status: "error", message: "Failed to connect. Check your credentials." })
      }
    } catch (error) {
      setYahooTest({ status: "error", message: "Connection error. Check your setup." })
    }
  }

  const testEmailDelivery = async () => {
    setEmailTest({ status: "loading" })
    try {
      const response = await fetch("/api/email/test", { method: "POST" })
      if (response.ok) {
        setEmailTest({ status: "success", message: "Test email sent successfully!" })
      } else {
        setEmailTest({ status: "error", message: "Failed to send email. Check SMTP settings." })
      }
    } catch (error) {
      setEmailTest({ status: "error", message: "Email service error. Check configuration." })
    }
  }

  const testWaiverAnalysis = async () => {
    setWaiverTest({ status: "loading" })
    try {
      const response = await fetch("/api/waiver-wire/analyze")
      if (response.ok) {
        setWaiverTest({ status: "success", message: "Waiver wire analysis completed successfully!" })
      } else {
        setWaiverTest({ status: "error", message: "Analysis failed. Check API connections." })
      }
    } catch (error) {
      setWaiverTest({ status: "error", message: "Analysis service error." })
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Play className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "loading":
        return <Badge variant="secondary">Testing...</Badge>
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Success
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Ready</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Play className="h-4 w-4" />
        <AlertDescription>
          Test each component to ensure your fantasy football automation is working correctly.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Yahoo API
            </CardTitle>
            <CardDescription>Test connection to Yahoo Fantasy Football</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              {getStatusBadge(yahooTest.status)}
            </div>
            <Button onClick={testYahooConnection} disabled={yahooTest.status === "loading"} className="w-full">
              {getStatusIcon(yahooTest.status)}
              Test Connection
            </Button>
            {yahooTest.message && (
              <p className={`text-sm ${yahooTest.status === "success" ? "text-green-600" : "text-red-600"}`}>
                {yahooTest.message}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Service
            </CardTitle>
            <CardDescription>Test email delivery system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              {getStatusBadge(emailTest.status)}
            </div>
            <Button onClick={testEmailDelivery} disabled={emailTest.status === "loading"} className="w-full">
              {getStatusIcon(emailTest.status)}
              Send Test Email
            </Button>
            {emailTest.message && (
              <p className={`text-sm ${emailTest.status === "success" ? "text-green-600" : "text-red-600"}`}>
                {emailTest.message}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Waiver Analysis
            </CardTitle>
            <CardDescription>Test waiver wire recommendation engine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              {getStatusBadge(waiverTest.status)}
            </div>
            <Button onClick={testWaiverAnalysis} disabled={waiverTest.status === "loading"} className="w-full">
              {getStatusIcon(waiverTest.status)}
              Test Analysis
            </Button>
            {waiverTest.message && (
              <p className={`text-sm ${waiverTest.status === "success" ? "text-green-600" : "text-red-600"}`}>
                {waiverTest.message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Test</CardTitle>
          <CardDescription>Test the complete workflow from data collection to email delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button size="lg" className="w-full">
                Generate Sample Weekly Report
              </Button>
              <Button size="lg" variant="outline" className="w-full bg-transparent">
                Generate Sample Waiver Alert
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              These will generate sample reports using mock data to test the complete system
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
