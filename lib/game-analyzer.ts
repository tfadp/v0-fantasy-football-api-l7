import type { Matchup, Team } from "./yahoo-api"

export interface GameSummary {
  matchupId: string
  week: number
  winner: {
    team: Team
    points: number
  }
  loser: {
    team: Team
    points: number
  }
  pointDifferential: number
  summary: string
  roastLevel: "mild" | "medium" | "spicy"
}

export interface WeeklyReport {
  week: number
  season: string
  leagueName: string
  games: GameSummary[]
  weeklyHighlights: {
    highestScore: GameSummary
    lowestScore: GameSummary
    closestGame: GameSummary
    biggestBlowout: GameSummary
  }
  overallSummary: string
}

export class GameAnalyzer {
  private readonly roastTemplates = {
    blowout: [
      "This wasn't a game, it was a public execution. {winner} absolutely demolished {loser} {winnerScore}-{loserScore}, leaving them questioning their life choices and their lineup decisions.",
      "{winner} showed no mercy in their {winnerScore}-{loserScore} beatdown of {loser}. It was like watching a professional boxer fight a toddler - technically legal, but morally questionable.",
      "In what can only be described as fantasy football war crimes, {winner} obliterated {loser} {winnerScore}-{loserScore}. The Geneva Convention should probably add a clause about this level of domination.",
    ],
    close: [
      "{winner} squeaked by {loser} in a nail-biter, {winnerScore}-{loserScore}. Both teams played like they were trying to lose, but {loser} was just slightly better at it.",
      "In a game that had all the excitement of watching paint dry, {winner} barely edged out {loser} {winnerScore}-{loserScore}. Neither team deserved to win, but someone had to.",
      "{winner} and {loser} engaged in what can generously be called 'football' with {winner} winning {winnerScore}-{loserScore}. It was closer than a family reunion and twice as uncomfortable to watch.",
    ],
    average: [
      "{winner} handled {loser} with a solid {winnerScore}-{loserScore} victory. Nothing spectacular, nothing terrible - just good old-fashioned fantasy football mediocrity at its finest.",
      "In a game that will be forgotten by next Tuesday, {winner} beat {loser} {winnerScore}-{loserScore}. Both teams played exactly as expected, which is to say, disappointingly.",
      "{winner} defeated {loser} {winnerScore}-{loserScore} in what was either a masterclass in strategy or a beautiful disaster. We're still trying to figure out which.",
    ],
    lowScoring: [
      "{winner} 'won' against {loser} {winnerScore}-{loserScore} in a game that made watching grass grow seem exciting. Both teams' offenses were apparently on vacation.",
      "In a battle of who could score fewer points, {winner} lost less badly than {loser}, winning {winnerScore}-{loserScore}. This game was brought to you by the letter 'L' for 'Loser'.",
      "{winner} and {loser} combined for {totalPoints} points, which is coincidentally the same number of people who enjoyed watching this trainwreck. {winner} won {winnerScore}-{loserScore}.",
    ],
    highScoring: [
      "{winner} and {loser} put on an absolute clinic, with {winner} winning {winnerScore}-{loserScore}. This game had more points than a geometry textbook and was twice as entertaining.",
      "In a game that would make video game developers jealous, {winner} outgunned {loser} {winnerScore}-{loserScore}. Both teams apparently forgot that defense was optional, not mandatory.",
      "{winner} survived a shootout against {loser}, winning {winnerScore}-{loserScore}. This game had more scoring than a teenage romance novel and was just as unrealistic.",
    ],
  }

  private readonly weeklyIntros = [
    "Another week, another collection of questionable decisions and shattered dreams.",
    "Welcome to this week's edition of 'How to Disappoint Your Friends and Influence Nobody.'",
    "This week in fantasy football: where hope goes to die and waiver wire pickups go to disappoint.",
    "Gather 'round for another thrilling installment of 'Why We Can't Have Nice Things: Fantasy Edition.'",
    "This week's games brought to you by overconfidence, poor judgment, and the eternal optimism of fantasy football managers.",
  ]

