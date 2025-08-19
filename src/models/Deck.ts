// Deck Models - All deck and deck building related data structures

import { UnifiedCard } from './unified/Card';

export interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: UnifiedCard[];
  isActive: boolean;
  isValid: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  
  // Configuration
  maxSize: number;
  minSize: number;
  format: DeckFormat;
  
  // Statistics
  stats: DeckStats;
  
  // Visual
  coverCard?: string;
  theme: DeckTheme;
  
  // Sharing
  isPublic: boolean;
  likes: number;
  downloads: number;
  tags: string[];
  
  // Tournament
  isTournamentLegal: boolean;
  bannedCards: string[];
  restrictedCards: { cardId: string; maxCopies: number; }[];
}

export interface DeckStats {
  // Computed Stats
  totalHealth: number;
  totalDamage: number;
  averageDamage: number;
  averageHealth: number;
  
  // Rarity Distribution
  rarityDistribution: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
    mythic: number;
    cosmic: number;
    divine: number;
    infinity: number;
  };
  
  // Type Distribution
  typeDistribution: Record<string, number>;
  
  // Combat Metrics
  projectedFireRate: number;
  projectedDPS: number;
  projectedSurvivability: number;
  
  // Effectiveness Ratings
  offensiveRating: number;
  defensiveRating: number;
  utilityRating: number;
  synergyRating: number;
  overallRating: number;
  
  // Match Performance (if available)
  winRate?: number;
  averageMatchDuration?: number;
  popularityScore?: number;
}

export type DeckFormat = 
  | 'standard' 
  | 'wild' 
  | 'arena' 
  | 'tournament' 
  | 'casual' 
  | 'ranked' 
  | 'custom';

export interface DeckTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardBackDesign: string;
  iconSet: string;
  name: string;
}

export interface DeckTemplate {
  id: string;
  name: string;
  description: string;
  author: string;
  category: DeckCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Template Data
  requiredCards: TemplateCard[];
  optionalCards: TemplateCard[];
  alternatives: CardAlternative[];
  
  // Strategy
  strategy: string;
  strengths: string[];
  weaknesses: string[];
  playStyle: PlayStyle;
  
  // Meta
  isPopular: boolean;
  winRate: number;
  lastUpdated: string;
  version: string;
  tags: string[];
}

export interface TemplateCard {
  cardId: string;
  copies: number;
  importance: 'core' | 'important' | 'optional';
  reasoning: string;
}

export interface CardAlternative {
  originalCardId: string;
  alternatives: {
    cardId: string;
    reasoning: string;
    costDifference: number;
  }[];
}

export type DeckCategory = 
  | 'aggro' 
  | 'control' 
  | 'midrange' 
  | 'combo' 
  | 'tempo' 
  | 'value' 
  | 'synergy' 
  | 'meme';

export type PlayStyle = 
  | 'aggressive' 
  | 'defensive' 
  | 'balanced' 
  | 'burst' 
  | 'sustained' 
  | 'utility';

export interface DeckBuilder {
  currentDeck: Deck;
  availableCards: UnifiedCard[];
  filters: DeckBuilderFilters;
  sortBy: DeckBuilderSort;
  viewMode: 'grid' | 'list' | 'compact';
  showStats: boolean;
  autoValidate: boolean;
  suggestions: DeckSuggestion[];
}

export interface DeckBuilderFilters {
  rarity: string[];
  type: string[];
  cost: { min: number; max: number; };
  damage: { min: number; max: number; };
  health: { min: number; max: number; };
  owned: boolean | null;
  search: string;
  tags: string[];
}

export type DeckBuilderSort = 
  | 'name' 
  | 'rarity' 
  | 'cost' 
  | 'damage' 
  | 'health' 
  | 'type' 
  | 'newest' 
  | 'oldest';

export interface DeckSuggestion {
  type: 'add_card' | 'remove_card' | 'replace_card' | 'adjust_balance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  reasoning: string;
  
  // Actions
  cardToAdd?: string;
  cardToRemove?: string;
  cardToReplace?: { from: string; to: string; };
  
  // Impact
  statChanges: {
    stat: string;
    currentValue: number;
    newValue: number;
  }[];
}

