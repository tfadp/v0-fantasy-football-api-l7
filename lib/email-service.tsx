import nodemailer from "nodemailer"
import type { WeeklyReport } from "./game-analyzer"

export interface EmailConfig {
  host: string
  port: number
  user: string
  pass: string
  from: string
}

export interface WaiverWireRecommendation {
  playerName: string
  position: string
  team: string
  reason: string
  priority: "high" | "medium" | "low"
  percentOwned: number
}

export class EmailService {
  private transporter: nodemailer.Transporter
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
    this.transporter = nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    })
  }

  async sendWeeklyReport(report: WeeklyReport, recipientEmail: string): Promise<void> {
    const subject = `Week ${report.week} Fantasy Football Report: ${report.leagueName}`
    const htmlContent = this.generateWeeklyReportHTML(report)
    const textContent = this.generateWeeklyReportText(report)

    await this.transporter.sendMail({
      from: this.config.from,
      to: recipientEmail,
      subject,
      html: htmlContent,
      text: textContent,
    })
  }

  async sendWaiverWireAlert(
    recommendations: WaiverWireRecommendation[],
    leagueName: string,
    week: number,
    recipientEmail: string,
  ): Promise<void> {
    const subject = `Week ${week + 1} Waiver Wire Alert: ${leagueName}`
    const htmlContent = this.generateWaiverWireHTML(recommendations, leagueName, week)
    const textContent = this.generateWaiverWireText(recommendations, leagueName, week)

    await this.transporter.sendMail({
      from: this.config.from,
      to: recipientEmail,
      subject,
      html: htmlContent,
      text: textContent,
    })
  }

  private generateWeeklyReportHTML(report: WeeklyReport): string {
    const gameCards = report.games
      .map(
        (game) => `
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 16px 0; border-left: 4px solid ${this.getRoastColor(game.roastLevel)};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; color: #1a1a1a; font-size: 18px;">${game.winner.team.name} vs ${game.loser.team.name}</h3>
            <span style="background: ${this.getRoastBadgeColor(game.roastLevel)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">
              ${game.roastLevel}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-weight: bold;">
            <span style="color: #22c55e;">${game.winner.team.name}: ${game.winner.points.toFixed(1)}</span>
            <span style="color: #6b7280;">vs</span>
            <span style="color: #ef4444;">${game.loser.team.name}: ${game.loser.points.toFixed(1)}</span>
          </div>
          <p style="margin: 0; line-height: 1.6; color: #374151;">${game.summary}</p>
          <div style="margin-top: 12px; font-size: 12px; color: #6b7280;">
            Point Differential: ${game.pointDifferential.toFixed(1)} | Week ${game.week}
          </div>
        </div>
      `,
      )
      .join("")

    const highlights = `
      <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 16px 0;">
        <h3 style="margin: 0 0 16px 0; color: #92400e;">🏆 Weekly Highlights</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <strong style="color: #fbbf24;">Highest Score:</strong><br>
            <span style="color: #374151;">${report.weeklyHighlights.highestScore.winner.team.name} - ${report.weeklyHighlights.highestScore.winner.points.toFixed(1)} points</span>
          </div>
          <div>
            <strong style="color: #ef4444;">Lowest Score:</strong><br>
            <span style="color: #374151;">${report.weeklyHighlights.lowestScore.loser.team.name} - ${report.weeklyHighlights.lowestScore.loser.points.toFixed(1)} points</span>
          </div>
          <div>
            <strong style="color: #3b82f6;">Closest Game:</strong><br>
            <span style="color: #374151;">${report.weeklyHighlights.closestGame.pointDifferential.toFixed(1)} point difference</span>
          </div>
          <div>
            <strong style="color: #f97316;">Biggest Blowout:</strong><br>
            <span style="color: #374151;">${report.weeklyHighlights.biggestBlowout.pointDifferential.toFixed(1)} point difference</span>
          </div>
        </div>
      </div>
    `

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Week ${report.week} Fantasy Football Report</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1a1a1a; margin: 0 0 8px 0; font-size: 28px;">🏈 ${report.leagueName}</h1>
          <h2 style="color: #6b7280; margin: 0; font-weight: normal; font-size: 20px;">Week ${report.week} Report</h2>
        </div>

        <div style="background: #e0f2fe; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #0284c7;">
          <p style="margin: 0; font-size: 16px; line-height: 1.6;">${report.overallSummary}</p>
        </div>

        ${highlights}

        <h3 style="color: #1a1a1a; margin: 32px 0 16px 0; font-size: 22px;">Game Summaries</h3>
        ${gameCards}

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Generated by Fantasy Football Automation<br>
            May your waiver wire picks be ever in your favor 🙏
          </p>
        </div>

      </body>
      </html>
    `
  }

  private generateWeeklyReportText(report: WeeklyReport): string {
    let text = `${report.leagueName} - Week ${report.week} Report\n`
    text += "=".repeat(50) + "\n\n"
    text += `${report.overallSummary}\n\n`

    text += "WEEKLY HIGHLIGHTS\n"
    text += "-".repeat(20) + "\n"
    text += `Highest Score: ${report.weeklyHighlights.highestScore.winner.team.name} - ${report.weeklyHighlights.highestScore.winner.points.toFixed(1)} points\n`
    text += `Lowest Score: ${report.weeklyHighlights.lowestScore.loser.team.name} - ${report.weeklyHighlights.lowestScore.loser.points.toFixed(1)} points\n`
    text += `Closest Game: ${report.weeklyHighlights.closestGame.pointDifferential.toFixed(1)} point difference\n`
    text += `Biggest Blowout: ${report.weeklyHighlights.biggestBlowout.pointDifferential.toFixed(1)} point difference\n\n`

    text += "GAME SUMMARIES\n"
    text += "-".repeat(20) + "\n"

    for (const game of report.games) {
      text += `${game.winner.team.name} vs ${game.loser.team.name}\n`
      text += `${game.winner.team.name}: ${game.winner.points.toFixed(1)} | ${game.loser.team.name}: ${game.loser.points.toFixed(1)}\n`
      text += `${game.summary}\n\n`
    }

    text += "Generated by Fantasy Football Automation\n"
    text += "May your waiver wire picks be ever in your favor!"

    return text
  }

  private generateWaiverWireHTML(
    recommendations: WaiverWireRecommendation[],
    leagueName: string,
    week: number,
  ): string {
    const playerCards = recommendations
      .map(
        (player) => `
        <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 12px 0; border-left: 4px solid ${this.getPriorityColor(player.priority)};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h4 style="margin: 0; color: #1a1a1a; font-size: 16px;">${player.playerName}</h4>
            <span style="background: ${this.getPriorityBadgeColor(player.priority)}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; text-transform: uppercase;">
              ${player.priority}
            </span>
          </div>
          <div style="margin-bottom: 8px; color: #6b7280; font-size: 14px;">
            ${player.position} - ${player.team} | ${player.percentOwned}% owned
          </div>
          <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">${player.reason}</p>
        </div>
      `,
      )
      .join("")

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Week ${week + 1} Waiver Wire Alert</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1a1a1a; margin: 0 0 8px 0; font-size: 28px;">📈 Waiver Wire Alert</h1>
          <h2 style="color: #6b7280; margin: 0; font-weight: normal; font-size: 20px;">${leagueName} - Week ${week + 1}</h2>
        </div>

        <div style="background: #dcfce7; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #16a34a;">
          <p style="margin: 0; font-size: 16px; line-height: 1.6;">
            Time to work the waiver wire! Here are this week's top pickups based on expert analysis and availability in your league.
            Remember: fortune favors the bold, but also the ones who set their alarms for 3 AM on Wednesday.
          </p>
        </div>

        <h3 style="color: #1a1a1a; margin: 32px 0 16px 0; font-size: 22px;">Recommended Pickups</h3>
        ${playerCards}

        <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <h4 style="margin: 0 0 8px 0; color: #92400e;">💡 Pro Tips</h4>
          <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px;">
            <li>Prioritize high-priority pickups - they won't last long</li>
            <li>Check injury reports before submitting claims</li>
            <li>Consider your team's bye weeks and upcoming matchups</li>
            <li>Don't be afraid to drop underperforming "name" players</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Generated by Fantasy Football Automation<br>
            Good luck on the waiver wire! 🍀
          </p>
        </div>

      </body>
      </html>
    `
  }

  private generateWaiverWireText(
    recommendations: WaiverWireRecommendation[],
    leagueName: string,
    week: number,
  ): string {
    let text = `WAIVER WIRE ALERT - ${leagueName} - Week ${week + 1}\n`
    text += "=".repeat(50) + "\n\n"
    text +=
      "Time to work the waiver wire! Here are this week's top pickups based on expert analysis and availability in your league.\n\n"

    text += "RECOMMENDED PICKUPS\n"
    text += "-".repeat(20) + "\n"

    for (const player of recommendations) {
      text += `${player.playerName} (${player.position} - ${player.team}) [${player.priority.toUpperCase()} PRIORITY]\n`
      text += `${player.percentOwned}% owned | ${player.reason}\n\n`
    }

    text += "PRO TIPS\n"
    text += "-".repeat(10) + "\n"
    text += "• Prioritize high-priority pickups - they won't last long\n"
    text += "• Check injury reports before submitting claims\n"
    text += "• Consider your team's bye weeks and upcoming matchups\n"
    text += "• Don't be afraid to drop underperforming 'name' players\n\n"

    text += "Generated by Fantasy Football Automation\n"
    text += "Good luck on the waiver wire!"

    return text
  }

  private getRoastColor(level: string): string {
    switch (level) {
      case "spicy":
        return "#ef4444"
      case "medium":
        return "#f97316"
      default:
        return "#3b82f6"
    }
  }

  private getRoastBadgeColor(level: string): string {
    switch (level) {
      case "spicy":
        return "#dc2626"
      case "medium":
        return "#ea580c"
      default:
        return "#2563eb"
    }
  }

  private getPriorityColor(priority: string): string {
    switch (priority) {
      case "high":
        return "#dc2626"
      case "medium":
        return "#f59e0b"
      default:
        return "#10b981"
    }
  }

  private getPriorityBadgeColor(priority: string): string {
    switch (priority) {
      case "high":
        return "#b91c1c"
      case "medium":
        return "#d97706"
      default:
        return "#059669"
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error("Email service connection test failed:", error)
      return false
    }
  }
}
