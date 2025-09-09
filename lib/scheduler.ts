export interface ScheduleConfig {
  leagueKey: string
  recipientEmail: string
  enabled: boolean
  weeklyReports: boolean
  waiverWireAlerts: boolean
  timezone: string
}

export interface NotificationHistory {
  id: string
  type: "weekly-report" | "waiver-wire-alert"
  leagueKey: string
  week: number
  sentAt: Date
  status: "success" | "failed"
  error?: string
}

export class ScheduleManager {
  private schedules: Map<string, ScheduleConfig> = new Map()
  private history: NotificationHistory[] = []

  addSchedule(leagueKey: string, config: ScheduleConfig): void {
    this.schedules.set(leagueKey, config)
  }

  getSchedule(leagueKey: string): ScheduleConfig | undefined {
    return this.schedules.get(leagueKey)
  }

  updateSchedule(leagueKey: string, updates: Partial<ScheduleConfig>): void {
    const existing = this.schedules.get(leagueKey)
    if (existing) {
      this.schedules.set(leagueKey, { ...existing, ...updates })
    }
  }

  removeSchedule(leagueKey: string): void {
    this.schedules.delete(leagueKey)
  }

  getAllSchedules(): ScheduleConfig[] {
    return Array.from(this.schedules.values())
  }

  getEnabledSchedules(): ScheduleConfig[] {
    return this.getAllSchedules().filter((schedule) => schedule.enabled)
  }

  addToHistory(entry: Omit<NotificationHistory, "id">): void {
    const historyEntry: NotificationHistory = {
      ...entry,
      id: `${entry.type}-${entry.leagueKey}-${entry.week}-${Date.now()}`,
    }
    this.history.push(historyEntry)

    // Keep only last 100 entries
    if (this.history.length > 100) {
      this.history = this.history.slice(-100)
    }
  }

  getHistory(leagueKey?: string): NotificationHistory[] {
    if (leagueKey) {
      return this.history.filter((entry) => entry.leagueKey === leagueKey)
    }
    return this.history
  }

  getRecentHistory(days = 7): NotificationHistory[] {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    return this.history.filter((entry) => entry.sentAt >= cutoff)
  }

  getCurrentWeek(): number {
    // Calculate current NFL week (simplified - in production you'd use a more robust calculation)
    const seasonStart = new Date("2024-09-05") // Approximate NFL season start
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - seasonStart.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const week = Math.min(18, Math.max(1, Math.ceil(diffDays / 7)))

    return week
  }

  shouldSendWeeklyReport(leagueKey: string): boolean {
    const schedule = this.getSchedule(leagueKey)
    if (!schedule || !schedule.enabled || !schedule.weeklyReports) {
      return false
    }

    const currentWeek = this.getCurrentWeek()
    const recentReports = this.getHistory(leagueKey).filter(
      (entry) => entry.type === "weekly-report" && entry.week === currentWeek,
    )

    return recentReports.length === 0
  }

  shouldSendWaiverWireAlert(leagueKey: string): boolean {
    const schedule = this.getSchedule(leagueKey)
    if (!schedule || !schedule.enabled || !schedule.waiverWireAlerts) {
      return false
    }

    const currentWeek = this.getCurrentWeek()
    const recentAlerts = this.getHistory(leagueKey).filter(
      (entry) => entry.type === "waiver-wire-alert" && entry.week === currentWeek,
    )

    return recentAlerts.length === 0
  }

  getNextScheduledRun(type: "weekly-report" | "waiver-wire-alert"): Date {
    const now = new Date()
    const nextRun = new Date()

    if (type === "weekly-report") {
      // Tuesday at 10 AM
      nextRun.setDate(now.getDate() + ((2 - now.getDay() + 7) % 7))
      nextRun.setHours(10, 0, 0, 0)
    } else {
      // Wednesday at 8 AM
      nextRun.setDate(now.getDate() + ((3 - now.getDay() + 7) % 7))
      nextRun.setHours(8, 0, 0, 0)
    }

    // If the time has already passed today, schedule for next week
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 7)
    }

    return nextRun
  }
}

// Global scheduler instance
export const globalScheduler = new ScheduleManager()
