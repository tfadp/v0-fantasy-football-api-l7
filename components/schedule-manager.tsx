"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Mail, Settings, CheckCircle, XCircle } from "lucide-react"
import type { ScheduleConfig, NotificationHistory } from "@/lib/scheduler"

interface ScheduleData {
  schedules: ScheduleConfig[]
  history: NotificationHistory[]
  nextRuns: {
    weeklyReport: string
    waiverWireAlert: string
  }
  currentWeek: number
}

export function ScheduleManager() {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newSchedule, setNewSchedule] = useState({
    leagueKey: "",
    recipientEmail: "",
    enabled: true,
    weeklyReports: true,
    waiverWireAlerts: true,
  })

  useEffect(() => {
    fetchScheduleData()
  }, [])

  const fetchScheduleData = async () => {
    try {
      const response = await fetch("/api/schedule")
      const data = await response.json()
      setScheduleData(data)
    } catch (error) {
      console.error("Failed to fetch schedule data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createSchedule = async () => {
    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchedule),
      })

      if (response.ok) {
        await fetchScheduleData()
        setNewSchedule({
          leagueKey: "",
          recipientEmail: "",
          enabled: true,
          weeklyReports: true,
          waiverWireAlerts: true,
        })
      }
    } catch (error) {
      console.error("Failed to create schedule:", error)
    }
  }

  const updateSchedule = async (leagueKey: string, updates: Partial<ScheduleConfig>) => {
    try {
      const response = await fetch("/api/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leagueKey, ...updates }),
      })

      if (response.ok) {
        await fetchScheduleData()
      }
    } catch (error) {
      console.error("Failed to update schedule:", error)
    }
  }

  const deleteSchedule = async (leagueKey: string) => {
    try {
      const response = await fetch("/api/schedule", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leagueKey }),
      })

      if (response.ok) {
        await fetchScheduleData()
      }
    } catch (error) {
      console.error("Failed to delete schedule:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-48 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Schedule Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Week {scheduleData?.currentWeek}</div>
            <p className="text-xs text-muted-foreground">NFL Season</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Weekly Report</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {scheduleData?.nextRuns.weeklyReport
                ? new Date(scheduleData.nextRuns.weeklyReport).toLocaleDateString()
                : "Not scheduled"}
            </div>
            <p className="text-xs text-muted-foreground">Tuesday 10:00 AM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Waiver Alert</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {scheduleData?.nextRuns.waiverWireAlert
                ? new Date(scheduleData.nextRuns.waiverWireAlert).toLocaleDateString()
                : "Not scheduled"}
            </div>
            <p className="text-xs text-muted-foreground">Wednesday 8:00 AM</p>
          </CardContent>
        </Card>
      </div>

      {/* Create New Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Create New Schedule
          </CardTitle>
          <CardDescription>Set up automated reports for a fantasy league</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leagueKey">League Key</Label>
              <Input
                id="leagueKey"
                placeholder="e.g., 414.l.123456"
                value={newSchedule.leagueKey}
                onChange={(e) => setNewSchedule({ ...newSchedule, leagueKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={newSchedule.recipientEmail}
                onChange={(e) => setNewSchedule({ ...newSchedule, recipientEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="weeklyReports"
                  checked={newSchedule.weeklyReports}
                  onCheckedChange={(checked) => setNewSchedule({ ...newSchedule, weeklyReports: checked })}
                />
                <Label htmlFor="weeklyReports">Weekly Reports (Tuesdays)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="waiverAlerts"
                  checked={newSchedule.waiverWireAlerts}
                  onCheckedChange={(checked) => setNewSchedule({ ...newSchedule, waiverWireAlerts: checked })}
                />
                <Label htmlFor="waiverAlerts">Waiver Wire Alerts (Wednesdays)</Label>
              </div>
            </div>
            <Button onClick={createSchedule} disabled={!newSchedule.leagueKey || !newSchedule.recipientEmail}>
              Create Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Schedules */}
      <Card>
        <CardHeader>
          <CardTitle>Active Schedules</CardTitle>
          <CardDescription>Manage your automated fantasy football notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {scheduleData?.schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No schedules configured yet.</p>
              <p className="text-sm mt-2">Create your first schedule above to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduleData?.schedules.map((schedule) => (
                <div key={schedule.leagueKey} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{schedule.leagueKey}</h4>
                      <p className="text-sm text-muted-foreground">{schedule.recipientEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={schedule.enabled ? "default" : "secondary"}>
                        {schedule.enabled ? "Active" : "Disabled"}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => deleteSchedule(schedule.leagueKey)}>
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={schedule.enabled}
                        onCheckedChange={(checked) => updateSchedule(schedule.leagueKey, { enabled: checked })}
                      />
                      <Label>Enabled</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={schedule.weeklyReports}
                        onCheckedChange={(checked) => updateSchedule(schedule.leagueKey, { weeklyReports: checked })}
                      />
                      <Label>Weekly Reports</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={schedule.waiverWireAlerts}
                        onCheckedChange={(checked) => updateSchedule(schedule.leagueKey, { waiverWireAlerts: checked })}
                      />
                      <Label>Waiver Alerts</Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 30 days of automated notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {scheduleData?.history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduleData?.history.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    {entry.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {entry.type === "weekly-report" ? "Weekly Report" : "Waiver Wire Alert"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.leagueKey} • Week {entry.week}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{new Date(entry.sentAt).toLocaleDateString()}</p>
                    {entry.error && <p className="text-xs text-red-500">{entry.error}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
