// Combat Arena - Main combat rendering component

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useCombat, useCombatEngine, useProjectiles, useCombatCamera, useCombatEffects } from '../../../hooks/useCombat';
import { useParticles } from '../../../hooks/useAnimation';
import { Position, EmojiProjectile, CombatPlayer } from '../../../models/Combat';
import { useCombatStore } from '../../../stores/combatStore';
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
    
    // Player circle
    ctx.fillStyle = player.id === 'player' ? '#3b82f6' : '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Health bar
    const barWidth = 60;
    const barHeight = 8;
    const barY = y - 40;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(x - barWidth / 2, barY, barWidth, barHeight);
    
    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#10b981' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(x - barWidth / 2, barY, barWidth * healthPercent, barHeight);

    // Player name
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.username, x, y - 50);

    // Debug info
    if (showDebugInfo) {
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.fillText(`HP: ${Math.floor(player.health)}/${Math.floor(player.maxHealth)}`, x, y + 45);
      ctx.fillText(`Pos: ${Math.floor(x)}, ${Math.floor(y)}`, x, y + 55);
    }
  };

  const drawProjectile = (ctx: CanvasRenderingContext2D, projectile: EmojiProjectile) => {
    if (!projectile.isActive) return;

    const { x, y } = projectile.position;

    // Draw trail
    if (projectile.trail.length > 1) {
      ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(projectile.trail[0].x, projectile.trail[0].y);
      
      for (let i = 1; i < projectile.trail.length; i++) {
        ctx.lineTo(projectile.trail[i].x, projectile.trail[i].y);
      }
      ctx.stroke();
    }

    // Draw projectile
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(projectile.rotation);
    
    ctx.font = `${projectile.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(projectile.emoji, 0, 0);
    
    ctx.restore();

    // Debug info
    if (showDebugInfo) {
      ctx.fillStyle = '#fff';
      ctx.font = '8px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${Math.floor(projectile.damage)}dmg`, x + 20, y);
      ctx.fillText(`${projectile.bounces}/${projectile.maxBounces}`, x + 20, y + 10);
    }
  };

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
          border: '2px solid #333'
        }}
      />
      
      {/* Combat controls overlay */}
      <div className="combat-controls">
        <button onClick={centerOnAction} className="control-btn">
          Center Camera
        </button>
        <button onClick={() => useCombatStore.getState().toggleDebugInfo()} className="control-btn">
          Debug Info
        </button>
        {phase === 'active' && (
          <button onClick={() => useCombatStore.getState().pauseCombat()} className="control-btn">
            Pause
          </button>
        )}
      </div>
    </div>
  );
};