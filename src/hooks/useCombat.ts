// Combat Hooks - Custom React hooks for combat mechanics

import { useEffect, useCallback, useRef, useState } from 'react';
import { useCombatStore, useCombatActions, useCombatPlayers, useCombatProjectiles } from '../stores/combatStore';
import { CombatArena, CombatPlayer, Position } from '../models/Combat';
import { Deck } from '../models/Deck';

// Main combat hook
export function useCombat() {
  const combatState = useCombatStore();
  const combatActions = useCombatActions();
  
  // Combat arena management
  const initializeCombat = useCallback((arena: CombatArena, playerDeck: Deck, opponentDeck: Deck) => {
    combatActions.initializeCombat(arena, playerDeck, opponentDeck);
  }, [combatActions]);

  const startCombat = useCallback(() => {
    combatActions.startCombat();
  }, [combatActions]);

  const pauseCombat = useCallback(() => {
    combatActions.pauseCombat();
  }, [combatActions]);

  const resumeCombat = useCallback(() => {
    combatActions.resumeCombat();
  }, [combatActions]);

  const endCombat = useCallback((winner?: CombatPlayer) => {
    combatActions.endCombat(winner);
  }, [combatActions]);

  const resetCombat = useCallback(() => {
    combatActions.resetCombat();
  }, [combatActions]);

  return {
    // State
    ...combatState,
    
    // Actions
    initializeCombat,
    startCombat,
    pauseCombat,
    resumeCombat,
    endCombat,
    resetCombat
  };
}

// Hook for combat engine integration
export function useCombatEngine() {
  const { combatEngine, updateFromEngine } = useCombatStore();
  const gameLoopRef = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);

  const startGameLoop = useCallback(() => {
    if (!combatEngine) return;

    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastFrameTime.current) / 1000;
      lastFrameTime.current = currentTime;

      // Update combat engine
      combatEngine.processFrame(deltaTime);
      
      // Sync state with store
      updateFromEngine(combatEngine.getState());

      // Continue loop if combat is active
      if (useCombatStore.getState().isActive && !useCombatStore.getState().isPaused) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    };

    lastFrameTime.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [combatEngine, updateFromEngine]);

  const stopGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  // Auto-start/stop game loop based on combat state
  useEffect(() => {
    const { isActive, isPaused } = useCombatStore.getState();
    
    if (isActive && !isPaused && combatEngine) {
      startGameLoop();
    } else {
      stopGameLoop();
    }

    return stopGameLoop;
  }, [combatEngine, startGameLoop, stopGameLoop]);

  return {
    startGameLoop,
    stopGameLoop,
    isRunning: gameLoopRef.current !== null
  };
}

// Hook for player-specific combat actions
export function usePlayerCombat(playerId: string) {
  const player = useCombatStore(state => state.getPlayer(playerId));
  const { fireProjectile, updatePlayerPosition, applyDamage } = useCombatStore();

  const fireAtTarget = useCallback((target: Position) => {
    if (!player || !player.isAlive) return;
    
    fireProjectile(playerId, target);
  }, [player, playerId, fireProjectile]);

  const movePlayer = useCallback((position: Position) => {
    if (!player || !player.isAlive) return;
    
    updatePlayerPosition(playerId, position);
  }, [player, playerId, updatePlayerPosition]);

  const takeDamage = useCallback((damage: number) => {
    if (!player || !player.isAlive) return;
    
    applyDamage(playerId, damage);
  }, [player, playerId, applyDamage]);

  const getPlayerStats = useCallback(() => {
    if (!player) return null;
    
    return {
      health: player.health,
      maxHealth: player.maxHealth,
      healthPercent: (player.health / player.maxHealth) * 100,
      isAlive: player.isAlive,
      kills: player.kills,
      damage: player.damage,
      accuracy: player.accuracy,
      position: player.position
    };
  }, [player]);

  return {
    player,
    fireAtTarget,
    movePlayer,
    takeDamage,
    getPlayerStats
  };
}

