import type { Player } from "./yahoo-api"
import type { WaiverWireRecommendation } from "./email-service"

export interface ExpertRecommendation {
  playerName: string
  position: string
  team: string
  source: string
  reasoning: string
  priority: number // 1-10 scale
  targetPercentage?: number
  projectedPoints?: number
}

export interface WaiverWireSource {
  name: string
  url: string
  selector: string
  parseFunction: (html: string) => ExpertRecommendation[]
}

export class WaiverWireAnalyzer {
  private sources: WaiverWireSource[] = [
    {
      name: "FantasyPros",
      url: "https://www.fantasypros.com/nfl/waiver-wire/",
      selector: ".waiver-wire-player",
      parseFunction: this.parseFantasyPros.bind(this),
    },
    {
      name: "ESPN",
      url: "https://www.espn.com/fantasy/football/story/_/page/waiverwire",
      selector: ".waiver-player",
      parseFunction: this.parseESPN.bind(this),
    },
    {
      name: "Yahoo Sports",
      url: "https://sports.yahoo.com/fantasy/football/waiver-wire/",
      selector: ".waiver-recommendation",
      parseFunction: this.parseYahooSports.bind(this),
    },
  ]

  private readonly positionPriority = {
    QB: 1,
    RB: 4,
    WR: 4,
    TE: 2,
    K: 0.5,
    DEF: 1,
  }

  async analyzeWaiverWire(
    availablePlayers: Player[],
    leagueKey: string,
    week: number,
  ): Promise<WaiverWireRecommendation[]> {
    // Fetch expert recommendations from multiple sources
    const expertRecommendations = await this.fetchExpertRecommendations()

    // Cross-reference with available players
    const availableRecommendations = this.matchAvailablePlayers(expertRecommendations, availablePlayers)

    // Score and prioritize recommendations
    const scoredRecommendations = this.scoreRecommendations(availableRecommendations, week)

    // Generate final recommendations with reasoning
    return this.generateFinalRecommendations(scoredRecommendations)
  }

  private async fetchExpertRecommendations(): Promise<ExpertRecommendation[]> {
    const allRecommendations: ExpertRecommendation[] = []

    // In a real implementation, you would scrape these sources
    // For now, we'll simulate with mock data that represents typical expert recommendations
    const mockRecommendations = this.getMockExpertRecommendations()

    return mockRecommendations
  }

  private getMockExpertRecommendations(): ExpertRecommendation[] {
    return [
      {
        playerName: "Jaylen Warren",
        position: "RB",
        team: "PIT",
        source: "FantasyPros",
        reasoning: "Najee Harris injury concern, Warren getting more touches and red zone looks",
        priority: 8,
        targetPercentage: 15,
        projectedPoints: 12.5,
      },
      {
        playerName: "Tank Dell",
        position: "WR",
        team: "HOU",
        source: "ESPN",
        reasoning: "Emerging as Stroud's favorite target, great matchup next week",
        priority: 7,
        targetPercentage: 25,
        projectedPoints: 14.2,
      },
      {
        playerName: "Tyler Boyd",
        position: "WR",
        team: "CIN",
        source: "Yahoo Sports",
        reasoning: "Tee Higgins injury opens up targets, reliable floor in PPR",
        priority: 6,
        targetPercentage: 35,
        projectedPoints: 11.8,
      },
      {
        playerName: "Tua Tagovailoa",
        position: "QB",
        team: "MIA",
        source: "FantasyPros",
        reasoning: "Returning from injury, soft schedule ahead, desperate QB streamers",
        priority: 5,
        targetPercentage: 45,
        projectedPoints: 18.5,
      },
      {
        playerName: "Chuba Hubbard",
        position: "RB",
        team: "CAR",
        source: "ESPN",
        reasoning: "Miles Sanders struggling, Hubbard showing burst and pass-catching ability",
        priority: 7,
        targetPercentage: 20,
        projectedPoints: 10.3,
      },
      {
        playerName: "Darnell Mooney",
        position: "WR",
        team: "ATL",
        source: "Yahoo Sports",
        reasoning: "Drake London injury concern, Mooney getting deep targets from Ridder",
        priority: 6,
        targetPercentage: 30,
        projectedPoints: 9.7,
      },
      {
        playerName: "Logan Thomas",
        position: "TE",
        team: "WAS",
        source: "FantasyPros",
        reasoning: "Hokinson struggling, Thomas healthy and getting red zone looks",
        priority: 4,
        targetPercentage: 40,
        projectedPoints: 8.2,
      },
      {
        playerName: "Demarcus Robinson",
        position: "WR",
        team: "LAR",
        source: "ESPN",
        reasoning: "Cooper Kupp injury opens up slot work, Stafford connection building",
        priority: 5,
        targetPercentage: 25,
        projectedPoints: 8.9,
      },
    ]
  }

