# Task: [DATABASE] - Setup PostgreSQL Database & Data Models

## 📋 Metadata
- **ID**: TASK-108
- **Created**: 2025-08-18
- **Status**: TODO
- **Priority**: CRITICAL
- **Size**: L
- **Assignee**: [Unassigned]
- **Epic**: Backend Infrastructure
- **Sprint**: Optimization Sprint

## 🎯 User Story
**As a** system architect  
**I want** a robust database architecture  
**So that** the game can handle millions of users with optimal performance

## 📝 Description
Design and implement PostgreSQL database with proper schemas, indexes, constraints, and relationships. Setup migrations, seeds, and backup strategies. Implement connection pooling, read replicas, and caching layer with Redis.

## ✅ Acceptance Criteria
- [ ] PostgreSQL database setup with Docker
- [ ] All schemas designed and implemented
- [ ] Indexes optimized for query performance
- [ ] Foreign keys and constraints in place
- [ ] Migration system configured (Prisma/TypeORM)
- [ ] Seed data for development/testing
- [ ] Redis caching layer configured
- [ ] Connection pooling optimized
- [ ] Backup and recovery procedures
- [ ] Database monitoring setup

## 🔧 Technical Details

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 1000,
    gems INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Cards master table
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rarity VARCHAR(20) NOT NULL,
    cost INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    emoji VARCHAR(10),
    image_url TEXT,
    abilities JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_rarity (rarity),
    INDEX idx_cost (cost)
);

-- User card collection
CREATE TABLE user_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES cards(id),
    quantity INTEGER DEFAULT 1,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    obtained_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, card_id),
    INDEX idx_user_cards (user_id, card_id)
);

-- Decks
CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    cards JSONB NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_user_decks (user_id)
);

-- Matches
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_id UUID REFERENCES users(id),
    player2_id UUID REFERENCES users(id),
    winner_id UUID REFERENCES users(id),
    match_type VARCHAR(20) NOT NULL,
    duration INTEGER,
    replay_data JSONB,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    INDEX idx_players (player1_id, player2_id),
    INDEX idx_winner (winner_id),
    INDEX idx_match_date (started_at DESC)
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(20) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_user_transactions (user_id, created_at DESC)
);

-- Leaderboard (materialized view)
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
    u.id,
    u.username,
    u.level,
    u.experience,
    COUNT(m.id) as total_matches,
    COUNT(CASE WHEN m.winner_id = u.id THEN 1 END) as wins,
    ROUND(COUNT(CASE WHEN m.winner_id = u.id THEN 1 END)::numeric / 
          NULLIF(COUNT(m.id), 0) * 100, 2) as win_rate
FROM users u
LEFT JOIN matches m ON u.id IN (m.player1_id, m.player2_id)
GROUP BY u.id
ORDER BY u.experience DESC, win_rate DESC;

-- Refresh leaderboard every hour
CREATE INDEX idx_leaderboard_exp ON leaderboard(experience DESC);
```

### Redis Caching Strategy

```typescript
// Cache keys structure
const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userCards: (userId: string) => `user:${userId}:cards`,
  userDecks: (userId: string) => `user:${userId}:decks`,
  leaderboard: () => 'leaderboard:global',
  matchHistory: (userId: string) => `user:${userId}:matches`,
  cardDetails: (cardId: string) => `card:${cardId}`,
};

// Cache TTL (in seconds)
const cacheTTL = {
  user: 3600,           // 1 hour
  userCards: 1800,      // 30 minutes
  userDecks: 1800,      // 30 minutes
  leaderboard: 300,     // 5 minutes
  matchHistory: 600,    // 10 minutes
  cardDetails: 86400,   // 24 hours
};
```

### Connection Pooling

```typescript
// database/connection.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Return error after 2s
});

// Read replica for queries
const readPool = new Pool({
  host: process.env.DB_READ_HOST,
  // ... same config
});
```

### Performance Optimizations
- Partition matches table by month
- Use JSONB for flexible data storage
- Implement database triggers for updated_at
- Use prepared statements to prevent SQL injection
- Implement query result caching
- Use database connection pooling
- Setup read replicas for scaling

## ⚠️ Risks & Mitigations
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss | CRITICAL | LOW | Daily backups, point-in-time recovery |
| Performance degradation | HIGH | MEDIUM | Indexes, partitioning, caching |
| Security breach | CRITICAL | LOW | Encryption at rest, SSL connections |

## 🧪 Test Scenarios
1. **Load Testing**: 10,000 concurrent connections
2. **Query Performance**: All queries < 100ms
3. **Backup/Restore**: < 5 minute recovery time
4. **Cache Hit Rate**: > 80% for common queries
5. **Connection Pool**: No exhaustion under load

## 📊 Definition of Done
- [ ] Database schemas created
- [ ] All indexes optimized
- [ ] Migrations working
- [ ] Seeds populated
- [ ] Redis caching implemented
- [ ] Monitoring dashboards setup
- [ ] Backup strategy tested
- [ ] Documentation complete

---
*This task is part of The Meme Wars TCG project*