  analyzeWeek(matchups: Matchup[], teams: Team[], week: number, leagueName: string): WeeklyReport {
    const games: GameSummary[] = []

    // Process each matchup
    for (const matchup of matchups) {
      if (matchup.teams.length === 2) {
        const team1 = matchup.teams[0]
        const team2 = matchup.teams[1]

        const winner = team1.points > team2.points ? team1 : team2
        const loser = team1.points > team2.points ? team2 : team1

        const pointDifferential = Math.abs(team1.points - team2.points)

        const gameSummary: GameSummary = {
          matchupId: `${week}-${winner.team.team_key}-${loser.team.team_key}`,
          week,
          winner: {
            team: winner.team,
            points: winner.points,
          },
          loser: {
            team: loser.team,
            points: loser.points,
          },
          pointDifferential,
          summary: this.generateGameSummary(winner, loser, pointDifferential),
          roastLevel: this.determineRoastLevel(winner.points, loser.points, pointDifferential),
        }

        games.push(gameSummary)
      }
    }

    // Calculate weekly highlights
    const highlights = this.calculateWeeklyHighlights(games)

    // Generate overall weekly summary
    const overallSummary = this.generateWeeklySummary(games, week)

    return {
      week,
      season: "2024",
      leagueName,
      games,
      weeklyHighlights: highlights,
      overallSummary,
    }
  }

  private generateGameSummary(
    winner: { team: Team; points: number },
    loser: { team: Team; points: number },
    pointDifferential: number,
  ): string {
    const totalPoints = winner.points + loser.points
    let templates: string[]

    // Determine game type and select appropriate templates
    if (pointDifferential > 40) {
      templates = this.roastTemplates.blowout
    } else if (pointDifferential < 10) {
      templates = this.roastTemplates.close
    } else if (totalPoints < 160) {
      templates = this.roastTemplates.lowScoring
    } else if (totalPoints > 280) {
      templates = this.roastTemplates.highScoring
    } else {
      templates = this.roastTemplates.average
    }

    // Select random template
    const template = templates[Math.floor(Math.random() * templates.length)]

    // Replace placeholders
    return template
      .replace(/{winner}/g, winner.team.name)
      .replace(/{loser}/g, loser.team.name)
      .replace(/{winnerScore}/g, winner.points.toFixed(1))
      .replace(/{loserScore}/g, loser.points.toFixed(1))
      .replace(/{totalPoints}/g, totalPoints.toFixed(1))
  }

  private determineRoastLevel(
    winnerPoints: number,
    loserPoints: number,
    differential: number,
  ): "mild" | "medium" | "spicy" {
    if (differential > 40 || loserPoints < 80) return "spicy"
    if (differential > 20 || winnerPoints > 150) return "medium"
    return "mild"
  }

  private calculateWeeklyHighlights(games: GameSummary[]) {
    const allScores = games.flatMap((game) => [
      { game, team: game.winner.team, points: game.winner.points },
      { game, team: game.loser.team, points: game.loser.points },
    ])

    const highestScore = allScores.reduce((max, current) => (current.points > max.points ? current : max))

    const lowestScore = allScores.reduce((min, current) => (current.points < min.points ? current : min))

    const closestGame = games.reduce((closest, current) =>
      current.pointDifferential < closest.pointDifferential ? current : closest,
    )

    const biggestBlowout = games.reduce((biggest, current) =>
      current.pointDifferential > biggest.pointDifferential ? current : biggest,
    )

    return {
      highestScore: highestScore.game,
      lowestScore: lowestScore.game,
      closestGame,
      biggestBlowout,
    }
  }

  private generateWeeklySummary(games: GameSummary[], week: number): string {
    const intro = this.weeklyIntros[Math.floor(Math.random() * this.weeklyIntros.length)]
    const totalPoints = games.reduce((sum, game) => sum + game.winner.points + game.loser.points, 0)
    const avgPoints = totalPoints / (games.length * 2)

    const spicyGames = games.filter((g) => g.roastLevel === "spicy").length
    const closeGames = games.filter((g) => g.pointDifferential < 10).length

    let summary = `${intro} Week ${week} delivered ${games.length} games with an average score of ${avgPoints.toFixed(1)} points per team. `

    if (spicyGames > 0) {
      summary += `We witnessed ${spicyGames} absolute beatdown${spicyGames > 1 ? "s" : ""} that left managers questioning their life choices. `
    }

    if (closeGames > 0) {
      summary += `${closeGames} nail-biter${closeGames > 1 ? "s" : ""} kept us on the edge of our seats, mostly because we were afraid to look. `
    }

    summary += "Remember folks, it's not about winning or losing - it's about the friends we disappoint along the way."

    return summary
  }

  // Generate personalized roasts based on team performance
  generatePersonalizedRoast(team: Team, weeklyPerformance: number, seasonAverage: number): string {
    const performance = weeklyPerformance - seasonAverage

    if (performance > 20) {
      return `${team.name} finally remembered how to play fantasy football this week. Don't get used to it.`
    } else if (performance < -20) {
      return `${team.name} managed to disappoint even their own low expectations this week. Impressive in the worst way possible.`
    } else {
      return `${team.name} delivered another perfectly mediocre performance. Consistency is key, even when it's consistently disappointing.`
    }
  }
}
