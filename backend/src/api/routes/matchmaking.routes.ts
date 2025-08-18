import { Router } from 'express';
import { asyncHandler, successResponse } from '@api/middleware/errorHandling';
import { validate } from '@api/middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/matchmaking/queue:
 *   post:
 *     summary: Join matchmaking queue
 *     tags: [Matchmaking]
 */
router.post('/queue', validate.joinQueue, asyncHandler(async (req, res) => {
  const { deckId, matchType = 'casual', preferredRegion = 'auto' } = req.body;
  const userId = 'temp-user-id';

  // TODO: Add user to matchmaking queue
  const queueEntry = {
    id: 'queue-001',
    userId,
    deckId,
    matchType,
    preferredRegion,
    queuedAt: new Date().toISOString(),
    estimatedWaitTime: '2-3 minutes',
  };

  successResponse(res, queueEntry, 'Joined matchmaking queue successfully');
}));

/**
 * @swagger
 * /api/matchmaking/queue:
 *   delete:
 *     summary: Leave matchmaking queue
 *     tags: [Matchmaking]
 */
router.delete('/queue', asyncHandler(async (req, res) => {
  const userId = 'temp-user-id';

  // TODO: Remove user from matchmaking queue
  successResponse(res, null, 'Left matchmaking queue successfully');
}));

/**
 * @swagger
 * /api/matchmaking/status:
 *   get:
 *     summary: Get matchmaking status
 *     tags: [Matchmaking]
 */
router.get('/status', asyncHandler(async (req, res) => {
  const userId = 'temp-user-id';

  // TODO: Get user's current matchmaking status
  const status = {
    inQueue: false,
    queuedAt: null,
    estimatedWaitTime: null,
    activeQueues: {
      casual: 45,
      ranked: 23,
    },
  };

  successResponse(res, status, 'Matchmaking status retrieved successfully');
}));

export default router;
