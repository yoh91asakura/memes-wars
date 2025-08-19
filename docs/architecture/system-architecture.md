# 🏗️ Emoji Mayhem TCG - System Architecture

## 1. Overview

The system follows a **modular, component-based architecture** with clear separation of concerns:
- **Frontend**: React + TypeScript for UI
- **State Management**: Zustand for global state
- **Animation**: Framer Motion for visual effects
- **Real-time**: Socket.IO for multiplayer (future)
- **Testing**: Vitest with TDD approach

## 2. Architecture Layers

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│     (React Components + Framer)     │
├─────────────────────────────────────┤
│         State Management            │
│         (Zustand Stores)            │
├─────────────────────────────────────┤
│         Business Logic              │
│    (Services + Game Engines)        │
├─────────────────────────────────────┤
│           Data Models               │
│    (TypeScript Interfaces)          │
├─────────────────────────────────────┤
│         Configuration               │
│        (JSON + Constants)           │
└─────────────────────────────────────┘
```

## 3. Directory Structure

```
src/
├── components/          # React UI components
│   ├── cards/          # Card-related components
│   ├── combat/         # Combat arena components
│   ├── deck/           # Deck builder components
│   └── common/         # Shared UI components
├── services/           # Business logic
│   ├── CardService.ts  # Card operations
│   ├── CombatEngine.ts # Battle system
│   ├── DeckService.ts  # Deck management
│   └── GameState.ts    # Game state coordination
├── models/             # Data structures
│   ├── Card.ts         # Card interfaces
│   ├── Combat.ts       # Combat models
│   ├── Player.ts       # Player data
│   └── Deck.ts         # Deck structures
├── stores/             # Zustand stores
│   ├── gameStore.ts    # Main game state
│   ├── playerStore.ts  # Player data
│   └── combatStore.ts  # Combat state
├── utils/              # Utility functions
│   ├── animations.ts   # Animation helpers
│   ├── random.ts       # RNG utilities
│   └── format.ts       # Formatters
└── hooks/              # Custom React hooks
    ├── useGame.ts      # Game logic hooks
    ├── useCombat.ts    # Combat hooks
    └── useAnimation.ts # Animation hooks
```

## 4. Core Components

### 4.1 Card System
```typescript
interface ICardService {
  rollCard(luck: number): Card;
  calculateStats(card: Card): CardStats;
  applyStack(card: Card, level: number): Card;
  generatePassive(rarity: Rarity): PassiveAbility;
}
```

### 4.2 Combat Engine
```typescript
interface ICombatEngine {
  initialize(playerDeck: Deck, opponentDeck: Deck): void;
  startBattle(): void;
  processFrame(deltaTime: number): void;
  checkCollisions(): Collision[];
  applyEffects(effects: Effect[]): void;
  determineWinner(): Player | null;
}
```

### 4.3 Deck Service
```typescript
interface IDeckService {
  validateDeck(cards: Card[]): boolean;
  calculateTotalHP(deck: Deck): number;
  getActiveEmojis(deck: Deck): EmojiProjectile[];
  saveDeck(deck: Deck): void;
  loadDeck(id: string): Deck;
}
```

## 5. State Management

### 5.1 Game Store
```typescript
interface GameStore {
  // State
  player: Player;
  currentDeck: Deck;
  collection: Card[];
  coins: number;
  gems: number;
  
  // Actions
  rollCard: () => Promise<Card>;
  equipCard: (card: Card) => void;
  unequipCard: (cardId: string) => void;
  startBattle: () => void;
}
```

### 5.2 Combat Store
```typescript
interface CombatStore {
  // State
  isActive: boolean;
  playerHP: number;
  opponentHP: number;
  projectiles: Projectile[];
  effects: ActiveEffect[];
  
  // Actions
  fireProjectile: (emoji: EmojiProjectile) => void;
  applyDamage: (target: 'player' | 'opponent', amount: number) => void;
  triggerEffect: (effect: Effect) => void;
}
```

## 6. Data Flow

### 6.1 Card Rolling Flow
```
User clicks Roll → GameStore.rollCard()
  → CardService.rollCard()
  → RNG determines rarity
  → Generate card properties
  → Check for duplicate
  → Update collection
  → Display result with animation
