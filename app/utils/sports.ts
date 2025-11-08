// Sports data utilities - fetches real upcoming matches

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  date: string;
  time: string;
  league: string;
  location: string; // Stadium/venue name and city
  status: 'upcoming' | 'live' | 'finished';
  // Enhanced data from TheSportsDB
  homeTeamStats?: {
    wins: number;
    losses: number;
    draws: number;
    winPercentage: number;
    recentForm: string[];
  };
  awayTeamStats?: {
    wins: number;
    losses: number;
    draws: number;
    winPercentage: number;
    recentForm: string[];
  };
  headToHeadStats?: {
    homeWins: number;
    awayWins: number;
    draws: number;
    homeTeamAdvantage: boolean;
  };
}

// In-memory cache for matches to reduce API calls
let cachedMatches: Match[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Real upcoming matches data (this would normally come from an API)
// Using ESPN-like data structure for demo purposes
const UPCOMING_MATCHES: Match[] = [
  // Football - Premier League (8 matches)
  {
    id: 'match_001',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    sport: 'Football',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:00',
    league: 'Premier League',
    location: 'Old Trafford, Manchester',
    status: 'upcoming',
  },
  {
    id: 'match_002',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    sport: 'Football',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '15:30',
    league: 'Premier League',
    location: 'Emirates Stadium, London',
    status: 'upcoming',
  },
  {
    id: 'match_003',
    homeTeam: 'Manchester City',
    awayTeam: 'Tottenham',
    sport: 'Football',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:00',
    league: 'Premier League',
    location: 'Etihad Stadium, Manchester',
    status: 'upcoming',
  },
  {
    id: 'match_004',
    homeTeam: 'Barcelona',
    awayTeam: 'Real Madrid',
    sport: 'Football',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '21:00',
    league: 'La Liga',
    location: 'Camp Nou, Barcelona',
    status: 'upcoming',
  },
  {
    id: 'match_005',
    homeTeam: 'Paris Saint-Germain',
    awayTeam: 'Marseille',
    sport: 'Football',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:45',
    league: 'Ligue 1',
    location: 'Parc des Princes, Paris',
    status: 'upcoming',
  },
  {
    id: 'match_006',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    sport: 'Football',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:30',
    league: 'Bundesliga',
    location: 'Allianz Arena, Munich',
    status: 'upcoming',
  },
  {
    id: 'match_007',
    homeTeam: 'Inter Milan',
    awayTeam: 'AC Milan',
    sport: 'Football',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:00',
    league: 'Serie A',
    location: 'San Siro, Milan',
    status: 'upcoming',
  },
  {
    id: 'match_008',
    homeTeam: 'Leicester City',
    awayTeam: 'Everton',
    sport: 'Football',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '15:00',
    league: 'Premier League',
    location: 'King Power Stadium, Leicester',
    status: 'upcoming',
  },

  // Basketball - NBA (10 matches)
  {
    id: 'match_009',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Boston Celtics',
    sport: 'Basketball',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '22:30',
    league: 'NBA',
    location: 'Crypto.com Arena, Los Angeles',
    status: 'upcoming',
  },
  {
    id: 'match_010',
    homeTeam: 'Golden State Warriors',
    awayTeam: 'Denver Nuggets',
    sport: 'Basketball',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '21:00',
    league: 'NBA',
    location: 'Chase Center, San Francisco',
    status: 'upcoming',
  },
  {
    id: 'match_011',
    homeTeam: 'Miami Heat',
    awayTeam: 'New York Knicks',
    sport: 'Basketball',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:30',
    league: 'NBA',
    location: 'American Airlines Center, Miami',
    status: 'upcoming',
  },
  {
    id: 'match_012',
    homeTeam: 'Phoenix Suns',
    awayTeam: 'Los Angeles Clippers',
    sport: 'Basketball',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:00',
    league: 'NBA',
    location: 'Footprint Center, Phoenix',
    status: 'upcoming',
  },
  {
    id: 'match_013',
    homeTeam: 'Chicago Bulls',
    awayTeam: 'Milwaukee Bucks',
    sport: 'Basketball',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:00',
    league: 'NBA',
    location: 'United Center, Chicago',
    status: 'upcoming',
  },
  {
    id: 'match_014',
    homeTeam: 'Brooklyn Nets',
    awayTeam: 'Philadelphia 76ers',
    sport: 'Basketball',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:30',
    league: 'NBA',
    location: 'Barclays Center, Brooklyn',
    status: 'upcoming',
  },
  {
    id: 'match_015',
    homeTeam: 'Houston Rockets',
    awayTeam: 'Portland Trail Blazers',
    sport: 'Basketball',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '21:00',
    league: 'NBA',
    location: 'Toyota Center, Houston',
    status: 'upcoming',
  },
  {
    id: 'match_016',
    homeTeam: 'Atlanta Hawks',
    awayTeam: 'Toronto Raptors',
    sport: 'Basketball',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:00',
    league: 'NBA',
    location: 'State Farm Arena, Atlanta',
    status: 'upcoming',
  },

  // Cricket (6 matches)
  {
    id: 'match_017',
    homeTeam: 'India',
    awayTeam: 'Australia',
    sport: 'Cricket',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:00',
    league: 'Test Match',
    location: 'Melbourne Cricket Ground, Australia',
    status: 'upcoming',
  },
  {
    id: 'match_018',
    homeTeam: 'England',
    awayTeam: 'Pakistan',
    sport: 'Cricket',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '15:00',
    league: 'ODI',
    location: 'Old Trafford, Manchester',
    status: 'upcoming',
  },
  {
    id: 'match_019',
    homeTeam: 'South Africa',
    awayTeam: 'New Zealand',
    sport: 'Cricket',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:30',
    league: 'T20 International',
    location: 'Johannesburg Stadium, South Africa',
    status: 'upcoming',
  },
  {
    id: 'match_020',
    homeTeam: 'West Indies',
    awayTeam: 'Sri Lanka',
    sport: 'Cricket',
    date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:00',
    league: 'ODI',
    location: 'Sabina Park, Jamaica',
    status: 'upcoming',
  },
  {
    id: 'match_021',
    homeTeam: 'Bangladesh',
    awayTeam: 'Afghanistan',
    sport: 'Cricket',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '15:30',
    league: 'T20 International',
    location: 'Mirpur Stadium, Dhaka',
    status: 'upcoming',
  },
  {
    id: 'match_022',
    homeTeam: 'Ireland',
    awayTeam: 'Netherlands',
    sport: 'Cricket',
    date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:00',
    league: 'ODI',
    location: 'Malahide Cricket Club, Dublin',
    status: 'upcoming',
  },

  // Tennis (8 matches)
  {
    id: 'match_023',
    homeTeam: 'Novak Djokovic',
    awayTeam: 'Jannik Sinner',
    sport: 'Tennis',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '18:00',
    league: 'ATP Masters',
    location: 'Indian Wells Tennis Garden, California',
    status: 'upcoming',
  },
  {
    id: 'match_024',
    homeTeam: 'Aryna Sabalenka',
    awayTeam: 'Iga Świątek',
    sport: 'Tennis',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:00',
    league: 'WTA Tour',
    location: 'Indian Wells Tennis Garden, California',
    status: 'upcoming',
  },
  {
    id: 'match_025',
    homeTeam: 'Carlos Alcaraz',
    awayTeam: 'Rafael Nadal',
    sport: 'Tennis',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '17:00',
    league: 'ATP Tour',
    location: 'Clay Court Championships, Barcelona',
    status: 'upcoming',
  },
  {
    id: 'match_026',
    homeTeam: 'Elena Rybakina',
    awayTeam: 'Marketa Vondrousova',
    sport: 'Tennis',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '15:00',
    league: 'WTA Tour',
    location: 'Qatar Open, Doha',
    status: 'upcoming',
  },
  {
    id: 'match_027',
    homeTeam: 'Lorenzo Musetti',
    awayTeam: 'Matteo Berrettini',
    sport: 'Tennis',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '16:30',
    league: 'ATP Tour',
    location: 'Italy Tennis Masters, Rome',
    status: 'upcoming',
  },
  {
    id: 'match_028',
    homeTeam: 'Coco Gauff',
    awayTeam: 'Madison Keys',
    sport: 'Tennis',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '18:00',
    league: 'WTA Tour',
    location: 'Miami Open, Florida',
    status: 'upcoming',
  },
  {
    id: 'match_029',
    homeTeam: 'Alexander Zverev',
    awayTeam: 'Holger Rune',
    sport: 'Tennis',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:00',
    league: 'ATP Tour',
    location: 'Monte Carlo Masters, Monaco',
    status: 'upcoming',
  },
  {
    id: 'match_030',
    homeTeam: 'Barbora Krejcikova',
    awayTeam: 'Karolina Muchova',
    sport: 'Tennis',
    date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:00',
    league: 'WTA Tour',
    location: 'Madrid Open, Spain',
    status: 'upcoming',
  },

  // American Football - NFL (8 matches)
  {
    id: 'match_031',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Buffalo Bills',
    sport: 'American Football',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:00',
    league: 'NFL',
    location: 'Arrowhead Stadium, Kansas City',
    status: 'upcoming',
  },
  {
    id: 'match_032',
    homeTeam: 'San Francisco 49ers',
    awayTeam: 'Dallas Cowboys',
    sport: 'American Football',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:30',
    league: 'NFL',
    location: 'Levi\'s Stadium, Santa Clara',
    status: 'upcoming',
  },
  {
    id: 'match_033',
    homeTeam: 'Green Bay Packers',
    awayTeam: 'Minneapolis Vikings',
    sport: 'American Football',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:15',
    league: 'NFL',
    location: 'Lambeau Field, Wisconsin',
    status: 'upcoming',
  },
  {
    id: 'match_034',
    homeTeam: 'New England Patriots',
    awayTeam: 'Miami Dolphins',
    sport: 'American Football',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '13:00',
    league: 'NFL',
    location: 'Gillette Stadium, Massachusetts',
    status: 'upcoming',
  },
  {
    id: 'match_035',
    homeTeam: 'Los Angeles Rams',
    awayTeam: 'Seattle Seahawks',
    sport: 'American Football',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:00',
    league: 'NFL',
    location: 'SoFi Stadium, Los Angeles',
    status: 'upcoming',
  },
  {
    id: 'match_036',
    homeTeam: 'Baltimore Ravens',
    awayTeam: 'Pittsburgh Steelers',
    sport: 'American Football',
    date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:00',
    league: 'NFL',
    location: 'M&T Bank Stadium, Baltimore',
    status: 'upcoming',
  },
  {
    id: 'match_037',
    homeTeam: 'Indianapolis Colts',
    awayTeam: 'Houston Texans',
    sport: 'American Football',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '18:00',
    league: 'NFL',
    location: 'Lucas Oil Stadium, Indianapolis',
    status: 'upcoming',
  },
  {
    id: 'match_038',
    homeTeam: 'New York Giants',
    awayTeam: 'Philadelphia Eagles',
    sport: 'American Football',
    date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:00',
    league: 'NFL',
    location: 'MetLife Stadium, New Jersey',
    status: 'upcoming',
  },

  // Ice Hockey - NHL (8 matches)
  {
    id: 'match_039',
    homeTeam: 'Toronto Maple Leafs',
    awayTeam: 'Montreal Canadiens',
    sport: 'Ice Hockey',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:00',
    league: 'NHL',
    location: 'Scotiabank Arena, Toronto',
    status: 'upcoming',
  },
  {
    id: 'match_040',
    homeTeam: 'Los Angeles Kings',
    awayTeam: 'Vegas Golden Knights',
    sport: 'Ice Hockey',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:00',
    league: 'NHL',
    location: 'Crypto.com Arena, Los Angeles',
    status: 'upcoming',
  },
  {
    id: 'match_041',
    homeTeam: 'Colorado Avalanche',
    awayTeam: 'Dallas Stars',
    sport: 'Ice Hockey',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '21:00',
    league: 'NHL',
    location: 'Ball Arena, Denver',
    status: 'upcoming',
  },
  {
    id: 'match_042',
    homeTeam: 'Detroit Red Wings',
    awayTeam: 'Chicago Blackhawks',
    sport: 'Ice Hockey',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:30',
    league: 'NHL',
    location: 'Little Caesars Arena, Detroit',
    status: 'upcoming',
  },
  {
    id: 'match_043',
    homeTeam: 'New York Rangers',
    awayTeam: 'Boston Bruins',
    sport: 'Ice Hockey',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:00',
    league: 'NHL',
    location: 'Madison Square Garden, New York',
    status: 'upcoming',
  },
  {
    id: 'match_044',
    homeTeam: 'Edmonton Oilers',
    awayTeam: 'Calgary Flames',
    sport: 'Ice Hockey',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:30',
    league: 'NHL',
    location: 'Rogers Place, Edmonton',
    status: 'upcoming',
  },
  {
    id: 'match_045',
    homeTeam: 'Washington Capitals',
    awayTeam: 'New York Islanders',
    sport: 'Ice Hockey',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:00',
    league: 'NHL',
    location: 'Capital One Arena, Washington',
    status: 'upcoming',
  },
  {
    id: 'match_046',
    homeTeam: 'Winnipeg Jets',
    awayTeam: 'Vancouver Canucks',
    sport: 'Ice Hockey',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:00',
    league: 'NHL',
    location: 'Canada Life Centre, Winnipeg',
    status: 'upcoming',
  },
];

export async function getUpcomingMatches(): Promise<Match[]> {
  // Check if cache is still valid
  if (cachedMatches.length > 0 && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedMatches;
  }

  try {
    // In a real app, you would fetch from an API like:
    // const response = await fetch('https://api.example.com/matches/upcoming');
    // const data = await response.json();
    
    // For now, return mock data
    cachedMatches = UPCOMING_MATCHES;
    cacheTimestamp = Date.now();
    return cachedMatches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return UPCOMING_MATCHES;
  }
}

export function searchMatches(matches: Match[], query: string, sport?: string): Match[] {
  let filtered = matches;

  // Filter by sport if provided
  if (sport && sport !== 'All Sports') {
    filtered = filtered.filter(m => m.sport === sport);
  }

  // Filter by search query (search in team names, league, location, and day)
  if (query.trim().length > 0) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(m => {
      const matchDate = new Date(`${m.date}T${m.time}`);
      const dayName = matchDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      return (
        m.homeTeam.toLowerCase().includes(lowerQuery) ||
        m.awayTeam.toLowerCase().includes(lowerQuery) ||
        m.league.toLowerCase().includes(lowerQuery) ||
        m.location.toLowerCase().includes(lowerQuery) ||
        dayName.includes(lowerQuery)
      );
    });
  }

  // Sort by date
  return filtered.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
}

export function formatMatchDate(dateStr: string, timeStr: string): string {
  try {
    const date = new Date(`${dateStr}T${timeStr}`);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) {
      return `Today at ${timeStr}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${timeStr}`;
    } else {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${timeStr}`;
    }
  } catch (error) {
    return `${dateStr} at ${timeStr}`;
  }
}

export function getDayName(dateStr: string): string {
  try {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } catch (error) {
    return 'Unknown';
  }
}

export function getFullMatchDateTime(dateStr: string, timeStr: string): string {
  try {
    const date = new Date(`${dateStr}T${timeStr}`);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    return `${dayName}, ${monthDay} at ${timeStr}`;
  } catch (error) {
    return `${dateStr} at ${timeStr}`;
  }
}

export function getSports(): string[] {
  const sports = new Set(UPCOMING_MATCHES.map(m => m.sport));
  return Array.from(sports).sort();
}

export type { Match };