  private matchAvailablePlayers(
    expertRecommendations: ExpertRecommendation[],
    availablePlayers: Player[],
  ): ExpertRecommendation[] {
    return expertRecommendations.filter((recommendation) => {
      return availablePlayers.some((player) => {
        const nameMatch =
          this.normalizePlayerName(player.name.full) === this.normalizePlayerName(recommendation.playerName)
        const positionMatch = player.eligible_positions.some((pos) => pos === recommendation.position)
        return nameMatch && positionMatch
      })
    })
  }

  private normalizePlayerName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  private scoreRecommendations(recommendations: ExpertRecommendation[], week: number): ExpertRecommendation[] {
    return recommendations
      .map((rec) => {
        let score = rec.priority

        // Boost score based on position scarcity
        score += this.positionPriority[rec.position as keyof typeof this.positionPriority] || 1

        // Boost score for lower ownership (more available)
        if (rec.targetPercentage && rec.targetPercentage < 20) {
          score += 2
        } else if (rec.targetPercentage && rec.targetPercentage < 40) {
          score += 1
        }

        // Boost score for projected points
        if (rec.projectedPoints && rec.projectedPoints > 15) {
          score += 2
        } else if (rec.projectedPoints && rec.projectedPoints > 10) {
          score += 1
        }

        // Late season boost for playoff-bound teams
        if (week > 10) {
          score += 0.5
        }

        return { ...rec, priority: score }
      })
      .sort((a, b) => b.priority - a.priority)
  }

  private generateFinalRecommendations(scoredRecommendations: ExpertRecommendation[]): WaiverWireRecommendation[] {
    return scoredRecommendations.slice(0, 8).map((rec) => {
      const priority = this.determinePriorityLevel(rec.priority)
      const enhancedReason = this.enhanceReasoning(rec, priority)

      return {
        playerName: rec.playerName,
        position: rec.position,
        team: rec.team,
        reason: enhancedReason,
        priority,
        percentOwned: rec.targetPercentage || this.estimateOwnership(rec.position, rec.priority),
      }
    })
  }

  private determinePriorityLevel(score: number): "high" | "medium" | "low" {
    if (score >= 9) return "high"
    if (score >= 6) return "medium"
    return "low"
  }

  private enhanceReasoning(rec: ExpertRecommendation, priority: "high" | "medium" | "low"): string {
    const urgencyMap = {
      high: "MUST-ADD:",
      medium: "Strong Add:",
      low: "Deep League:",
    }

    const projectionText = rec.projectedPoints ? ` Projected for ${rec.projectedPoints} points this week.` : ""

    const ownershipText = rec.targetPercentage
      ? ` Currently owned in ${rec.targetPercentage}% of leagues.`
      : " Low ownership makes him a sneaky pickup."

    return `${urgencyMap[priority]} ${rec.reasoning}.${projectionText}${ownershipText} Don't sleep on this one - your league mates are probably already eyeing him.`
  }

  private estimateOwnership(position: string, priority: number): number {
    const baseOwnership = {
      QB: 60,
      RB: 40,
      WR: 35,
      TE: 45,
      K: 80,
      DEF: 70,
    }

    const base = baseOwnership[position as keyof typeof baseOwnership] || 40
    const adjustment = Math.max(0, (10 - priority) * 5)

    return Math.min(95, base + adjustment)
  }

  // Mock parsing functions (in real implementation, these would parse HTML)
  private parseFantasyPros(html: string): ExpertRecommendation[] {
    // Mock implementation - would parse actual HTML in production
    return []
  }

  private parseESPN(html: string): ExpertRecommendation[] {
    // Mock implementation - would parse actual HTML in production
    return []
  }

  private parseYahooSports(html: string): ExpertRecommendation[] {
    // Mock implementation - would parse actual HTML in production
    return []
  }

  // Advanced analysis methods
  analyzeTeamNeeds(teamRoster: Player[], leagueAverages: any): string[] {
    const needs: string[] = []
    const positionCounts = this.countPositions(teamRoster)

    if (positionCounts.RB < 3) needs.push("RB")
    if (positionCounts.WR < 4) needs.push("WR")
    if (positionCounts.QB < 2) needs.push("QB")
    if (positionCounts.TE < 2) needs.push("TE")

    return needs
  }

  private countPositions(roster: Player[]): Record<string, number> {
    const counts: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0 }

    for (const player of roster) {
      const primaryPosition = player.eligible_positions[0]
      if (counts[primaryPosition] !== undefined) {
        counts[primaryPosition]++
      }
    }

    return counts
  }

  generatePersonalizedRecommendations(
    baseRecommendations: WaiverWireRecommendation[],
    teamNeeds: string[],
    rosterSize: number,
  ): WaiverWireRecommendation[] {
    return baseRecommendations
      .map((rec) => {
        if (teamNeeds.includes(rec.position)) {
          return {
            ...rec,
            priority: rec.priority === "low" ? "medium" : rec.priority === "medium" ? "high" : rec.priority,
            reason: `TEAM NEED: ${rec.reason}`,
          }
        }
        return rec
      })
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
  }
}
