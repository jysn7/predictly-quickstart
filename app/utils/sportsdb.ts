// TheSportsDB API integration for real sports data
// Free tier: https://www.thesportsdb.com/api.php

interface TeamStats {
  teamName: string;
  wins: number;
  losses: number;
  draws: number;
  winPercentage: number;
  recentForm: string[]; // Array of W/D/L from most recent matches
  lastMatches: any[];
}

interface HeadToHeadStats {
  homeWins: number;
  awayWins: number;
  draws: number;
  homeTeamAdvantage: boolean;
}

interface EnhancedMatchData {
  homeTeamStats?: TeamStats;
  awayTeamStats?: TeamStats;
  headToHead?: HeadToHeadStats;
  statisticalPrediction?: {
    prediction: string;
    reasoning: string;
  };
}

const SPORTSDB_API = 'https://www.thesportsdb.com/api/v1/json/1';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Simple in-memory cache
const cache: { [key: string]: { data: any; timestamp: number } } = {};

async function getCachedData(url: string): Promise<any> {
  const cached = cache[url];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    cache[url] = { data, timestamp: Date.now() };
    return data;
  } catch (error) {
    console.error('TheSportsDB API error:', error);
    return null;
  }
}

// Search for a team by name and league
export async function searchTeam(teamName: string, league?: string): Promise<any> {
  const url = `${SPORTSDB_API}/search_all_teams.php?t=${encodeURIComponent(teamName)}`;
  const data = await getCachedData(url);
  
  if (!data?.results) return null;

  // Filter by league if provided
  if (league) {
    return data.results.find((team: any) => team.strLeague === league) || data.results[0];
  }
  return data.results[0];
}

// Get team by ID
export async function getTeamById(teamId: string): Promise<any> {
  const url = `${SPORTSDB_API}/lookupteam.php?id=${teamId}`;
  const data = await getCachedData(url);
  return data?.results?.[0];
}

// Get last matches for a team
export async function getTeamLastMatches(teamId: string, limit = 5): Promise<any[]> {
  const url = `${SPORTSDB_API}/eventslast.php?id=${teamId}`;
  const data = await getCachedData(url);
  const results = data?.results || [];
  return results.slice(0, limit);
}

// Get next matches for a team
export async function getTeamNextMatches(teamId: string, limit = 5): Promise<any[]> {
  const url = `${SPORTSDB_API}/eventsnext.php?id=${teamId}`;
  const data = await getCachedData(url);
  const results = data?.results || [];
  return results.slice(0, limit);
}

// Analyze team performance from recent matches
function analyzeTeamForm(matches: any[]): { form: string[]; stats: { wins: number; losses: number; draws: number; winPercentage: number } } {
  let wins = 0,
    losses = 0,
    draws = 0;
  const form: string[] = [];

  for (const match of matches) {
    if (!match.intHomeScore || !match.intAwayScore) continue;

    // Need to determine if it's home or away for this team
    // For now, we'll just track results
    const homeScore = parseInt(match.intHomeScore);
    const awayScore = parseInt(match.intAwayScore);

    if (homeScore > awayScore) {
      wins++;
      form.push('W');
    } else if (homeScore < awayScore) {
      losses++;
      form.push('L');
    } else {
      draws++;
      form.push('D');
    }
  }

  const total = wins + losses + draws || 1;
  return {
    form: form.slice(0, 5), // Last 5 matches
    stats: {
      wins,
      losses,
      draws,
      winPercentage: Math.round((wins / total) * 100),
    },
  };
}

// Get detailed team stats
export async function getTeamStats(teamName: string, league?: string): Promise<TeamStats | null> {
  const team = await searchTeam(teamName, league);
  if (!team?.idTeam) return null;

  const matches = await getTeamLastMatches(team.idTeam);
  const { form, stats } = analyzeTeamForm(matches);

  return {
    teamName: team.strTeam,
    wins: stats.wins,
    losses: stats.losses,
    draws: stats.draws,
    winPercentage: stats.winPercentage,
    recentForm: form,
    lastMatches: matches,
  };
}

