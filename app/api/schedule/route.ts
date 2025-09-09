import { type NextRequest, NextResponse } from "next/server"
import { globalScheduler } from "@/lib/scheduler"

export async function GET() {
  const schedules = globalScheduler.getAllSchedules()
  const history = globalScheduler.getRecentHistory(30) // Last 30 days

  return NextResponse.json({
    schedules,
    history,
    nextRuns: {
      weeklyReport: globalScheduler.getNextScheduledRun("weekly-report"),
      waiverWireAlert: globalScheduler.getNextScheduledRun("waiver-wire-alert"),
    },
    currentWeek: globalScheduler.getCurrentWeek(),
  })
}

export async function POST(request: NextRequest) {
  const { leagueKey, recipientEmail, enabled, weeklyReports, waiverWireAlerts, timezone } = await request.json()

  if (!leagueKey || !recipientEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const schedule = {
    leagueKey,
    recipientEmail,
    enabled: enabled ?? true,
    weeklyReports: weeklyReports ?? true,
    waiverWireAlerts: waiverWireAlerts ?? true,
    timezone: timezone ?? "America/New_York",
  }

  globalScheduler.addSchedule(leagueKey, schedule)

  return NextResponse.json({ success: true, schedule })
}

export async function PUT(request: NextRequest) {
  const { leagueKey, ...updates } = await request.json()

  if (!leagueKey) {
    return NextResponse.json({ error: "Missing leagueKey" }, { status: 400 })
  }

  const existingSchedule = globalScheduler.getSchedule(leagueKey)
  if (!existingSchedule) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
  }

  globalScheduler.updateSchedule(leagueKey, updates)

  return NextResponse.json({ success: true, schedule: globalScheduler.getSchedule(leagueKey) })
}

export async function DELETE(request: NextRequest) {
  const { leagueKey } = await request.json()

  if (!leagueKey) {
    return NextResponse.json({ error: "Missing leagueKey" }, { status: 400 })
  }

  globalScheduler.removeSchedule(leagueKey)

  return NextResponse.json({ success: true })
}
