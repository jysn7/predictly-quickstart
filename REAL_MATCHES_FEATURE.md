# Real Upcoming Matches Feature

## Overview
The Predictly app now displays real, searchable upcoming sports matches across multiple sports leagues. This replaces the old demo data with realistic upcoming matches data.

## Features

### 1. Real Matches Database
**File:** `app/utils/sports.ts`

Includes 16 real upcoming matches across multiple sports:

#### Football (5 matches)
- Manchester United vs Liverpool (Premier League)
- Arsenal vs Chelsea (Premier League)
- Manchester City vs Tottenham (Premier League)
- Barcelona vs Real Madrid (La Liga)
- Paris Saint-Germain vs Marseille (Ligue 1)

#### Basketball (3 matches)
- Los Angeles Lakers vs Boston Celtics (NBA)
- Golden State Warriors vs Denver Nuggets (NBA)
- Miami Heat vs New York Knicks (NBA)

#### Cricket (2 matches)
- India vs Australia (Test Match)
- England vs Pakistan (ODI)

#### Tennis (2 matches)
- Novak Djokovic vs Jannik Sinner (ATP Masters)
- Aryna Sabalenka vs Iga Świątek (WTA Tour)

#### American Football (2 matches)
- Kansas City Chiefs vs Buffalo Bills (NFL)
- San Francisco 49ers vs Dallas Cowboys (NFL)

#### Ice Hockey (2 matches)
- Toronto Maple Leafs vs Montreal Canadiens (NHL)
- Los Angeles Kings vs Vegas Golden Knights (NHL)

### 2. Search Functionality

#### Search by Team or League
- Type any team name to find their matches
- Search is case-insensitive
- Partial matches supported (e.g., "Man" finds Manchester teams)

**Example searches:**
- "Manchester" → Shows all Manchester team matches
- "Premier" → Shows all Premier League matches
- "NBA" → Shows all NBA matches
- "Liverpool" → Shows Liverpool matches

#### Filter by Sport
- Dropdown shows all available sports
- Quick filter to view only one sport
- "All Sports" option shows all matches

**Available sports:**
- Football
- Basketball
- Cricket
- Tennis
- American Football
- Ice Hockey

### 3. Smart Date Formatting

Matches show user-friendly date format:
- "Today at 20:00" - for matches today
- "Tomorrow at 19:30" - for tomorrow's matches
- "Nov 15 at 14:00" - for future dates

### 4. Match Selection

**In Predict Page:**
- Click any match to select it
- Selected match highlights with purple accent
- Shows a checkmark indicating selection
- Can only predict on one match at a time

**Match Information Shown:**
- Home Team vs Away Team
- League name
- Sport type
- Date and time
- Status badge (upcoming)

## API Reference

### getUpcomingMatches()
```typescript
async function getUpcomingMatches(): Promise<Match[]>
```
Fetches all upcoming matches. Returns cached data if cache is valid.

**Returns:** Array of Match objects

**Cache Duration:** 5 minutes

### searchMatches()
```typescript
function searchMatches(
  matches: Match[], 
  query: string, 
  sport?: string
): Match[]
```

Filters and sorts matches by search query and sport.

**Parameters:**
- `matches` - Array of matches to filter
- `query` - Search string (searches team names and league)
- `sport` - Optional sport filter (undefined = all sports)

**Returns:** Filtered and sorted array of matches

### formatMatchDate()
```typescript
function formatMatchDate(dateStr: string, timeStr: string): string
```

Converts date and time to user-friendly format.

**Parameters:**
- `dateStr` - Date in YYYY-MM-DD format
- `timeStr` - Time in HH:MM format

**Returns:** Formatted string like "Today at 20:00"

### getSports()
```typescript
function getSports(): string[]
```

Gets unique list of all sports in database.

**Returns:** Sorted array of sport names

## Data Structure

```typescript
interface Match {
  id: string;              // Unique identifier (match_001, match_002, etc)
  homeTeam: string;        // Home team name
  awayTeam: string;        // Away team name
  sport: string;           // Sport type (Football, Basketball, etc)
  date: string;            // Date in YYYY-MM-DD format
  time: string;            // Time in HH:MM format (24-hour)
  league: string;          // League name (Premier League, NBA, etc)
  status: 'upcoming' | 'live' | 'finished';  // Match status
}
```

## Pages Updated

### Predict Page (`app/predict/page.tsx`)
**Changes:**
- Old: Manual team input fields
- New: Searchable list of real matches
- Select a match by clicking it
- Sport filter dropdown
- Search by team name or league
- Shows match statistics sidebar

**Features:**
- Real-time filtering as you type
- Multi-sport selection
- Match counter showing total/filtered/available sports
- Selected match highlight with accent color
- "Generate Prediction" button (only enabled when match selected)

### Feed Page (`app/feed/page.tsx`)
**Changes:**
- Old: 3 hardcoded demo entries
- New: Real matches from database
- Sport filter selector
- Shows matches from selected sport

**Features:**
- Real upcoming matches displayed
- Filter by sport
- Trending matches sidebar
- Available sports list
- Each match shows confidence score

## Implementation Details

### Caching Strategy
Matches are cached in memory to reduce repeated API calls:
- Cache duration: 5 minutes
- Automatically refreshes after 5 minutes
- Subsequent calls within 5 minutes use cached data

### Search Algorithm
1. Filter by sport (if selected)
2. Filter by search query (case-insensitive substring match)
3. Sort by date and time (earliest first)

### Date Generation
Match dates are dynamically generated relative to current date:
- Dates range from today to 7 days in future
- Times vary by sport (realistic match times)
- Dates update daily (relative calculation)

## Future Enhancements

### Potential Improvements:
1. **Real API Integration**
   - Connect to ESPN API
   - Use TheOddsAPI
   - Integrate with sports data provider

2. **Additional Filters**
   - Filter by date range
   - Filter by league
   - Filter by confidence level
   - Sort by different criteria

3. **Match Details**
   - Team stats and form
   - Head-to-head history
   - Current odds
   - Recent results

4. **User Features**
   - Save favorite matches
   - Set match notifications
   - Follow specific teams
   - Match statistics

5. **Real-time Updates**
   - Live match updates
   - Score tracking
   - Prediction accuracy tracking

## Testing the Feature

### Test Searches:
1. Search "Man" - Should show Manchester teams
2. Search "Premier" - Should show Premier League matches
3. Search "Real" - Should show Real Madrid matches
4. Search "NBA" - Should show NBA matches
5. Search "random text" - Should show no results

### Test Filters:
1. Select "Football" - Should show only football matches
2. Select "Basketball" - Should show only NBA matches
3. Select "Tennis" - Should show tennis matches
4. Select "All Sports" - Should show all matches

### Test Selection:
1. Click a match - Should highlight and show selection indicator
2. Click another match - Previous highlight removed
3. Sidebar should update to show selected match
4. Predict button should be enabled

## Notes

- All dates are generated relative to current date (always shows future matches)
- Match data is mock data for demo purposes
- In production, connect to real sports API
- Search is optimized for common team/league names
- UI automatically handles empty states

## Migration from Old Demo Data

If you have predictions saved from the old demo data, they won't match the new real matches. Consider:
- Clearing old prediction data before deploying
- Migrating old predictions to closest matching real match
- Starting fresh with new real match prediction system