```

### 6.2 Combat Flow
```
Start Battle → CombatStore.initialize()
  → Load both decks
  → Calculate total HP
  → Start countdown
  → Begin auto-fire loop
    → Spawn projectiles
    → Update positions
    → Check collisions
    → Apply damage/effects
  → Determine winner
  → Award rewards
```

## 7. Performance Optimizations

### 7.1 Rendering
- **Virtual scrolling** for large card collections
- **Memoization** of expensive calculations
- **RequestAnimationFrame** for smooth animations
- **Object pooling** for projectiles

### 7.2 State Updates
- **Batch updates** in combat loop
- **Selective re-renders** with React.memo
- **Zustand subscriptions** for specific slices
- **Debounced** UI updates during intense combat

## 8. Testing Strategy

### 8.1 Unit Tests
- Model validation
- Service logic
- Utility functions
- Store actions

### 8.2 Integration Tests
- Component interactions
- State management flow
- Combat simulation
- End-to-end game flow

### 8.3 Performance Tests
- FPS monitoring
- Memory usage
- Projectile limits
- Animation smoothness

## 9. Security Considerations

### 9.1 Client-Side
- Input validation
- Rate limiting on actions
- Sanitized user content
- Protected API calls

### 9.2 Future Server-Side
- Server-authoritative combat
- Anti-cheat measures
- Encrypted communications
- Session management

## 10. Scalability Plan

### 10.1 Phase 1 (Current)
- Single-player focus
- Local storage
- Client-side logic

### 10.2 Phase 2
- Backend API
- Database storage
- User accounts
- Cloud saves

### 10.3 Phase 3
- Real-time multiplayer
- Matchmaking
- Tournaments
- Trading system

## 11. Technology Stack

### Frontend
- **React** 18.2+ - UI framework
- **TypeScript** 5.3+ - Type safety
- **Vite** 5.1+ - Build tool
- **Framer Motion** 11+ - Animations
- **Zustand** 4.5+ - State management

### Testing
- **Vitest** 1.3+ - Test runner
- **Playwright** 1.54+ - E2E testing

### Future Backend
- **Node.js** - Runtime
- **Express/Fastify** - API framework
- **PostgreSQL** - Database
- **Redis** - Caching
- **Socket.IO** - WebSockets

---

# 🌐 WEB DEVELOPMENT ARCHITECTURE PATTERNS

## 🏢 Frontend Architecture Patterns
```javascript
// Component-based architecture
components/
├── atoms/          // Basic UI elements (Button, Input)
├── molecules/      // Composite components (FormField, Card)
├── organisms/      // Complex components (Header, Dashboard)
├── templates/      // Page templates
└── pages/          // Page components

// State Management
store/
├── slices/         // Redux slices / Zustand stores
├── actions/        // Action creators
├── selectors/      // Memoized selectors
└── middleware/     // Custom middleware
```

## 🏠 Backend Architecture (MVC Pattern)
```javascript
// Model-View-Controller structure
server/
├── models/         // Data models (User, Product)
├── views/          // Response formatting
├── controllers/    // Business logic
├── routes/         // API endpoints
├── middleware/     // Auth, validation, logging
└── services/       // External integrations
```

## 📊 API Design Standards
```javascript
// RESTful endpoints
GET    /api/users           // List users
GET    /api/users/:id       // Get user
POST   /api/users           // Create user
PUT    /api/users/:id       // Update user
DELETE /api/users/:id       // Delete user

// Response format
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

# 🔒 WEB SECURITY CHECKLIST

## 🔐 Authentication & Authorization
```javascript
// JWT avec httpOnly cookies
const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1h',
    refreshExpiresIn: '7d'
  },
  cookies: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
};

// RBAC (Role-Based Access Control)
const roles = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read']
};
```

## 🚪 Protection Patterns
```javascript
// XSS Protection
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"]
  }
}));

// CSRF Protection
app.use(csrf({ cookie: true }));

// SQL Injection Prevention (avec ORM)
const user = await User.findOne({
  where: { email: sanitize(email) }
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests
});
```

# 🧪 WEB TESTING STRATEGY

