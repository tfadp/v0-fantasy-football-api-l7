"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Target, AlertTriangle } from "lucide-react"
import type { WaiverWireRecommendation } from "@/lib/email-service"

interface WaiverWireRecommendationsProps {
  recommendations: WaiverWireRecommendation[]
  onSendAlert?: () => void
  isLoading?: boolean
}

export function WaiverWireRecommendations({
  recommendations,
  onSendAlert,
  isLoading = false,
}: WaiverWireRecommendationsProps) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "medium":
        return <Target className="h-4 w-4 text-orange-500" />
      default:
        return <TrendingUp className="h-4 w-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getPositionColor = (position: string) => {
    const colors = {
      QB: "bg-purple-100 text-purple-800",
      RB: "bg-green-100 text-green-800",
      WR: "bg-blue-100 text-blue-800",
      TE: "bg-orange-100 text-orange-800",
      K: "bg-gray-100 text-gray-800",
      DEF: "bg-red-100 text-red-800",
    }
    return colors[position as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No waiver wire recommendations available.</p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Check back after the games finish for updated recommendations.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Waiver Wire Recommendations</h3>
          <p className="text-muted-foreground">Based on expert analysis and league availability</p>
        </div>
        {onSendAlert && (
          <Button onClick={onSendAlert} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Alert Email"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {recommendations.map((player, index) => (
          <Card key={`${player.playerName}-${index}`} className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <CardTitle className="text-lg">{player.playerName}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getPositionColor(player.position)}>
                        {player.position}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{player.team}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={getPriorityColor(player.priority)} className="flex items-center gap-1">
                  {getPriorityIcon(player.priority)}
                  {player.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground mb-3">{player.reason}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {player.percentOwned}% owned
                </span>
                <span className="font-medium">Priority: {player.priority.toUpperCase()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Waiver Wire Strategy Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>High priority players won't last long - submit claims early</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <span>Check injury reports and snap counts before claiming</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Consider upcoming matchups and bye weeks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">•</span>
              <span>Don't be afraid to drop underperforming "name" players</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