// Hook for projectile management
export function useProjectiles() {
  const projectiles = useCombatProjectiles();
  const { selectedProjectile, setSelectedProjectile } = useCombatStore();

  const getActiveProjectiles = useCallback(() => {
    return projectiles.filter(p => p.isActive);
  }, [projectiles]);

  const getProjectilesByOwner = useCallback((ownerId: string) => {
    return projectiles.filter(p => p.ownerId === ownerId && p.isActive);
  }, [projectiles]);

  const selectProjectile = useCallback((projectileId: string | null) => {
    setSelectedProjectile(projectileId);
  }, [setSelectedProjectile]);

  const getSelectedProjectile = useCallback(() => {
    if (!selectedProjectile) return null;
    return projectiles.find(p => p.id === selectedProjectile) || null;
  }, [projectiles, selectedProjectile]);

  const getProjectileStats = useCallback(() => {
    const active = getActiveProjectiles();
    return {
      total: projectiles.length,
      active: active.length,
      byOwner: active.reduce((acc, p) => {
        acc[p.ownerId] = (acc[p.ownerId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [projectiles, getActiveProjectiles]);

  return {
    projectiles,
    getActiveProjectiles,
    getProjectilesByOwner,
    selectProjectile,
    getSelectedProjectile,
    getProjectileStats,
    selectedProjectile
  };
}

// Hook for combat effects and animations
export function useCombatEffects() {
  const { activeEffects, addEffect, removeEffect } = useCombatStore();
  const [screenShake, setScreenShake] = useState({ intensity: 0, duration: 0 });
  const [flashEffect, setFlashEffect] = useState({ color: '', intensity: 0, duration: 0 });

  const triggerScreenShake = useCallback((intensity: number, duration: number) => {
    setScreenShake({ intensity, duration });
    setTimeout(() => setScreenShake({ intensity: 0, duration: 0 }), duration);
  }, []);

  const triggerFlashEffect = useCallback((color: string, intensity: number, duration: number) => {
    setFlashEffect({ color, intensity, duration });
    setTimeout(() => setFlashEffect({ color: '', intensity: 0, duration: 0 }), duration);
  }, []);

  const getEffectsByPlayer = useCallback((playerId: string) => {
    return activeEffects.filter(e => e.targetId === playerId);
  }, [activeEffects]);

  const hasEffect = useCallback((playerId: string, effectType: string) => {
    return activeEffects.some(e => e.targetId === playerId && e.type === effectType);
  }, [activeEffects]);

  return {
    activeEffects,
    addEffect,
    removeEffect,
    getEffectsByPlayer,
    hasEffect,
    screenShake,
    flashEffect,
    triggerScreenShake,
    triggerFlashEffect
  };
}

// Hook for combat camera controls
export function useCombatCamera() {
  const { cameraPosition, updateCamera } = useCombatStore();
  const players = useCombatPlayers();

  const panCamera = useCallback((deltaX: number, deltaY: number) => {
    updateCamera({
      x: cameraPosition.x + deltaX,
      y: cameraPosition.y + deltaY,
      zoom: cameraPosition.zoom
    });
  }, [cameraPosition, updateCamera]);

  const zoomCamera = useCallback((zoomDelta: number) => {
    const newZoom = Math.max(0.5, Math.min(3, cameraPosition.zoom + zoomDelta));
    updateCamera({
      x: cameraPosition.x,
      y: cameraPosition.y,
      zoom: newZoom
    });
  }, [cameraPosition, updateCamera]);

  const centerOnPlayer = useCallback((playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      updateCamera({
        x: player.position.x,
        y: player.position.y,
        zoom: cameraPosition.zoom
      });
    }
  }, [players, cameraPosition.zoom, updateCamera]);

  const centerOnAction = useCallback(() => {
    if (players.length === 0) return;

    // Calculate center point between all alive players
    const alivePlayers = players.filter(p => p.isAlive);
    if (alivePlayers.length === 0) return;

    const centerX = alivePlayers.reduce((sum, p) => sum + p.position.x, 0) / alivePlayers.length;
    const centerY = alivePlayers.reduce((sum, p) => sum + p.position.y, 0) / alivePlayers.length;

    updateCamera({
      x: centerX,
      y: centerY,
      zoom: cameraPosition.zoom
    });
  }, [players, cameraPosition.zoom, updateCamera]);

  const resetCamera = useCallback(() => {
    updateCamera({
      x: 600, // Arena center
      y: 400,
      zoom: 1.0
    });
  }, [updateCamera]);

  return {
    cameraPosition,
    panCamera,
    zoomCamera,
    centerOnPlayer,
    centerOnAction,
    resetCamera
  };
}

// Hook for combat AI behavior
export function useCombatAI(playerId: string) {
  const { getPlayer, fireProjectile } = useCombatStore();
  const players = useCombatPlayers();
  
  const aiState = useRef({
    lastAction: 0,
    target: null as string | null,
    behavior: 'aggressive' as 'aggressive' | 'defensive' | 'balanced'
  });

  const findBestTarget = useCallback(() => {
    const player = getPlayer(playerId);
    if (!player) return null;

    const enemies = players.filter(p => p.id !== playerId && p.isAlive);
    if (enemies.length === 0) return null;

    // Find closest enemy
    const distances = enemies.map(enemy => ({
      player: enemy,
      distance: Math.sqrt(
        Math.pow(enemy.position.x - player.position.x, 2) +
        Math.pow(enemy.position.y - player.position.y, 2)
      )
    }));

    distances.sort((a, b) => a.distance - b.distance);
    return distances[0].player.id;
  }, [playerId, players, getPlayer]);

  const executeAI = useCallback(() => {
    const player = getPlayer(playerId);
    if (!player || !player.isAlive) return;

    const now = Date.now();
    const timeSinceLastAction = now - aiState.current.lastAction;

    // AI decision making based on behavior
    switch (aiState.current.behavior) {
      case 'aggressive':
        if (timeSinceLastAction > 500) { // Fire every 500ms
          const targetId = findBestTarget();
          if (targetId) {
            const target = getPlayer(targetId);
            if (target) {
              // Add some randomness to targeting
              const targetPos = {
                x: target.position.x + (Math.random() * 40 - 20),
                y: target.position.y + (Math.random() * 40 - 20)
              };
              fireProjectile(playerId, targetPos);
              aiState.current.lastAction = now;
            }
          }
        }
        break;

      case 'defensive':
        // More careful, longer delays between shots
        if (timeSinceLastAction > 1000) {
          const targetId = findBestTarget();
          if (targetId) {
            const target = getPlayer(targetId);
            if (target && target.health < player.health) { // Only attack if target is weaker
              fireProjectile(playerId, target.position);
              aiState.current.lastAction = now;
            }
          }
        }
        break;

      case 'balanced':
      default:
        if (timeSinceLastAction > 750) {
          const targetId = findBestTarget();
          if (targetId) {
            const target = getPlayer(targetId);
            if (target) {
              fireProjectile(playerId, target.position);
              aiState.current.lastAction = now;
            }
          }
        }
        break;
    }
  }, [playerId, getPlayer, findBestTarget, fireProjectile]);

  const setBehavior = useCallback((behavior: typeof aiState.current.behavior) => {
    aiState.current.behavior = behavior;
  }, []);

  // Run AI logic periodically
  useEffect(() => {
    const interval = setInterval(executeAI, 100); // 10 FPS AI updates
    return () => clearInterval(interval);
  }, [executeAI]);

  return {
    setBehavior,
    executeAI,
    currentBehavior: aiState.current.behavior
  };
}

// Hook for combat statistics and metrics
export function useCombatStats() {
  const { statistics, events } = useCombatStore();
  const players = useCombatPlayers();

  const getPlayerStats = useCallback((playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return null;

    const playerEvents = events.filter(e => e.playerId === playerId);
    const damageDealt = playerEvents
      .filter(e => e.type === 'player_damaged')
      .reduce((sum, e) => sum + ((e.data.damage as number) || 0), 0);

    return {
      kills: player.kills,
      damage: damageDealt,
      accuracy: player.accuracy,
      shotsFired: player.shotsFired,
      shotsHit: player.shotsHit,
      healthPercent: (player.health / player.maxHealth) * 100,
      isAlive: player.isAlive
    };
  }, [players, events]);

  const getOverallStats = useCallback(() => {
    return {
      ...statistics,
      playersAlive: players.filter(p => p.isAlive).length,
      totalPlayers: players.length,
      combatDuration: Date.now() - (useCombatStore.getState().startTime || Date.now())
    };
  }, [statistics, players]);

  const getLeaderboard = useCallback(() => {
    return players
      .map(player => ({
        id: player.id,
        username: player.username,
        kills: player.kills,
        damage: player.damage,
        accuracy: player.accuracy,
        isAlive: player.isAlive,
        score: player.kills * 100 + player.damage
      }))
      .sort((a, b) => {
        if (a.isAlive && !b.isAlive) return -1;
        if (!a.isAlive && b.isAlive) return 1;
        return b.score - a.score;
      });
  }, [players]);

  return {
    statistics,
    getPlayerStats,
    getOverallStats,
    getLeaderboard
  };
}