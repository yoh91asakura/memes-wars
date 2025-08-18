import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@/utils/logger';

export const setupGameSocket = (io: SocketIOServer) => {
  const gameNamespace = io.of('/game');

  gameNamespace.on('connection', (socket: Socket) => {
    logger.info(`Game socket connected: ${socket.id}`);

    // Join game room
    socket.on('join-match', async (data: { matchId: string; userId: string }) => {
      try {
        const { matchId, userId } = data;
        
        // TODO: Validate user can join this match
        await socket.join(`match:${matchId}`);
        
        logger.info(`User ${userId} joined match ${matchId}`);
        
        // Notify other players in the match
        socket.to(`match:${matchId}`).emit('player-joined', {
          userId,
          timestamp: new Date().toISOString(),
        });

        // Send match state to the new player
        socket.emit('match-state', {
          // TODO: Get current match state from database
          matchId,
          players: [],
          currentTurn: null,
          board: [],
        });
      } catch (error) {
        logger.error('Error joining match:', error);
        socket.emit('error', { message: 'Failed to join match' });
      }
    });

    // Leave game room
    socket.on('leave-match', async (data: { matchId: string; userId: string }) => {
      try {
        const { matchId, userId } = data;
        
        await socket.leave(`match:${matchId}`);
        
        logger.info(`User ${userId} left match ${matchId}`);
        
        // Notify other players
        socket.to(`match:${matchId}`).emit('player-left', {
          userId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Error leaving match:', error);
      }
    });

    // Play card action
    socket.on('play-card', async (data: { 
      matchId: string; 
      userId: string; 
      cardId: string; 
      position: { x: number; y: number }; 
    }) => {
      try {
        const { matchId, userId, cardId, position } = data;
        
        // TODO: Validate move
        // TODO: Update game state
        // TODO: Calculate battle results
        
        logger.info(`User ${userId} played card ${cardId} in match ${matchId}`);
        
        // Broadcast to all players in the match
        gameNamespace.to(`match:${matchId}`).emit('card-played', {
          userId,
          cardId,
          position,
          timestamp: new Date().toISOString(),
        });

        // TODO: If battle occurs, emit battle results
        // gameNamespace.to(`match:${matchId}`).emit('battle-result', battleResult);
        
      } catch (error) {
        logger.error('Error playing card:', error);
        socket.emit('error', { message: 'Failed to play card' });
      }
    });

    // End turn action
    socket.on('end-turn', async (data: { matchId: string; userId: string }) => {
      try {
        const { matchId, userId } = data;
        
        // TODO: Validate it's user's turn
        // TODO: Update turn state
        
        logger.info(`User ${userId} ended turn in match ${matchId}`);
        
        // Broadcast turn change
        gameNamespace.to(`match:${matchId}`).emit('turn-ended', {
          userId,
          nextPlayer: 'next-player-id', // TODO: Get next player
          turnNumber: 1, // TODO: Increment turn
          timestamp: new Date().toISOString(),
        });
        
      } catch (error) {
        logger.error('Error ending turn:', error);
        socket.emit('error', { message: 'Failed to end turn' });
      }
    });

    // Chat message
    socket.on('chat-message', async (data: {
      matchId: string;
      userId: string;
      message: string;
    }) => {
      try {
        const { matchId, userId, message } = data;
        
        // TODO: Validate message (sanitize, length check)
        // TODO: Store chat history
        
        logger.debug(`Chat message in match ${matchId} from ${userId}`);
        
        // Broadcast to match participants
        gameNamespace.to(`match:${matchId}`).emit('chat-message', {
          userId,
          message,
          timestamp: new Date().toISOString(),
        });
        
      } catch (error) {
        logger.error('Error sending chat message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`Game socket disconnected: ${socket.id} - ${reason}`);
      
      // TODO: Handle player disconnect
      // - Mark player as inactive in ongoing matches
      // - Set disconnect timer
      // - Pause match or forfeit after timeout
    });

    // Handle reconnection
    socket.on('reconnect', async (data: { userId: string; matchId?: string }) => {
      try {
        const { userId, matchId } = data;
        
        logger.info(`User ${userId} reconnected to game socket`);
        
        if (matchId) {
          // Rejoin match room
          await socket.join(`match:${matchId}`);
          
          // Send current match state
          socket.emit('match-state', {
            // TODO: Get current match state
            matchId,
            reconnected: true,
          });
          
          // Notify other players
          socket.to(`match:${matchId}`).emit('player-reconnected', {
            userId,
            timestamp: new Date().toISOString(),
          });
        }
        
      } catch (error) {
        logger.error('Error handling reconnection:', error);
      }
    });
  });

  logger.info('Game WebSocket handlers initialized');
};
