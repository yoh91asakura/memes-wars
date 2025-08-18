import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@/utils/logger';

export const setupMatchmakingSocket = (io: SocketIOServer) => {
  const matchmakingNamespace = io.of('/matchmaking');

  matchmakingNamespace.on('connection', (socket: Socket) => {
    logger.info(`Matchmaking socket connected: ${socket.id}`);

    // Join matchmaking queue
    socket.on('join-queue', async (data: {
      userId: string;
      deckId: string;
      matchType: 'casual' | 'ranked';
      preferredRegion: string;
    }) => {
      try {
        const { userId, deckId, matchType, preferredRegion } = data;
        
        // Join queue room based on match type and region
        const queueRoom = `queue:${matchType}:${preferredRegion}`;
        await socket.join(queueRoom);
        await socket.join(`user:${userId}`);
        
        logger.info(`User ${userId} joined ${matchType} queue in region ${preferredRegion}`);
        
        // TODO: Add to matchmaking queue in database
        // TODO: Start matchmaking process
        
        // Send queue status
        socket.emit('queue-joined', {
          queueId: `queue_${Date.now()}`,
          matchType,
          preferredRegion,
          estimatedWaitTime: '2-3 minutes',
          timestamp: new Date().toISOString(),
        });

        // TODO: Check for immediate matches
        // checkForMatches(matchType, preferredRegion);
        
      } catch (error) {
        logger.error('Error joining queue:', error);
        socket.emit('error', { message: 'Failed to join matchmaking queue' });
      }
    });

    // Leave matchmaking queue
    socket.on('leave-queue', async (data: { userId: string; queueId?: string }) => {
      try {
        const { userId, queueId } = data;
        
        // Leave all queue rooms
        const rooms = Array.from(socket.rooms);
        for (const room of rooms) {
          if (room.startsWith('queue:')) {
            await socket.leave(room);
          }
        }
        
        logger.info(`User ${userId} left matchmaking queue`);
        
        // TODO: Remove from matchmaking queue in database
        
        socket.emit('queue-left', {
          timestamp: new Date().toISOString(),
        });
        
      } catch (error) {
        logger.error('Error leaving queue:', error);
        socket.emit('error', { message: 'Failed to leave queue' });
      }
    });

    // Get queue status
    socket.on('queue-status', async (data: { userId: string }) => {
      try {
        const { userId } = data;
        
        // TODO: Get queue status from database
        const queueStatus = {
          inQueue: false,
          queuedAt: null,
          estimatedWaitTime: null,
          position: null,
          activeQueues: {
            casual: 45,
            ranked: 23,
          },
        };
        
        socket.emit('queue-status', queueStatus);
        
      } catch (error) {
        logger.error('Error getting queue status:', error);
        socket.emit('error', { message: 'Failed to get queue status' });
      }
    });

    // Handle match found
    socket.on('match-accept', async (data: { 
      userId: string; 
      matchId: string; 
      accepted: boolean; 
    }) => {
      try {
        const { userId, matchId, accepted } = data;
        
        logger.info(`User ${userId} ${accepted ? 'accepted' : 'declined'} match ${matchId}`);
        
        if (accepted) {
          // TODO: Mark user as accepted in match
          // TODO: Check if all players accepted
          
          socket.emit('match-accepted', {
            matchId,
            timestamp: new Date().toISOString(),
          });
          
          // If all players accepted, start the match
          // TODO: Check all acceptances and start match
          // startMatch(matchId);
          
        } else {
          // TODO: Cancel match and return players to queue
          socket.emit('match-cancelled', {
            reason: 'Player declined',
            timestamp: new Date().toISOString(),
          });
          
          // Return to queue automatically
          socket.emit('returned-to-queue', {
            timestamp: new Date().toISOString(),
          });
        }
        
      } catch (error) {
        logger.error('Error handling match acceptance:', error);
        socket.emit('error', { message: 'Failed to process match acceptance' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`Matchmaking socket disconnected: ${socket.id} - ${reason}`);
      
      // TODO: Remove user from all queues
      // TODO: Cancel any pending match acceptances
    });
  });

  // Utility function to notify users of match found (called from matchmaking service)
  const notifyMatchFound = (matchId: string, players: Array<{ userId: string; deckId: string }>) => {
    players.forEach(player => {
      matchmakingNamespace.to(`user:${player.userId}`).emit('match-found', {
        matchId,
        players: players.map(p => ({ userId: p.userId })),
        acceptanceDeadline: new Date(Date.now() + 30000).toISOString(), // 30 seconds
        timestamp: new Date().toISOString(),
      });
    });
  };

  // Utility function to start match (called when all players accept)
  const startMatch = (matchId: string, players: Array<{ userId: string }>) => {
    players.forEach(player => {
      matchmakingNamespace.to(`user:${player.userId}`).emit('match-starting', {
        matchId,
        gameServerUrl: '/game', // WebSocket namespace for game
        timestamp: new Date().toISOString(),
      });
    });
  };

  // Export utility functions for use by matchmaking service
  (matchmakingNamespace as any).notifyMatchFound = notifyMatchFound;
  (matchmakingNamespace as any).startMatch = startMatch;

  logger.info('Matchmaking WebSocket handlers initialized');
};