export interface DeckValidation {
  isValid: boolean;
  errors: DeckValidationError[];
  warnings: DeckValidationWarning[];
  suggestions: DeckSuggestion[];
}

export interface DeckValidationError {
  type: 'size' | 'duplicates' | 'banned' | 'format' | 'cost';
  message: string;
  severity: 'error' | 'warning';
  affectedCards?: string[];
}

export interface DeckValidationWarning {
  type: 'balance' | 'synergy' | 'meta' | 'efficiency';
  message: string;
  severity: 'info' | 'warning';
  suggestion?: string;
}

export interface DeckAnalyzer {
  analyzeDeck: (deck: Deck) => DeckAnalysis;
  suggestImprovements: (deck: Deck) => DeckSuggestion[];
  compareDecks: (deck1: Deck, deck2: Deck) => DeckComparison;
  calculateSynergies: (cards: UnifiedCard[]) => SynergyAnalysis;
  predictWinRate: (deck: Deck, format: DeckFormat) => number;
}

export interface DeckAnalysis {
  strengths: AnalysisPoint[];
  weaknesses: AnalysisPoint[];
  recommendations: string[];
  
  // Curve Analysis
  costCurve: { cost: number; count: number; }[];
  optimalCurve: { cost: number; count: number; }[];
  curveScore: number;
  
  // Balance Analysis
  offenseDefenseRatio: number;
  consistencyScore: number;
  flexibilityScore: number;
  
  // Meta Analysis
  metaScore: number;
  popularCards: string[];
  unusualCards: string[];
  
  // Synergy Analysis
  synergies: SynergyAnalysis;
}

export interface AnalysisPoint {
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  severity: number; // 1-10
  affectedCards?: string[];
}

export interface SynergyAnalysis {
  totalSynergyScore: number;
  synergyGroups: SynergyGroup[];
  unusedSynergies: PotentialSynergy[];
}

export interface SynergyGroup {
  cards: string[];
  type: string;
  description: string;
  strength: number;
  isOptimal: boolean;
}

export interface PotentialSynergy {
  requiredCards: string[];
  missingCards: string[];
  description: string;
  potentialStrength: number;
}

export interface DeckComparison {
  similarities: string[];
  differences: string[];
  advantagesToDeck1: string[];
  advantagesToDeck2: string[];
  
  // Statistical Comparison
  statComparisons: {
    stat: string;
    deck1Value: number;
    deck2Value: number;
    winner: 'deck1' | 'deck2' | 'tie';
  }[];
  
  // Card Overlap
  sharedCards: UnifiedCard[];
  uniqueToDeck1: UnifiedCard[];
  uniqueToDeck2: UnifiedCard[];
  overlapPercentage: number;
}

export interface DeckHistory {
  deckId: string;
  versions: DeckVersion[];
  branches: DeckBranch[];
}

export interface DeckVersion {
  version: number;
  timestamp: string;
  changes: DeckChange[];
  author: string;
  description?: string;
  performance?: DeckPerformance;
}

export interface DeckBranch {
  id: string;
  name: string;
  parentVersion: number;
  description: string;
  createdAt: string;
}

export interface DeckChange {
  type: 'add' | 'remove' | 'replace' | 'metadata';
  cardId?: string;
  previousCardId?: string;
  copies?: number;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export interface DeckPerformance {
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  averageDuration: number;
  popularityRank: number;
  lastPlayed: string;
}

export interface DeckImportExport {
  format: 'json' | 'text' | 'url' | 'qr';
  data: string;
  metadata?: {
    exportedAt: string;
    exportedBy: string;
    version: string;
    checksum: string;
  };
}

export interface DeckCollection {
  decks: Deck[];
  folders: DeckFolder[];
  favorites: string[];
  recentlyUsed: string[];
  templates: DeckTemplate[];
  sharedDecks: SharedDeck[];
}

export interface DeckFolder {
  id: string;
  name: string;
  description?: string;
  deckIds: string[];
  parentFolderId?: string;
  createdAt: string;
  color?: string;
  icon?: string;
}

export interface SharedDeck {
  originalDeckId: string;
  sharedBy: string;
  sharedAt: string;
  permissions: 'view' | 'copy' | 'edit';
  deck: Deck;
}