// Yahoo Fantasy Football API integration
export interface YahooConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface League {
  league_key: string
  league_id: string
  name: string
  season: string
  game_code: string
}

export interface Team {
  team_key: string
  team_id: string
  name: string
  owner_name: string
  wins: number
  losses: number
  ties: number
  points_for: number
  points_against: number
}

export interface Matchup {
  week: number
  teams: {
    team: Team
    points: number
  }[]
  winner_team_key?: string
  is_tied?: boolean
}

export interface Player {
  player_key: string
  player_id: string
  name: {
    full: string
    first: string
    last: string
  }
  position_type: string
  eligible_positions: string[]
  ownership?: {
    ownership_type: string
    owner_team_key?: string
  }
}

export class YahooFantasyAPI {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private config: YahooConfig

  constructor(config: YahooConfig) {
    this.config = config
  }

  // OAuth flow methods
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: "openid fspt-w",
    })

    return `https://api.login.yahoo.com/oauth2/auth?${params.toString()}`
  }

  async exchangeCodeForTokens(code: string): Promise<void> {
    const response = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.config.redirectUri,
      }),
    })

    const data = await response.json()
    this.accessToken = data.access_token
    this.refreshToken = data.refresh_token
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) throw new Error("No refresh token available")

    const response = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
      }),
    })

    const data = await response.json()
    this.accessToken = data.access_token
    this.refreshToken = data.refresh_token
  }

  private async makeRequest(endpoint: string): Promise<any> {
    if (!this.accessToken) throw new Error("Not authenticated")

    const response = await fetch(`https://fantasysports.yahooapis.com/fantasy/v2/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    })

    if (response.status === 401) {
      await this.refreshAccessToken()
      return this.makeRequest(endpoint)
    }

    return response.json()
  }

  // API methods
  async getUserLeagues(season = "2024"): Promise<League[]> {
    const data = await this.makeRequest(`users;use_login=1/games;game_keys=nfl/leagues`)
    return data.fantasy_content.users[0].user[1].games[0].game[1].leagues || []
  }

  async getLeagueTeams(leagueKey: string): Promise<Team[]> {
    const data = await this.makeRequest(`league/${leagueKey}/teams`)
    return data.fantasy_content.league[1].teams || []
  }

  async getWeeklyMatchups(leagueKey: string, week: number): Promise<Matchup[]> {
    const data = await this.makeRequest(`league/${leagueKey}/scoreboard;week=${week}`)
    return data.fantasy_content.league[1].scoreboard[0].matchups || []
  }

  async getAvailablePlayers(leagueKey: string, position?: string): Promise<Player[]> {
    let endpoint = `league/${leagueKey}/players;status=A;sort=OR`
    if (position) {
      endpoint += `;position=${position}`
    }

    const data = await this.makeRequest(endpoint)
    return data.fantasy_content.league[1].players || []
  }

  async getWaiverClaims(leagueKey: string): Promise<any[]> {
    const data = await this.makeRequest(`league/${leagueKey}/transactions;type=waiver`)
    return data.fantasy_content.league[1].transactions || []
  }

  // Helper methods
  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
  }

  getTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    }
  }
}
