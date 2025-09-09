import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Zap } from "lucide-react"
import type { GameSummary } from "@/lib/game-analyzer"

interface GameSummaryProps {
  game: GameSummary
}

export function GameSummaryCard({ game }: GameSummaryProps) {
  const getRoastIcon = (level: string) => {
    switch (level) {
      case "spicy":
        return <Zap className="h-4 w-4 text-red-500" />
      case "medium":
        return <Target className="h-4 w-4 text-orange-500" />
      default:
        return <Trophy className="h-4 w-4 text-blue-500" />
    }
  }

  const getRoastColor = (level: string) => {
    switch (level) {
      case "spicy":
        return "destructive"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {game.winner.team.name} vs {game.loser.team.name}
          </CardTitle>
          <Badge variant={getRoastColor(game.roastLevel)} className="flex items-center gap-1">
            {getRoastIcon(game.roastLevel)}
            {game.roastLevel}
          </Badge>
        </div>
        <CardDescription className="flex items-center justify-between text-base">
          <span className="font-semibold text-green-600">
            {game.winner.team.name}: {game.winner.points.toFixed(1)}
          </span>
          <span className="text-muted-foreground">vs</span>
          <span className="font-semibold text-red-600">
            {game.loser.team.name}: {game.loser.points.toFixed(1)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground">{game.summary}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Point Differential: {game.pointDifferential.toFixed(1)}</span>
          <span>Week {game.week}</span>
        </div>
      </CardContent>
    </Card>
  )
}