## 🔼 Testing Pyramid (Exécution Parallèle)
```bash
# TOUT exécuter en parallèle
[BatchTool - Testing]:
  # Unit Tests
  Bash "npm run test:unit:frontend"
  Bash "npm run test:unit:backend"

  # Integration Tests
  Bash "npm run test:integration:api"
  Bash "npm run test:integration:db"

  # E2E Tests
  Bash "npm run test:e2e:chrome"
  Bash "npm run test:e2e:firefox"

  # Performance Tests
  Bash "npm run test:lighthouse"
  Bash "npm run test:load"
```

## 📋 Test Organization
```javascript
// Frontend Component Test
describe('Dashboard Component', () => {
  it('should render user data', async () => {
    render(<Dashboard user={mockUser} />);
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });
});

// Backend API Test
describe('POST /api/users', () => {
  it('should create user with valid data', async () => {
    const res = await request(app)
      .post('/api/users')
      .send(validUserData)
      .expect(201);

    expect(res.body.success).toBe(true);
  });
});
```

# ⚡ WEB PERFORMANCE OPTIMIZATION

## 🌍 Frontend Optimization
```javascript
// Code Splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Image Optimization
<img
  src="image.webp"
  loading="lazy"
  srcSet="image-320w.jpg 320w, image-640w.jpg 640w"
/>

// Bundle Optimization
webpack: {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          priority: 10
        }
      }
    }
  }
}
```

## 🛠️ Backend Optimization
```javascript
// Database Connection Pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Redis Caching
const cachedData = await redis.get(key);
if (cachedData) return JSON.parse(cachedData);

// Response Compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));
```

# 📁 Organisation Fichiers Web Full-Stack

## 🏡 Structure Standard 
- `/src` → Code source frontend
- `/server` → Code backend/API
- `/tests` → Fichiers test
- `/docs` → Documentation
- `/config` → Configuration
- `/scripts` → Scripts utilitaires
- `/public` → Assets statiques

## 🌐 Structure Web Full-Stack
```
project/
├── src/                    # Frontend
│   ├── components/         # UI Components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── store/             # State management
│   └── utils/             # Utilities
├── server/                 # Backend
│   ├── routes/            # API routes
│   ├── controllers/       # Business logic
│   ├── models/            # Database models
│   ├── middleware/        # Custom middleware
│   └── services/          # External services
├── tests/                  # Tests
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
└── migrations/            # Database migrations
```

# ⚡ WEB DEVELOPMENT - PATTERN FULL-STACK PARALLÈLE

```javascript
// TOUJOURS développer Frontend + Backend simultanément
[BatchTool]:
  // Frontend Components (React/Vue/Angular)
  Write "src/components/Header.tsx" [headerContent]
  Write "src/components/Dashboard.tsx" [dashboardContent]
  Write "src/components/UserProfile.tsx" [profileContent]
  Write "src/hooks/useAuth.ts" [authHookContent]

  // Backend API (Node/Express)
  Write "server/routes/auth.js" [authRoutes]
  Write "server/routes/users.js" [userRoutes]
  Write "server/controllers/authController.js" [authController]
  Write "server/models/User.js" [userModel]

  // Database & Config
  Write "server/config/database.js" [dbConfig]
  Write "migrations/001_create_users.sql" [migration]

  // Tests (Frontend + Backend)
  Write "tests/frontend/components.test.tsx" [frontendTests]
  Write "tests/backend/api.test.js" [backendTests]
  Write "tests/e2e/userflow.test.js" [e2eTests]

  // Configuration Files
  Write "package.json" [packageConfig]
  Write "docker-compose.yml" [dockerConfig]
  Write ".env.example" [envExample]

  // Execute ALL commands
  Bash "npm install && npm run dev"
  Bash "docker-compose up -d"
  Bash "npm run test:all"
```

## 🌐 Web Development Commands
```bash
# Frontend Development
npm run dev           # Start dev server
npm run build        # Production build
npm run lint         # Lint code
npm run test         # Run tests

# Backend Development
npm run server       # Start API server
npm run migrate      # Run migrations
npm run seed         # Seed database

# Full-Stack
npm run dev:all      # Frontend + Backend
npm run test:all     # All tests parallel
npm run docker:up    # Docker environment
```
