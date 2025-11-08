# Predictly Database Schema

This document outlines the complete database schema for the Predictly sports prediction and betting platform.

---

## Database Technology Recommendations

- **PostgreSQL** (Recommended) - ACID compliance, JSON support, excellent for relational data
- **MongoDB** (Alternative) - Flexible schema, good for rapid iteration
- **Supabase** (Recommended for quick start) - PostgreSQL with built-in Auth and Real-time

---

## Tables/Collections

### 1. **users**
Stores user account information and profile data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  username VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  display_name VARCHAR(50),
  avatar_url TEXT,
  bio TEXT,
  total_predictions INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0.00,
  total_coins_wagered DECIMAL(20,2) DEFAULT 0.00,
  total_coins_won DECIMAL(20,2) DEFAULT 0.00,
  net_profit DECIMAL(20,2) DEFAULT 0.00,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_reputation ON users(reputation_score DESC);
```

### 2. **matches**
Stores sports match information.

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_match_id VARCHAR(100) UNIQUE,
  sport VARCHAR(50) NOT NULL,
  league VARCHAR(100) NOT NULL,
  home_team VARCHAR(100) NOT NULL,
  away_team VARCHAR(100) NOT NULL,
  home_team_logo TEXT,
  away_team_logo TEXT,
  venue VARCHAR(200),
  location VARCHAR(200),
  match_date DATE NOT NULL,
  match_time TIME NOT NULL,
  match_datetime TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, live, completed, cancelled, postponed
  home_score INTEGER,
  away_score INTEGER,
  final_result VARCHAR(20), -- home_win, away_win, draw
  total_predictions INTEGER DEFAULT 0,
  total_bets_placed INTEGER DEFAULT 0,
  total_wagered DECIMAL(20,2) DEFAULT 0.00,
  metadata JSONB, -- Additional match data (weather, referee, etc.)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_matches_datetime ON matches(match_datetime);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_sport ON matches(sport);
CREATE INDEX idx_matches_league ON matches(league);
```

### 3. **predictions**
Stores AI-generated and user predictions.

```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  prediction_type VARCHAR(20) NOT NULL, -- home_win, away_win, draw
  predicted_home_score INTEGER,
  predicted_away_score INTEGER,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  reasoning TEXT,
  ai_model_used VARCHAR(50), -- openai-gpt4, gemini-pro, etc.
  team_stats JSONB, -- Historical stats used for prediction
  is_ai_generated BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, correct, incorrect, cancelled
  was_correct BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_predictions_status ON predictions(status);
CREATE INDEX idx_predictions_public ON predictions(is_public);
CREATE INDEX idx_predictions_created ON predictions(created_at DESC);
```

### 4. **bets**
Stores user bets placed with PDC coins.

```sql
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id_onchain BIGINT, -- ID from smart contract
  transaction_hash VARCHAR(66),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,
  bet_type VARCHAR(20) NOT NULL, -- for, against
  prediction_type VARCHAR(20) NOT NULL, -- home_win, away_win, draw
  predicted_home_score INTEGER NOT NULL,
  predicted_away_score INTEGER NOT NULL,
  amount DECIMAL(20,2) NOT NULL,
  potential_winnings DECIMAL(20,2) NOT NULL,
  actual_winnings DECIMAL(20,2) DEFAULT 0.00,
  platform_fee DECIMAL(20,2) DEFAULT 0.00, -- 5% fee
  net_winnings DECIMAL(20,2) DEFAULT 0.00,
  odds DECIMAL(10,2) DEFAULT 1.95, -- 95% payout after 5% fee
  status VARCHAR(20) DEFAULT 'pending', -- pending, won, lost, cancelled, refunded
  settled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bets_user ON bets(user_id);
CREATE INDEX idx_bets_match ON bets(match_id);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_bets_transaction ON bets(transaction_hash);
CREATE INDEX idx_bets_created ON bets(created_at DESC);
```

### 5. **coin_transactions**
Tracks all PDC coin movements (purchases, bets, winnings, withdrawals).