// Get head-to-head stats between two teams (simulated for free tier)
export async function getHeadToHeadStats(
  homeTeamName: string,
  awayTeamName: string
): Promise<HeadToHeadStats> {
  // TheSportsDB free tier doesn't have direct H2H endpoint
  // We'll simulate based on team stats and recent performance
  const homeStats = await getTeamStats(homeTeamName);
  const awayStats = await getTeamStats(awayTeamName);

  if (!homeStats || !awayStats) {
    return {
      homeWins: 0,
      awayWins: 0,
      draws: 0,
      homeTeamAdvantage: false,
    };
  }

  // Calculate advantage based on recent form
  const homeRecentWins = (homeStats.recentForm?.filter(r => r === 'W') || []).length;
  const awayRecentWins = (awayStats.recentForm?.filter(r => r === 'W') || []).length;

  return {
    homeWins: homeRecentWins,
    awayWins: awayRecentWins,
    draws: (homeStats.recentForm?.filter(r => r === 'D') || []).length,
    homeTeamAdvantage: homeRecentWins > awayRecentWins,
  };
}

// Generate statistical prediction and reasoning
export async function generateStatisticalPrediction(
  homeTeamName: string,
  awayTeamName: string
): Promise<{ prediction: string; reasoning: string }> {
  try {
    const homeStats = await getTeamStats(homeTeamName);
    const awayStats = await getTeamStats(awayTeamName);
    const h2h = await getHeadToHeadStats(homeTeamName, awayTeamName);

    if (!homeStats || !awayStats) {
      return {
        prediction: 'Draw',
        reasoning: 'Insufficient data for statistical analysis',
      };
    }

    // Scoring system
    let homeScore = 0;
    let awayScore = 0;

    // Factor 1: Win percentage (30 points)
    homeScore += (homeStats.winPercentage * 0.3) / 10;
    awayScore += (awayStats.winPercentage * 0.3) / 10;

    // Factor 2: Recent form (30 points)
    const homeWinsInForm = homeStats.recentForm.filter(f => f === 'W').length;
    const awayWinsInForm = awayStats.recentForm.filter(f => f === 'W').length;
    homeScore += homeWinsInForm * 6;
    awayScore += awayWinsInForm * 6;

    // Factor 3: Home advantage (20 points)
    homeScore += 2;

    // Factor 4: Head-to-head (20 points)
    if (h2h.homeTeamAdvantage) {
      homeScore += 2;
    } else if (!h2h.homeTeamAdvantage && h2h.awayWins > 0) {
      awayScore += 2;
    }

    // Determine prediction
    let prediction: string;
    let reasoning: string;

    if (homeScore > awayScore + 2) {
      prediction = `${homeTeamName} Win`;
      const margin = Math.round(((homeScore - awayScore) / (homeScore + awayScore + 1)) * 100);
      reasoning = `${homeTeamName} strong form (${homeStats.winPercentage}% wins, ${homeWinsInForm}/5 recent), home advantage, vs ${awayTeamName} (${awayStats.winPercentage}% wins).`;
    } else if (awayScore > homeScore + 2) {
      prediction = `${awayTeamName} Win`;
      const margin = Math.round(((awayScore - homeScore) / (homeScore + awayScore + 1)) * 100);
      reasoning = `${awayTeamName} superior form (${awayStats.winPercentage}% wins, ${awayWinsInForm}/5 recent) outweighs ${homeTeamName} home advantage.`;
    } else {
      prediction = 'Draw';
      reasoning = `Teams evenly matched. ${homeTeamName} (${homeStats.winPercentage}% wins) vs ${awayTeamName} (${awayStats.winPercentage}% wins).`;
    }

    return { prediction, reasoning };
  } catch (error) {
    console.error('Error generating statistical prediction:', error);
    return {
      prediction: 'N/A',
      reasoning: 'Error analyzing team statistics',
    };
  }
}

// Get enhanced match data with all stats
export async function getEnhancedMatchData(
  homeTeamName: string,
  awayTeamName: string,
  league?: string
): Promise<EnhancedMatchData> {
  try {
    const [homeStats, awayStats, h2h, statPred] = await Promise.all([
      getTeamStats(homeTeamName, league),
      getTeamStats(awayTeamName, league),
      getHeadToHeadStats(homeTeamName, awayTeamName),
      generateStatisticalPrediction(homeTeamName, awayTeamName),
    ]);

    return {
      homeTeamStats: homeStats || undefined,
      awayTeamStats: awayStats || undefined,
      headToHead: h2h,
      statisticalPrediction: statPred,
    };
  } catch (error) {
    console.error('Error getting enhanced match data:', error);
    return {};
  }
}
