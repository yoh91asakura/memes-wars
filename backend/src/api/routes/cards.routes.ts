import { Router, Request, Response } from 'express';
import { asyncHandler, successResponse } from '@api/middleware/errorHandling';
import { validate } from '@api/middleware/validation';
import { cardService } from '@services/CardService';
import { CardRarity, CardType } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /api/cards:
 *   get:
 *     summary: Get all cards with filtering and pagination
 *     tags: [Cards]
 */
router.get('/', validate.getCards, asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, rarity, type, search } = req.query as any;
  
  // Conversion des types pour les filtres
  const filters = {
    ...(rarity && { rarity: rarity as CardRarity }),
    ...(type && { type: type as CardType }),
    ...(search && { search: search as string }),
  };

  const result = await cardService.getCards(filters, {
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 20,
  });

  successResponse(res, {
    cards: result.cards,
    ...result.pagination,
  }, 'Cards retrieved successfully');
}));

/**
 * @swagger
 * /api/cards/{cardId}:
 *   get:
 *     summary: Get card by ID
 *     tags: [Cards]
 */
router.get('/:cardId', validate.getCardById, asyncHandler(async (req: Request, res: Response) => {
  const { cardId } = req.params;

  const card = await cardService.getCardById(cardId);

  successResponse(res, card, 'Card retrieved successfully');
}));

/**
 * @swagger
 * /api/cards/roll:
 *   post:
 *     summary: Roll card packs
 *     tags: [Cards]
 */
router.post('/roll', validate.rollCards, asyncHandler(async (req: Request, res: Response) => {
  const { packType = 'basic', count = 1 } = req.body;
  const userId = 'temp-user-id'; // TODO: Récupérer depuis l'auth plus tard
  
  const rollResult = await cardService.rollCards(packType, count, userId);

  successResponse(res, rollResult, 'Cards rolled successfully');
}));

/**
 * @swagger
 * /api/cards/search:
 *   get:
 *     summary: Search cards by text
 *     tags: [Cards]
 */
router.get('/search/:query', asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.params;
  const { limit = 20 } = req.query as any;

  const cards = await cardService.searchCards(query, parseInt(limit as string) || 20);

  successResponse(res, { cards, query, count: cards.length }, 'Search completed');
}));

/**
 * @swagger
 * /api/cards/stats:
 *   get:
 *     summary: Get card statistics
 *     tags: [Cards]
 */
router.get('/stats', asyncHandler(async (_req: Request, res: Response) => {
  const stats = await cardService.getCardStats();

  successResponse(res, stats, 'Card statistics retrieved');
}));

/**
 * @swagger
 * /api/cards/tags/popular:
 *   get:
 *     summary: Get popular tags
 *     tags: [Cards]
 */
router.get('/tags/popular', asyncHandler(async (req: Request, res: Response) => {
  const { limit = 20 } = req.query as any;
  
  const tags = await cardService.getPopularTags(parseInt(limit as string) || 20);

  successResponse(res, { tags, count: tags.length }, 'Popular tags retrieved');
}));

export default router;
