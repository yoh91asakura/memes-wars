import { CombatEngine } from './CombatEngine';
import { UnifiedCard } from '../models/unified/Card';
import { Deck } from '../stores/gameStore';
import { CombatArena } from '../models/Combat';

export interface BattleSetup {
  playerDeck: Deck;
  opponentDeck: Deck;
  arena: CombatArena;
  battleType: 'pvp' | 'pve' | 'training';
}

export interface BattleResult {
  winner: string;
  duration: number;
  playerStats: BattlePlayerStats;
  opponentStats: BattlePlayerStats;
  cardsUsed: {
    player: UnifiedCard[];
    opponent: UnifiedCard[];
  };
}

export interface BattlePlayerStats {
  damageDealt: number;
  damageReceived: number;
  projectilesFired: number;
  accuracy: number;
  kills: number;
  cards: UnifiedCard[];
}

export class BattleService {
  private engine: CombatEngine | null = null;
  private currentBattle: BattleSetup | null = null;

  constructor() {}

  public async startBattle(setup: BattleSetup): Promise<BattleResult> {
    this.currentBattle = setup;
    this.engine = new CombatEngine(setup.arena);

    // Initialize combat with decks
    this.engine.initialize(setup.playerDeck, setup.opponentDeck);
    this.engine.startBattle();

    // Return promise that resolves when battle ends
    return new Promise((resolve) => {
      if (!this.engine) {
        throw new Error('Battle engine not initialized');
      }

      this.engine.addEventListener('match_ended', (event) => {
        const result = this.processBattleResult(event);
        resolve(result);
      });
    });
  }

  public getBattleState() {
    return this.engine?.getState();
  }

  public pauseBattle() {
    this.engine?.pause();
  }

  public resumeBattle() {
    this.engine?.resume();
  }

  public endBattle() {
    this.engine?.pause();
    this.engine = null;
    this.currentBattle = null;
  }

  public createTrainingArena(): CombatArena {
    return {
      id: 'training_arena',
      width: 1200,
      height: 800,
      boundaries: [
        { x: 0, y: 0, width: 1200, height: 20 },
        { x: 0, y: 780, width: 1200, height: 20 },
        { x: 0, y: 0, width: 20, height: 800 },
        { x: 1180, y: 0, width: 20, height: 800 }
      ],
      obstacles: [
        {
          id: 'center_wall',
          position: { x: 550, y: 350 },
          size: { width: 100, height: 100 },
          type: 'bouncy',
          health: 100,
          maxHealth: 100
        }
      ],
      playerSpawns: [
        { x: 200, y: 400 },
        { x: 1000, y: 400 }
      ],
      powerupSpawns: [],
      settings: {
        gravity: 200,
        friction: 0.98,
        bounceMultiplier: 0.8,
        maxProjectiles: 50,
        tickRate: 60,
        roundDuration: 60000,
        suddenDeathTime: 45000
      }
    };
  }

  public createPvPArena(): CombatArena {
    return {
      id: 'pvp_arena',
      width: 1400,
      height: 900,
      boundaries: [
        { x: 0, y: 0, width: 1400, height: 20 },
        { x: 0, y: 880, width: 1400, height: 20 },
        { x: 0, y: 0, width: 20, height: 900 },
        { x: 1380, y: 0, width: 20, height: 900 }
      ],
      obstacles: [
        {
          id: 'left_wall',
          position: { x: 400, y: 300 },
          size: { width: 80, height: 200 },
          type: 'bouncy',
          health: 150,
          maxHealth: 150
        },
        {
          id: 'right_wall',
          position: { x: 920, y: 400 },
          size: { width: 80, height: 200 },
          type: 'bouncy',
          health: 150,
          maxHealth: 150
        }
      ],
      playerSpawns: [
        { x: 200, y: 450 },
        { x: 1200, y: 450 }
      ],
      powerupSpawns: [
        { x: 700, y: 200 },
        { x: 700, y: 700 }
      ],
      settings: {
        gravity: 150,
        friction: 0.99,
        bounceMultiplier: 0.85,
        maxProjectiles: 100,
        tickRate: 60,
        roundDuration: 120000,
        suddenDeathTime: 90000
      }
    };
  }

  private processBattleResult(event: any): BattleResult {
    const winnerId = event.data.winner;
    const state = this.engine?.getState();
    
    if (!state || !this.currentBattle) {
      throw new Error('Cannot process battle result - missing state');
    }

    const players = state.players;
    
    return {
      winner: winnerId,
      duration: event.data.duration,
      playerStats: this.extractPlayerStats(players[0] || players[1]),
      opponentStats: this.extractPlayerStats(players[1] || players[0]),
      cardsUsed: {
        player: this.currentBattle.playerDeck.cards,
        opponent: this.currentBattle.opponentDeck.cards
      }
    };
  }

  private extractPlayerStats(player: any): BattlePlayerStats {
    if (!player) {
      return {
        damageDealt: 0,
        damageReceived: 0,
        projectilesFired: 0,
        accuracy: 0,
        kills: 0,
        cards: []
      };
    }
    
    return {
      damageDealt: player.damage || 0,
      damageReceived: (player.maxHealth || 0) - (player.health || 0),
      projectilesFired: player.shotsFired || 0,
      accuracy: player.accuracy || 0,
      kills: player.kills || 0,
      cards: player.deck?.cards || []
    };
  }
}