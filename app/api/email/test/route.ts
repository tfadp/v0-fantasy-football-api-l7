import { type NextRequest, NextResponse } from "next/server"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  const { recipientEmail } = await request.json()

  if (!recipientEmail) {
    return NextResponse.json({ error: "Missing recipient email" }, { status: 400 })
  }

  // Validate email environment variables
  const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    return NextResponse.json({ error: `Missing email configuration: ${missingVars.join(", ")}` }, { status: 500 })
  }

  try {
    const emailService = new EmailService({
      host: process.env.SMTP_HOST!,
      port: Number.parseInt(process.env.SMTP_PORT!),
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
      from: process.env.SMTP_USER!,
    })

    // Test connection
    const isConnected = await emailService.testConnection()

    if (!isConnected) {
      return NextResponse.json({ error: "Failed to connect to email service" }, { status: 500 })
    }

    // Send test email
    await emailService.sendWeeklyReport(
      {
        week: 1,
        season: "2024",
        leagueName: "Test League",
        games: [
          {
            matchupId: "test-1",
            week: 1,
            winner: {
              team: {
                team_key: "test1",
                team_id: "1",
                name: "Test Team 1",
                owner_name: "Owner 1",
                wins: 1,
                losses: 0,
                ties: 0,
                points_for: 120,
                points_against: 100,
              },
              points: 120.5,
            },
            loser: {
              team: {
                team_key: "test2",
                team_id: "2",
                name: "Test Team 2",
                owner_name: "Owner 2",
                wins: 0,
                losses: 1,
                ties: 0,
                points_for: 100,
                points_against: 120,
              },
              points: 95.3,
            },
            pointDifferential: 25.2,
            summary:
              "This is a test game summary to verify email formatting works correctly. Test Team 1 dominated Test Team 2 in this sample matchup.",
            roastLevel: "medium",
          },
        ],
        weeklyHighlights: {
          highestScore: {
            matchupId: "test-1",
            week: 1,
            winner: {
              team: {
                team_key: "test1",
                team_id: "1",
                name: "Test Team 1",
                owner_name: "Owner 1",
                wins: 1,
                losses: 0,
                ties: 0,
                points_for: 120,
                points_against: 100,
              },
              points: 120.5,
            },
            loser: {
              team: {
                team_key: "test2",
                team_id: "2",
                name: "Test Team 2",
                owner_name: "Owner 2",
                wins: 0,
                losses: 1,
                ties: 0,
                points_for: 100,
                points_against: 120,
              },
              points: 95.3,
            },
            pointDifferential: 25.2,
            summary: "Test summary",
            roastLevel: "medium",
          },
          lowestScore: {
            matchupId: "test-1",
            week: 1,
            winner: {
              team: {
                team_key: "test1",
                team_id: "1",
                name: "Test Team 1",
                owner_name: "Owner 1",
                wins: 1,
                losses: 0,
                ties: 0,
                points_for: 120,
                points_against: 100,
              },
              points: 120.5,
            },
            loser: {
              team: {
                team_key: "test2",
                team_id: "2",
                name: "Test Team 2",
                owner_name: "Owner 2",
                wins: 0,
                losses: 1,
                ties: 0,
                points_for: 100,
                points_against: 120,
              },
              points: 95.3,
            },
            pointDifferential: 25.2,
            summary: "Test summary",
            roastLevel: "medium",
          },
          closestGame: {
            matchupId: "test-1",
            week: 1,
            winner: {
              team: {
                team_key: "test1",
                team_id: "1",
                name: "Test Team 1",
                owner_name: "Owner 1",
                wins: 1,
                losses: 0,
                ties: 0,
                points_for: 120,
                points_against: 100,
              },
              points: 120.5,
            },
            loser: {
              team: {
                team_key: "test2",
                team_id: "2",
                name: "Test Team 2",
                owner_name: "Owner 2",
                wins: 0,
                losses: 1,
                ties: 0,
                points_for: 100,
                points_against: 120,
              },
              points: 95.3,
            },
            pointDifferential: 25.2,
            summary: "Test summary",
            roastLevel: "medium",
          },
          biggestBlowout: {
            matchupId: "test-1",
            week: 1,
            winner: {
              team: {
                team_key: "test1",
                team_id: "1",
                name: "Test Team 1",
                owner_name: "Owner 1",
                wins: 1,
                losses: 0,
                ties: 0,
                points_for: 120,
                points_against: 100,
              },
              points: 120.5,
            },
            loser: {
              team: {
                team_key: "test2",
                team_id: "2",
                name: "Test Team 2",
                owner_name: "Owner 2",
                wins: 0,
                losses: 1,
                ties: 0,
                points_for: 100,
                points_against: 120,
              },
              points: 95.3,
            },
            pointDifferential: 25.2,
            summary: "Test summary",
            roastLevel: "medium",
          },
        },
        overallSummary:
          "This is a test weekly summary to verify that the email system is working correctly. All systems are operational!",
      },
      recipientEmail,
    )

    return NextResponse.json({ success: true, message: "Test email sent successfully" })
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
}
