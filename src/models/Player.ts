// Player Models - All player-related data structures

import { Card } from './unified/Card';
import { CombatStats } from './Combat';

export interface Player {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  
  // Currency
  coins: number;
  gems: number;
  
  // Collections
  cards: Card[];
  achievements: Achievement[];
  
  // Statistics
  stats: PlayerStats;
  preferences: PlayerPreferences;
  
  // Account Info
  createdAt: string;
  lastLoginAt: string;
  isOnline: boolean;
  status: PlayerStatus;
  
  // Social
  friends: Friend[];
  blockedUsers: string[];
  
  // Progress
  unlockedContent: UnlockedContent[];
  currentSeason: SeasonProgress;
  battlepass: BattlepassProgress;
}

export interface PlayerStats {
  // Combat Stats
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  winRate: number;
  
  // Combat Performance
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalKills: number;
  totalDeaths: number;
  averageKDA: number;
  longestKillStreak: number;
  
  // Projectile Stats
  projectilesFired: number;
  projectilesHit: number;
  accuracy: number;
  criticalHits: number;
  
  // Time Stats
  totalPlayTime: number;
  averageMatchDuration: number;
  longestMatch: number;
  shortestMatch: number;
  
  // Card Stats
  cardsOwned: number;
  uniqueCardsOwned: number;
  favoriteCard: string;
  mostUsedCard: string;
  cardsEarned: number;
  cardsCrafted: number;
  
  // Progression Stats
  levelsGained: number;
  experienceEarned: number;
  achievementsUnlocked: number;
  
  // Economic Stats
  coinsEarned: number;
  coinsSpent: number;
  gemsEarned: number;
  gemsSpent: number;
  
  // Seasonal Stats
  currentSeasonRank: PlayerRank;
  highestSeasonRank: PlayerRank;
  seasonWins: number;
  seasonLosses: number;
}

export interface PlayerPreferences {
  // Audio
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  voiceVolume: number;
  
  // Video
  resolution: string;
  fullscreen: boolean;
  vsync: boolean;
  frameRateLimit: number;
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  
  // Gameplay
  autoFire: boolean;
  fireRate: number;
  mouseSensitivity: number;
  showDamageNumbers: boolean;
  showHealthBars: boolean;
  colorBlindMode: boolean;
  
  // UI
  showFPS: boolean;
  showPing: boolean;
  chatEnabled: boolean;
  showPlayerNames: boolean;
  uiScale: number;
  
  // Controls
  keyBindings: KeyBindings;
  
  // Social
  allowFriendRequests: boolean;
  allowPartyInvites: boolean;
  showOnlineStatus: boolean;
  
  // Notifications
  achievementNotifications: boolean;
  friendNotifications: boolean;
  matchNotifications: boolean;
  
  // Privacy
  showProfile: boolean;
  showStats: boolean;
  allowSpectators: boolean;
}

export interface KeyBindings {
  moveUp: string;
  moveDown: string;
  moveLeft: string;
  moveRight: string;
  fire: string;
  specialAbility1: string;
  specialAbility2: string;
  specialAbility3: string;
  pause: string;
  chat: string;
  scoreboard: string;
}

export type PlayerStatus = 
  | 'online' 
  | 'away' 
  | 'busy' 
  | 'invisible' 
  | 'offline';

export interface Friend {
  playerId: string;
  username: string;
  status: PlayerStatus;
  addedAt: string;
  lastSeenAt: string;
  favoriteStatus: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  points: number;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  rewards: AchievementReward[];
}

export type AchievementCategory = 
  | 'combat' 
  | 'collection' 
  | 'progression' 
  | 'social' 
  | 'seasonal' 
  | 'special';

export interface AchievementReward {
  type: 'xp' | 'coins' | 'gems' | 'card' | 'title' | 'avatar';
  amount: number;
  item?: string;
}

export interface UnlockedContent {
  id: string;
  type: 'arena' | 'gamemode' | 'cosmetic' | 'feature';
  unlockedAt: string;
  requirements: UnlockRequirement[];
}

export interface UnlockRequirement {
  type: 'level' | 'achievement' | 'wins' | 'cards_owned' | 'payment';
  value: number | string;
  description: string;
}

export interface PlayerRank {
  tier: RankTier;
  division: number;
  points: number;
  pointsToNextRank: number;
  winStreak: number;
  lossStreak: number;
}

export type RankTier = 
  | 'bronze' 
  | 'silver' 
  | 'gold' 
  | 'platinum' 
  | 'diamond' 
  | 'master' 
  | 'grandmaster';

export interface SeasonProgress {
  seasonId: string;
  currentLevel: number;
  experience: number;
  experienceToNext: number;
  rank: PlayerRank;
  rewards: SeasonReward[];
  passType: 'free' | 'premium';
}

export interface SeasonReward {
  level: number;
  type: 'xp' | 'coins' | 'gems' | 'card' | 'cosmetic';
  amount: number;
  item?: string;
  claimed: boolean;
  premium: boolean;
}

export interface BattlepassProgress {
  seasonId: string;
  currentTier: number;
  experience: number;
  experienceToNext: number;
  isPremium: boolean;
  rewards: BattlepassReward[];
  weeklyQuests: WeeklyQuest[];
  dailyQuests: DailyQuest[];
}

export interface BattlepassReward {
  tier: number;
  type: 'xp' | 'coins' | 'gems' | 'card' | 'cosmetic' | 'title';
  amount: number;
  item?: string;
  claimed: boolean;
  premium: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'seasonal' | 'special';
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  expiresAt?: string;
  rewards: QuestReward[];
}

export interface DailyQuest extends Quest {
  category: 'daily';
  resetsAt: string;
}

export interface WeeklyQuest extends Quest {
  category: 'weekly';
  resetsAt: string;
}

export interface QuestReward {
  type: 'xp' | 'coins' | 'gems' | 'card' | 'battlepass_xp';
  amount: number;
  item?: string;
}

export interface PlayerProfile {
  player: Player;
  recentMatches: MatchHistory[];
  favoriteCards: Card[];
  achievements: Achievement[];
  currentRank: PlayerRank;
  isPublic: boolean;
}

export interface MatchHistory {
  matchId: string;
  mode: string;
  result: 'win' | 'loss' | 'draw';
  duration: number;
  playedAt: string;
  stats: CombatStats;
  opponents: string[];
  deckUsed: string;
}

export interface PlayerSession {
  sessionId: string;
  playerId: string;
  startTime: string;
  endTime?: string;
  isActive: boolean;
  location: string;
  device: string;
  activities: SessionActivity[];
}

export interface SessionActivity {
  type: 'match' | 'deckbuilding' | 'collection' | 'shop' | 'social';
  startTime: string;
  endTime?: string;
  duration: number;
  data?: Record<string, unknown>;
}

export interface PlayerNotification {
  id: string;
  type: 'friend_request' | 'achievement' | 'match_invite' | 'system' | 'update';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  style: 'primary' | 'secondary' | 'danger';
}