```sql
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id_onchain BIGINT, -- ID from smart contract
  transaction_hash VARCHAR(66),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL, -- purchase, bet_placed, bet_won, bet_lost, withdrawal, refund
  amount DECIMAL(20,2) NOT NULL,
  balance_before DECIMAL(20,2) NOT NULL,
  balance_after DECIMAL(20,2) NOT NULL,
  related_bet_id UUID REFERENCES bets(id) ON DELETE SET NULL,
  payment_method VARCHAR(50), -- base_pay, credit_card, crypto
  payment_id TEXT, -- External payment reference
  usd_amount DECIMAL(10,2), -- For purchases
  status VARCHAR(20) DEFAULT 'completed', -- pending, completed, failed, refunded
  metadata JSONB, -- Additional transaction data
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON coin_transactions(user_id);
CREATE INDEX idx_transactions_type ON coin_transactions(transaction_type);
CREATE INDEX idx_transactions_hash ON coin_transactions(transaction_hash);
CREATE INDEX idx_transactions_created ON coin_transactions(created_at DESC);
```

### 6. **likes**
Stores likes/reactions on predictions.

```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, prediction_id)
);

CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_likes_prediction ON likes(prediction_id);
```

### 7. **comments**
Stores comments on predictions (optional feature).

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested replies
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_prediction ON comments(prediction_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
```

### 8. **followers**
Stores user follow relationships (optional feature).

```sql
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_followers_follower ON followers(follower_id);
CREATE INDEX idx_followers_following ON followers(following_id);
```

### 9. **notifications**
Stores user notifications.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- bet_won, bet_lost, match_started, new_follower, like_received, etc.
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Deep link to relevant page
  related_match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  related_bet_id UUID REFERENCES bets(id) ON DELETE SET NULL,
  related_prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### 10. **user_settings**
Stores user preferences and settings.

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(10) DEFAULT 'dark', -- dark, light
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT FALSE,
  bet_result_notifications BOOLEAN DEFAULT TRUE,
  new_match_notifications BOOLEAN DEFAULT TRUE,
  promotional_notifications BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(10) DEFAULT 'USD',
  privacy_settings JSONB DEFAULT '{"profile_public": true, "stats_public": true, "predictions_public": true}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_settings_user ON user_settings(user_id);
```

### 11. **leaderboard**
Materialized view or table for leaderboard rankings.

```sql
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  rank INTEGER,
  total_profit DECIMAL(20,2) DEFAULT 0.00,
  win_rate DECIMAL(5,2) DEFAULT 0.00,
  total_predictions INTEGER DEFAULT 0,
  accuracy_score DECIMAL(5,2) DEFAULT 0.00,
  reputation_score INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]'::jsonb,
  period VARCHAR(20) DEFAULT 'all_time', -- all_time, monthly, weekly
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX idx_leaderboard_profit ON leaderboard(total_profit DESC);
CREATE INDEX idx_leaderboard_period ON leaderboard(period);
```

### 12. **badges**
Stores achievement badges.

```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_name VARCHAR(50) UNIQUE NOT NULL,
  badge_title VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_icon TEXT, -- URL or emoji
  requirement_type VARCHAR(50) NOT NULL, -- win_count, prediction_count, win_rate, profit, etc.
  requirement_value INTEGER NOT NULL,
  rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_badges_name ON badges(badge_name);
```

### 13. **user_badges**
Junction table for users and their earned badges.

```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);
```

### 14. **team_stats**
Cached team statistics from TheSportsDB.

```sql
CREATE TABLE team_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name VARCHAR(100) NOT NULL,
  sport VARCHAR(50) NOT NULL,
  league VARCHAR(100),
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  win_percentage DECIMAL(5,2) DEFAULT 0.00,
  recent_form JSONB, -- Array of recent results: ['W', 'L', 'W', 'D', 'W']
  goals_scored INTEGER DEFAULT 0,
  goals_conceded INTEGER DEFAULT 0,
  logo_url TEXT,
  external_team_id VARCHAR(100),
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_name, sport, league)
);

CREATE INDEX idx_team_stats_name ON team_stats(team_name);
CREATE INDEX idx_team_stats_sport ON team_stats(sport);
```

### 15. **match_predictions_summary**
Aggregated prediction data per match (for analytics).

```sql
CREATE TABLE match_predictions_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  total_predictions INTEGER DEFAULT 0,
  home_win_predictions INTEGER DEFAULT 0,
  away_win_predictions INTEGER DEFAULT 0,
  draw_predictions INTEGER DEFAULT 0,
  home_win_percentage DECIMAL(5,2) DEFAULT 0.00,
  away_win_percentage DECIMAL(5,2) DEFAULT 0.00,
  draw_percentage DECIMAL(5,2) DEFAULT 0.00,
  avg_confidence DECIMAL(5,2) DEFAULT 0.00,
  total_bets_amount DECIMAL(20,2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_match_summary_match ON match_predictions_summary(match_id);
```

### 16. **audit_logs**
Security and audit trail (optional but recommended).

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- user, bet, prediction, match, etc.
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
```

---

## Relationships Summary

```
users
  ├── predictions (1:N)
  ├── bets (1:N)
  ├── coin_transactions (1:N)
  ├── likes (1:N)
  ├── comments (1:N)
  ├── notifications (1:N)
  ├── user_settings (1:1)
  ├── user_badges (N:M via user_badges)
  ├── followers (N:M via followers)
  └── leaderboard (1:1)

matches
  ├── predictions (1:N)
  ├── bets (1:N)
  └── match_predictions_summary (1:1)

predictions
  ├── bets (1:N)
  ├── likes (1:N)
  └── comments (1:N)

bets
  └── coin_transactions (1:N)
```

---

## Indexes Strategy

**High Priority Indexes:**
- User lookups: `wallet_address`, `username`
- Match queries: `match_datetime`, `status`, `sport`
- Bet queries: `user_id`, `match_id`, `status`
- Transaction queries: `user_id`, `transaction_type`, `created_at`
- Leaderboard: `rank`, `total_profit DESC`

**Composite Indexes (Consider adding):**
```sql
CREATE INDEX idx_bets_user_status ON bets(user_id, status);
CREATE INDEX idx_predictions_match_public ON predictions(match_id, is_public);
CREATE INDEX idx_matches_sport_datetime ON matches(sport, match_datetime);
```

---

## Data Retention Policies

1. **Active Data**: Keep all data for current season
2. **Historical Data**: Archive completed matches older than 2 years
3. **Audit Logs**: Retain for 1 year, then archive
4. **Notifications**: Delete read notifications older than 90 days
5. **Transactions**: Keep forever (regulatory requirement)

---

## Caching Strategy

**Redis/Memcached layers:**
- User balances (5 min TTL)
- Leaderboard rankings (1 hour TTL)
- Match list (10 min TTL)
- Team stats (1 day TTL)
- Active match predictions (real-time)

---

## Database Migrations

Use a migration tool like:
- **Prisma** (Recommended for TypeScript)
- **TypeORM**
- **Knex.js**
- **Flyway** (Java-based)

---

## Backup Strategy

1. **Automated daily backups** at 2 AM UTC
2. **Point-in-time recovery** enabled
3. **Geo-redundant** backup storage
4. **Test restores** monthly
5. **Transaction logs** backed up every 15 minutes

---

## Sample Queries

### Get user leaderboard
```sql
SELECT 
  u.username,
  u.wallet_address,
  l.rank,
  l.total_profit,
  l.win_rate,
  u.total_predictions
FROM leaderboard l
JOIN users u ON l.user_id = u.id
WHERE l.period = 'all_time'
ORDER BY l.rank
LIMIT 100;
```

### Get match with predictions
```sql
SELECT 
  m.*,
  COUNT(p.id) as total_predictions,
  AVG(p.confidence_score) as avg_confidence
FROM matches m
LEFT JOIN predictions p ON m.id = p.match_id
WHERE m.match_date >= CURRENT_DATE
GROUP BY m.id
ORDER BY m.match_datetime;
```

### Get user betting history
```sql
SELECT 
  b.*,
  m.home_team,
  m.away_team,
  m.match_datetime,
  m.status as match_status
FROM bets b
JOIN matches m ON b.match_id = m.id
WHERE b.user_id = $1
ORDER BY b.created_at DESC
LIMIT 50;
```

### Calculate user statistics
```sql
SELECT 
  user_id,
  COUNT(*) as total_bets,
  SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as wins,
  SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as losses,
  SUM(amount) as total_wagered,
  SUM(net_winnings) as total_winnings,
  ROUND(
    SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END)::NUMERIC / 
    NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
    2
  ) as win_rate
FROM bets
WHERE user_id = $1
  AND status IN ('won', 'lost')
GROUP BY user_id;
```

---

## Environment Variables Needed

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/predictly
DATABASE_POOL_SIZE=20
DATABASE_SSL_ENABLED=true

# Redis Cache
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Backup
BACKUP_S3_BUCKET=predictly-backups
BACKUP_RETENTION_DAYS=90
```

---

## Next Steps

1. Set up PostgreSQL database
2. Run migration scripts to create tables
3. Seed initial data (badges, sample matches)
4. Set up Redis caching layer
5. Configure automated backups
6. Set up monitoring (query performance, connection pools)
7. Implement rate limiting per user
8. Set up read replicas for scaling

---

**Status**: Ready for implementation
**Last Updated**: November 8, 2025
