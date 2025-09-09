"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Copy, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { useState } from "react"

export function SetupInstructions() {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const envVars = [
    {
      key: "YAHOO_CLIENT_ID",
      value: "dj0yJmk9UkYwSkNTODhOeG5PJmQ9WVdrOWNIQnFOVGRzTjNBbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWQz",
      description: "Your Yahoo App Consumer Key",
    },
    {
      key: "YAHOO_CLIENT_SECRET",
      value: "[Your Client Secret from Yahoo]",
      description: "Your Yahoo App Consumer Secret (not provided yet)",
    },
    {
      key: "YAHOO_REDIRECT_URI",
      value: "https://your-app.vercel.app/api/auth/yahoo",
      description: "OAuth redirect URI (update with your domain)",
    },
    {
      key: "SMTP_HOST",
      value: "smtp.gmail.com",
      description: "Email server (Gmail example)",
    },
    {
      key: "SMTP_PORT",
      value: "587",
      description: "Email server port",
    },
    {
      key: "SMTP_USER",
      value: "your-email@gmail.com",
      description: "Your email address",
    },
    {
      key: "SMTP_PASS",
      value: "your-app-password",
      description: "Email app password",
    },
    {
      key: "CRON_SECRET",
      value: "your-random-secret-key",
      description: "Secret key for cron job security",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Yahoo Fantasy API Setup
          </CardTitle>
          <CardDescription>Your Yahoo app is registered! Here are your credentials:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">App ID:</span>
              <code className="text-sm">ppj57l7p</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Client ID:</span>
              <div className="flex items-center gap-2">
                <code className="text-sm">dj0yJmk9UkYwSkNTODhOeG5P...</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    copyToClipboard(
                      "dj0yJmk9UkYwSkNTODhOeG5PJmQ9WVdrOWNIQnFOVGRzTjNBbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWQz",
                      "client_id",
                    )
                  }
                >
                  {copiedField === "client_id" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Missing Client Secret</AlertTitle>
            <AlertDescription>
              You'll need to get your Client Secret from the Yahoo Developer Console.
              <Button variant="link" className="p-0 h-auto" asChild>
                <a href="https://developer.yahoo.com/apps/" target="_blank" rel="noopener noreferrer">
                  Visit Yahoo Developer Console <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Setup</CardTitle>
          <CardDescription>Add these environment variables to your Vercel project settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {envVars.map((envVar) => (
              <div key={envVar.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-mono text-sm font-medium">{envVar.key}</div>
                  <div className="text-xs text-muted-foreground">{envVar.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded max-w-48 truncate">{envVar.value}</code>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(envVar.value, envVar.key)}>
                    {copiedField === envVar.key ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-medium mb-2">Quick Setup Steps:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Get your Client Secret from Yahoo Developer Console</li>
              <li>Copy these environment variables to your Vercel project</li>
              <li>Set up your email SMTP credentials (Gmail recommended)</li>
              <li>Generate a random CRON_SECRET for security</li>
              <li>Update YAHOO_REDIRECT_URI with your actual domain</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>Complete these steps to activate your automation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline">1</Badge>
              <span>Add environment variables to Vercel</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">2</Badge>
              <span>Test Yahoo API connection</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">3</Badge>
              <span>Configure email settings</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">4</Badge>
              <span>Test email delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">5</Badge>
              <span>Enable automated scheduling</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
