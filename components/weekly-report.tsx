import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GameSummaryCard } from "./game-summary"
import { Trophy, TrendingDown, Target, Zap } from "lucide-react"
import type { WeeklyReport } from "@/lib/game-analyzer"

interface WeeklyReportProps {
  report?: WeeklyReport // Made report prop optional
}

export function WeeklyReportComponent({ report }: WeeklyReportProps) {
  if (!report) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Weekly Report</CardTitle>
            <CardDescription>
              No report data available yet. Complete the setup and run your first analysis to see weekly game summaries
              here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Once configured, this section will display:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Funny two-sentence game summaries</li>
              <li>Weekly highlights and statistics</li>
              <li>Highest and lowest scoring teams</li>
              <li>Closest games and biggest blowouts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {report.leagueName} - Week {report.week} Report
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">{report.overallSummary}</CardDescription>
        </CardHeader>
      </Card>

      {/* Weekly Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Weekly Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">Highest Score</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {report.weeklyHighlights.highestScore.winner.team.name} -{" "}
                {report.weeklyHighlights.highestScore.winner.points.toFixed(1)} points
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="font-semibold">Lowest Score</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {report.weeklyHighlights.lowestScore.loser.team.name} -{" "}
                {report.weeklyHighlights.lowestScore.loser.points.toFixed(1)} points
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">Closest Game</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {report.weeklyHighlights.closestGame.pointDifferential.toFixed(1)} point difference
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Biggest Blowout</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {report.weeklyHighlights.biggestBlowout.pointDifferential.toFixed(1)} point difference
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Summaries */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Game Summaries</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {report.games.map((game) => (
            <GameSummaryCard key={game.matchupId} game={game} />
          ))}
        </div>
      </div>
    </div>
  )
}

export { WeeklyReportComponent as WeeklyReport }
