import { TrajectoryPattern } from '../types/emoji';
import { CombatEntity } from '../services/CombatEngine';

/**
 * EmojiProjectile class for bullet-hell combat system
 */
export class EmojiProjectile {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public active: boolean = true;
  public age: number = 0;
  public maxAge: number = 10; // 10 seconds max lifetime
  
  private trajectory: TrajectoryPattern;
  private speed: number;
  private target?: CombatEntity;
  private owner: CombatEntity;
  private emoji: any; // Emoji data
  private size: number = 20;
  
  // Animation properties
  private rotation: number = 0;
  private scale: number = 1;
  private opacity: number = 1;
  private trail: { x: number; y: number; opacity: number }[] = [];
  
  constructor(
    emoji: any,
    x: number,
    y: number,
    target?: CombatEntity,
    owner?: CombatEntity
  ) {
    this.x = x;
    this.y = y;
    this.emoji = emoji;
    this.target = target;
    this.owner = owner!;
    this.trajectory = emoji.trajectory || 'straight';
    this.speed = (emoji.projectileSpeed || 1) * 200; // pixels per second
    
    this.initializeMovement();
  }
  
  private initializeMovement(): void {
    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
      }
    } else {
      // Default movement (right for player, left for enemy)
      this.vx = this.owner.isPlayer ? this.speed : -this.speed;
      this.vy = 0;
    }
  }
  
  update(deltaTime: number): void {
    if (!this.active) return;
    
    this.age += deltaTime;
    if (this.age > this.maxAge) {
      this.active = false;
      return;
    }
    
    // Store previous position for trail
    this.trail.push({ x: this.x, y: this.y, opacity: 0.5 });
    if (this.trail.length > 5) {
      this.trail.shift();
    }
    
    // Update trail opacity
    this.trail.forEach((point, index) => {
      point.opacity = (index + 1) / this.trail.length * 0.3;
    });
    
    // Apply trajectory-specific movement
    this.applyTrajectoryMovement(deltaTime);
    
    // Update position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    // Update visual effects
    this.rotation += deltaTime * 2; // 2 radians per second
    this.scale = 1 + Math.sin(this.age * 5) * 0.1; // Pulsing effect
    
    // Boundary check
    if (this.x < -50 || this.x > 1250 || this.y < -50 || this.y > 850) {
      this.active = false;
    }
  }
  
  private applyTrajectoryMovement(deltaTime: number): void {
    switch (this.trajectory) {
      case 'wave':
        this.vy += Math.sin(this.age * 8) * 100 * deltaTime;
        break;
        
      case 'spiral':
        const spiralRadius = 50;
        const spiralSpeed = this.age * 4;
        this.vx += Math.cos(spiralSpeed) * spiralRadius * deltaTime;
        this.vy += Math.sin(spiralSpeed) * spiralRadius * deltaTime;
        break;
        
      case 'homing':
        if (this.target && this.target.isAlive) {
          const dx = this.target.x - this.x;
          const dy = this.target.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const homingStrength = 300; // pixels/sec^2
            this.vx += (dx / distance) * homingStrength * deltaTime;
            this.vy += (dy / distance) * homingStrength * deltaTime;
            
            // Limit speed
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (currentSpeed > this.speed * 2) {
              this.vx = (this.vx / currentSpeed) * this.speed * 2;
              this.vy = (this.vy / currentSpeed) * this.speed * 2;
            }
          }
        }
        break;
        
      case 'random':
        if (Math.random() < 0.1) { // 10% chance per frame to change direction
          this.vx += (Math.random() - 0.5) * 100;
          this.vy += (Math.random() - 0.5) * 100;
        }
        break;
        
      default: // 'straight'
        // No additional movement
        break;
    }
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;
    
    ctx.save();
    
    // Render trail
    this.trail.forEach(point => {
      ctx.globalAlpha = point.opacity;
      ctx.font = `${this.size * 0.6}px Arial`;
      ctx.fillText(this.emoji.character, point.x - 10, point.y + 10);
    });
    
    // Render main projectile
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);
    
    // Add glow effect for special trajectories
    if (this.trajectory === 'homing') {
      ctx.shadowColor = '#ff6b6b';
      ctx.shadowBlur = 10;
    } else if (this.trajectory === 'spiral') {
      ctx.shadowColor = '#4ecdc4';
      ctx.shadowBlur = 8;
    }
    
    ctx.font = `${this.size}px Arial`;
    ctx.fillText(this.emoji.character, -10, 10);
    
    ctx.restore();
  }
  
  getCollisionBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.size / 2,
      y: this.y - this.size / 2,
      width: this.size,
      height: this.size
    };
  }
  
  onHit(target: CombatEntity): void {
    if (this.emoji.applyEffect) {
      this.emoji.applyEffect(target);
    }
    
    // Apply base damage
    const damage = this.emoji.baseDamage || 1;
    target.takeDamage(damage);
    
    this.active = false;
  }
}

/**
 * Factory for creating emoji objects
 */
export class EmojiFactory {
  static createEmoji(character: string): any {
    // Basic emoji database - expanded version
    const emojiDatabase: Record<string, any> = {
      '🔥': { character: '🔥', name: 'Fire', baseDamage: 3, trajectory: 'straight', effectType: 'burn', projectileSpeed: 1.2 },
      '❄️': { character: '❄️', name: 'Ice', baseDamage: 2, trajectory: 'straight', effectType: 'freeze', projectileSpeed: 0.8 },
      '⚡': { character: '⚡', name: 'Lightning', baseDamage: 4, trajectory: 'homing', effectType: 'chain', projectileSpeed: 2.0 },
      '🌪️': { character: '🌪️', name: 'Tornado', baseDamage: 2, trajectory: 'spiral', effectType: 'knockback', projectileSpeed: 1.0 },
      '🎯': { character: '🎯', name: 'Target', baseDamage: 5, trajectory: 'homing', effectType: 'pierce', projectileSpeed: 1.5 },
      '💫': { character: '💫', name: 'Star', baseDamage: 3, trajectory: 'wave', effectType: 'multi_hit', projectileSpeed: 1.3 },
      '🌊': { character: '🌊', name: 'Wave', baseDamage: 2, trajectory: 'wave', effectType: 'slow', projectileSpeed: 0.9 },
      '🗲': { character: '🗲', name: 'Bolt', baseDamage: 6, trajectory: 'straight', effectType: 'damage', projectileSpeed: 2.5 },
      '💥': { character: '💥', name: 'Explosion', baseDamage: 4, trajectory: 'straight', effectType: 'area', projectileSpeed: 1.0 },
      '🎪': { character: '🎪', name: 'Chaos', baseDamage: 3, trajectory: 'random', effectType: 'confuse', projectileSpeed: 1.4 },
      // Default fallback
      '❓': { character: character, name: 'Unknown', baseDamage: 1, trajectory: 'straight', effectType: 'damage', projectileSpeed: 1.0 }
    };
    
    return emojiDatabase[character] || { ...emojiDatabase['❓'], character };
  }
}

// Utility function to get random trajectory
export function getRandomTrajectory(): TrajectoryPattern {
  const trajectories: TrajectoryPattern[] = ['straight', 'wave', 'spiral', 'homing', 'random'];
  return trajectories[Math.floor(Math.random() * trajectories.length)];
}

// Clean emoji system with no duplicate classes
