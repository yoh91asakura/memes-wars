// Combat Arena - Main combat rendering component

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useCombat, useCombatEngine, useProjectiles, useCombatCamera, useCombatEffects } from '../../../hooks/useCombat';
import { useAnimation, useParticles } from '../../../hooks/useAnimation';
import { Position, EmojiProjectile, CombatPlayer } from '../../../models/Combat';
import { UnifiedCard } from '../../../models/unified/Card';
import { format } from '../../../utils/format';
import './CombatArena.css';

export interface CombatArenaProps {
  width?: number;
  height?: number;
  className?: string;
}

export const CombatArena: React.FC<CombatArenaProps> = ({
  width = 1200,
  height = 800,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Combat state
  const { 
    isActive, 
    phase, 
    players, 
    timeRemaining, 
    arena, 
    winner,
    showDebugInfo 
  } = useCombat();
  
  // Combat engine
  const { startGameLoop, stopGameLoop, isRunning } = useCombatEngine();
  
  // Projectiles
  const { projectiles, getActiveProjectiles } = useProjectiles();
  
  // Camera
  const { cameraPosition, panCamera, zoomCamera, centerOnAction } = useCombatCamera();
  
  // Effects
  const { screenShake, flashEffect, triggerScreenShake } = useCombatEffects();
  
  // Particles
  const { setCanvas, createExplosion, startRenderLoop, stopRenderLoop } = useParticles();

  // Mouse interaction state
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      setCanvas(canvas);
    }
  }, [width, height, setCanvas]);

  // Start/stop render loops based on combat state
  useEffect(() => {
    if (isActive && phase === 'active') {
      startRenderLoop();
      startGameLoop();
    } else {
      stopRenderLoop();
      stopGameLoop();
    }

    return () => {
      stopRenderLoop();
      stopGameLoop();
    };
  }, [isActive, phase, startRenderLoop, stopRenderLoop, startGameLoop, stopGameLoop]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !arena) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Apply camera transform
    ctx.save();
    ctx.scale(cameraPosition.zoom, cameraPosition.zoom);
    ctx.translate(-cameraPosition.x + width / (2 * cameraPosition.zoom), -cameraPosition.y + height / (2 * cameraPosition.zoom));

    // Apply screen shake
    if (screenShake.intensity > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake.intensity;
      const shakeY = (Math.random() - 0.5) * screenShake.intensity;
      ctx.translate(shakeX, shakeY);
    }

    // Draw arena boundaries
    drawArenaBoundaries(ctx);

    // Draw obstacles
    drawObstacles(ctx);

    // Draw players
    players.forEach(player => drawPlayer(ctx, player));

    // Draw projectiles
    getActiveProjectiles().forEach(projectile => drawProjectile(ctx, projectile));

    // Draw effects
    drawEffects(ctx);

    // Restore transform
    ctx.restore();

    // Draw UI overlays
    drawUI(ctx);

    // Flash effect
    if (flashEffect.intensity > 0) {
      ctx.globalAlpha = flashEffect.intensity;
      ctx.fillStyle = flashEffect.color;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }

    if (isActive && !winner) {
      animationFrameRef.current = requestAnimationFrame(render);
    }
  }, [arena, players, getActiveProjectiles, cameraPosition, screenShake, flashEffect, width, height, isActive, winner]);

  // Start render loop
  useEffect(() => {
    if (isActive) {
      render();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, render]);

  // Drawing functions
  const drawArenaBoundaries = (ctx: CanvasRenderingContext2D) => {
    if (!arena) return;

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    
    arena.boundaries.forEach(boundary => {
      ctx.strokeRect(boundary.x, boundary.y, boundary.width, boundary.height);
    });
  };

  const drawObstacles = (ctx: CanvasRenderingContext2D) => {
    if (!arena) return;

    ctx.fillStyle = '#555';
    
    arena.obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.position.x, obstacle.position.y, obstacle.size.width, obstacle.size.height);
      
      if (obstacle.type === 'bouncy') {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.position.x, obstacle.position.y, obstacle.size.width, obstacle.size.height);
      }
    });
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: CombatPlayer) => {
    if (!player.isAlive) return;

    const { x, y } = player.position;
    
    // Player circle with card-based colors
    const playerColor = player.id === 'player' ? '#3b82f6' : '#ef4444';
    const glowColor = this.getGlowColorForDeck(player.deck?.cards || []);
    
    // Draw glow effect based on deck rarity
    if (glowColor) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10;
    }
    
    ctx.fillStyle = playerColor;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0; // Reset shadow

    // Health bar
    const barWidth = 80;
    const barHeight = 10;
    const barY = y - 45;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(x - barWidth / 2, barY, barWidth, barHeight);
    
    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#10b981' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
    
    // Shield bar
    if (player.shield > 0) {
      const shieldPercent = player.shield / player.maxShield;
      ctx.fillStyle = '#00bcd4';
      ctx.fillRect(x - barWidth / 2, barY - 12, barWidth * shieldPercent, 4);
    }

    // Player name and deck info
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.username, x, y - 55);
    
    // Deck power indicator
    if (player.deck?.cards) {
      const powerLevel = this.calculateDeckPower(player.deck.cards);
      ctx.fillStyle = this.getPowerColor(powerLevel);
      ctx.font = '12px Arial';
      ctx.fillText(`Power: ${powerLevel}`, x, y - 70);
    }

    // Debug info
    if (showDebugInfo) {
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.fillText(`HP: ${Math.floor(player.health)}/${Math.floor(player.maxHealth)}`, x, y + 45);
      ctx.fillText(`Shield: ${Math.floor(player.shield)}`, x, y + 55);
      ctx.fillText(`Cards: ${player.deck?.cards?.length || 0}`, x, y + 65);
    }
  }

  const drawProjectile = (ctx: CanvasRenderingContext2D, projectile: EmojiProjectile) => {
    if (!projectile.isActive) return;

    const { x, y } = projectile.position;

    // Enhanced trail with effects
    if (projectile.trail.length > 1) {
      const trailColor = this.getTrailColor(projectile.emoji);
      ctx.strokeStyle = trailColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(projectile.trail[0].x, projectile.trail[0].y);
      
      for (let i = 1; i < projectile.trail.length; i++) {
        const alpha = (i / projectile.trail.length) * 0.7;
        ctx.globalAlpha = alpha;
        ctx.lineTo(projectile.trail[i].x, projectile.trail[i].y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Enhanced projectile with glow effects
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(projectile.rotation);
    
    // Projectile glow based on damage
    const glowIntensity = Math.min(20, projectile.damage / 10);
    if (glowIntensity > 5) {
      ctx.shadowColor = this.getDamageColor(projectile.damage);
      ctx.shadowBlur = glowIntensity;
    }
    
    ctx.font = `${projectile.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(projectile.emoji, 0, 0);
    
    ctx.shadowBlur = 0;
    ctx.restore();

    // Debug info
    if (showDebugInfo) {
      ctx.fillStyle = '#fff';
      ctx.font = '8px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${Math.floor(projectile.damage)}dmg`, x + 20, y);
      ctx.fillText(`${projectile.bounces}/${projectile.maxBounces}`, x + 20, y + 10);
      
      // Show effects
      if (projectile.effects.length > 0) {
        const effectNames = projectile.effects.map(e => e.type).join(',');
        ctx.fillText(effectNames, x + 20, y + 20);
      }
    }
  }

  const drawEffects = (ctx: CanvasRenderingContext2D) => {
    // This would draw visual effects like explosions, power-ups, etc.
    // For now, just a placeholder
  };

  const drawUI = (ctx: CanvasRenderingContext2D) => {
    // Combat timer
    if (phase === 'active' || phase === 'countdown') {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      
      if (phase === 'countdown') {
        ctx.fillText('GET READY!', width / 2, height / 2);
      } else {
        const timeStr = format.number.duration(timeRemaining / 1000);
        ctx.fillText(timeStr, width / 2, 40);
      }
    }

    // Winner announcement
    if (winner) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${winner.username} Wins!`, width / 2, height / 2);
    }

    // Debug info
    if (showDebugInfo) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 200, 120);
      
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Projectiles: ${getActiveProjectiles().length}`, 15, 25);
      ctx.fillText(`Camera: ${Math.floor(cameraPosition.x)}, ${Math.floor(cameraPosition.y)}`, 15, 40);
      ctx.fillText(`Zoom: ${cameraPosition.zoom.toFixed(2)}x`, 15, 55);
      ctx.fillText(`Phase: ${phase}`, 15, 70);
      ctx.fillText(`Running: ${isRunning}`, 15, 85);
    }
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (e.button === 0) { // Left click - fire projectile
      if (isActive && phase === 'active') {
        const worldPos = screenToWorld({ x, y });
        // Fire projectile at mouse position
        // This would be handled by the combat system
      }
    } else if (e.button === 2) { // Right click - start camera pan
      setIsDragging(true);
      setDragStart({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (isDragging) {
      const deltaX = (x - dragStart.x) / cameraPosition.zoom;
      const deltaY = (y - dragStart.y) / cameraPosition.zoom;
      panCamera(-deltaX, -deltaY);
      setDragStart({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    zoomCamera(zoomDelta);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent context menu
  };

  // Helper functions for enhanced rendering
  const getGlowColorForDeck = (cards: UnifiedCard[]): string | null => {
    if (!cards || cards.length === 0) return null;
    
    const rarityCounts = cards.reduce((acc, card) => {
      const rarity = card.rarity || 'common';
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (rarityCounts.cosmic) return '#ff00ff';
    if (rarityCounts.legendary >= 2) return '#ffd700';
    if (rarityCounts.epic >= 3) return '#ff6b00';
    if (rarityCounts.rare >= 5) return '#00ff00';
    
    return null;
  };

  const calculateDeckPower = (cards: UnifiedCard[]): number => {
    if (!cards) return 0;
    
    return cards.reduce((power, card) => {
      const rarityValues = {
        common: 1, rare: 3, epic: 6, legendary: 12, mythic: 25, cosmic: 50
      };
      const rarityValue = rarityValues[card.rarity || 'common'] || 1;
      const statsValue = (card.stats?.damage || 0) + (card.stats?.health || 0) + (card.stats?.speed || 0);
      return power + rarityValue + statsValue;
    }, 0);
  };

  const getPowerColor = (power: number): string => {
    if (power >= 100) return '#ff00ff';
    if (power >= 75) return '#ffd700';
    if (power >= 50) return '#ff6b00';
    if (power >= 25) return '#00ff00';
    return '#ffffff';
  };

  const getTrailColor = (emoji: string): string => {
    const colorMap: Record<string, string> = {
      '💥': '#ff4444',
      '🔥': '#ff6600',
      '⚡': '#ffff00',
      '💨': '#00ccff',
      '🌟': '#ffffff',
      '💯': '#ff00ff',
      '🎯': '#00ff00',
      '💢': '#ff0000'
    };
    return colorMap[emoji] || '#ffffff';
  };

  const getDamageColor = (damage: number): string => {
    if (damage >= 50) return '#ff0000';
    if (damage >= 30) return '#ff6600';
    if (damage >= 15) return '#ffff00';
    return '#ffffff';
  };

  // Convert screen coordinates to world coordinates
  const screenToWorld = (screenPos: Position): Position => {
    return {
      x: (screenPos.x - width / 2) / cameraPosition.zoom + cameraPosition.x,
      y: (screenPos.y - height / 2) / cameraPosition.zoom + cameraPosition.y
    };
  };

  return (
    <div className={`combat-arena ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'crosshair',
          border: '2px solid #333',
          borderRadius: '8px'
        }}
      />
      
      {/* Enhanced combat controls overlay */}
      <div className="combat-controls">
        <button onClick={centerOnAction} className="control-btn" title="Center camera on action">
          📍 Center
        </button>
        <button onClick={() => useCombatStore.getState().toggleDebugInfo()} className="control-btn" title="Toggle debug overlay">
          🔍 Debug
        </button>
        {phase === 'active' && (
          <button onClick={() => useCombatStore.getState().pauseCombat()} className="control-btn pause-btn" title="Pause combat">
            ⏸️ Pause
          </button>
        )}
        {phase === 'paused' && (
          <button onClick={() => useCombatStore.getState().resumeCombat()} className="control-btn resume-btn" title="Resume combat">
            ▶️ Resume
          </button>
        )}
      </div>
      
      {/* Card info overlay */}
      <div className="card-info-overlay">
        <div className="deck-info">
          <h4>Active Cards</h4>
          <div className="card-count">
            {players.map(player => (
              <div key={player.id} className="player-cards">
                <span className="player-name">{player.username}</span>
                <span className="card-count">{player.deck?.cards?.length || 0} cards</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};