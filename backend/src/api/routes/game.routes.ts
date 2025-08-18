import { Router, Request, Response } from 'express';
import { asyncHandler, successResponse } from '@api/middleware/errorHandling';
import { validate } from '@api/middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/game/match/create:
 *   post:
 *     summary: Create a new match
 *     tags: [Game]
 */
router.post('/match/create', validate.createMatch, asyncHandler(async (req: Request, res: Response) => {
  const { deckId, matchType = 'casual', opponentId } = req.body;
  const userId = 'temp-user-id';

  // TODO: Implement match creation logic
  const match = {
    id: 'match-001',
    players: [
      { id: userId, deckId, ready: true },
      { id: opponentId || 'bot-001', deckId: 'bot-deck', ready: true },
    ],
    status: 'active',
    type: matchType,
    createdAt: new Date().toISOString(),
  };

  successResponse(res, match, 'Match created successfully', 201);
}));

/**
 * @swagger
 * /api/game/match/{matchId}:
 *   get:
 *     summary: Get match details
 *     tags: [Game]
 */
router.get('/match/:matchId', validate.getMatchById, asyncHandler(async (req: Request, res: Response) => {
  const { matchId } = req.params;

  // TODO: Fetch match from database
  const match = {
    id: matchId,
    players: [
      { id: 'user-1', username: 'Player1', hp: 100 },
      { id: 'user-2', username: 'Player2', hp: 85 },
    ],
    status: 'active',
    currentTurn: 'user-1',
    turn: 3,
  };

  successResponse(res, match, 'Match retrieved successfully');
}));

export default router;
