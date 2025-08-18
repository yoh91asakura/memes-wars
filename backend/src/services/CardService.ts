import { prisma } from '@database/connection';
import { CardRarity, Card, CardType } from '@prisma/client';
import { logger } from '@/utils/logger';
import { NotFoundError, ValidationError } from '@api/middleware/errorHandling';

export interface CardFilters {
  rarity?: CardRarity;
  type?: CardType;
  search?: string;
  tags?: string[];
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface CardRollResult {
  cards: Card[];
  packType: string;
  totalValue: number;
  bonusMultiplier?: number;
}

// Probabilités de rareté pour le roll (en pourcentage)
const RARITY_WEIGHTS = {
  [CardRarity.COMMON]: 50,      // 50%
  [CardRarity.UNCOMMON]: 30,    // 30%
  [CardRarity.RARE]: 15,        // 15%
  [CardRarity.EPIC]: 4,         // 4%
  [CardRarity.LEGENDARY]: 0.9,  // 0.9%
  [CardRarity.MYTHIC]: 0.1,     // 0.1%
  [CardRarity.COSMIC]: 0,       // 0% (pas disponible au roll normal)
};

// Valeurs des cartes en fonction de la rareté
const RARITY_VALUES = {
  [CardRarity.COMMON]: 10,
  [CardRarity.UNCOMMON]: 25,
  [CardRarity.RARE]: 50,
  [CardRarity.EPIC]: 100,
  [CardRarity.LEGENDARY]: 250,
  [CardRarity.MYTHIC]: 500,
  [CardRarity.COSMIC]: 1000,
};

class CardService {
  /**
   * Récupère toutes les cartes avec filtres et pagination
   */
  async getCards(filters: CardFilters = {}, pagination: PaginationOptions = { page: 1, limit: 20 }) {
    const { rarity, type, search, tags } = filters;
    const { page, limit } = pagination;
    
    const skip = (page - 1) * limit;
    
    // Construction des conditions de filtrage
    const where: any = {
      isActive: true,
    };

    if (rarity) {
      where.rarity = rarity;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { flavor: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { rarity: 'asc' },
          { cost: 'asc' },
          { name: 'asc' },
        ],
      }),
      prisma.card.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    
    logger.info(`Retrieved ${cards.length} cards (page ${page}/${totalPages})`);

    return {
      cards,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Récupère une carte par son ID
   */
  async getCardById(cardId: string): Promise<Card> {
    const card = await prisma.card.findUnique({
      where: { 
        id: cardId,
        isActive: true,
      },
    });

    if (!card) {
      throw new NotFoundError('Card not found');
    }

    return card;
  }

  /**
   * Récupère les cartes par rareté
   */
  async getCardsByRarity(rarity: CardRarity): Promise<Card[]> {
    return prisma.card.findMany({
      where: {
        rarity,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Sélectionne une rareté aléatoire basée sur les poids
   */
  private selectRandomRarity(): CardRarity {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
      cumulative += weight;
      if (random <= cumulative) {
        return rarity as CardRarity;
      }
    }

    // Fallback vers Common si quelque chose se passe mal
    return CardRarity.COMMON;
  }

  /**
   * Sélectionne une carte aléatoire d'une rareté donnée
   */
  private async selectRandomCardFromRarity(rarity: CardRarity): Promise<Card | null> {
    const cards = await this.getCardsByRarity(rarity);
    
    if (cards.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * cards.length);
    return cards[randomIndex];
  }

  /**
   * Système de roll de cartes avec différents types de packs
   */
  async rollCards(
    packType: string = 'basic', 
    count: number = 1, 
    userId?: string
  ): Promise<CardRollResult> {
    if (count < 1 || count > 10) {
      throw new ValidationError('Card count must be between 1 and 10');
    }

    const rolledCards: Card[] = [];
    let totalValue = 0;
    let bonusMultiplier = 1;

    // Différents types de packs avec des bonus
    const packBonuses: Record<string, { multiplier: number; guaranteedRarity?: CardRarity }> = {
      basic: { multiplier: 1 },
      premium: { multiplier: 1.5 },
      legendary: { multiplier: 2, guaranteedRarity: CardRarity.RARE },
      cosmic: { multiplier: 3, guaranteedRarity: CardRarity.EPIC },
    };

    const packBonus = packBonuses[packType] || packBonuses.basic;
    bonusMultiplier = packBonus.multiplier;

    logger.info(`Rolling ${count} cards from ${packType} pack`, { userId, packType, count });

    for (let i = 0; i < count; i++) {
      let selectedRarity: CardRarity;

      // Si c'est le dernier roll d'un pack premium et qu'on a une rareté garantie
      if (i === count - 1 && packBonus.guaranteedRarity) {
        // 50% de chance d'avoir la rareté garantie ou mieux
        if (Math.random() < 0.5) {
          const rarities = Object.keys(CardRarity) as CardRarity[];
          const guaranteedIndex = rarities.indexOf(packBonus.guaranteedRarity);
          const possibleRarities = rarities.slice(guaranteedIndex);
          selectedRarity = possibleRarities[Math.floor(Math.random() * possibleRarities.length)];
        } else {
          selectedRarity = this.selectRandomRarity();
        }
      } else {
        selectedRarity = this.selectRandomRarity();
      }

      const card = await this.selectRandomCardFromRarity(selectedRarity);
      
      if (card) {
        rolledCards.push(card);
        totalValue += RARITY_VALUES[selectedRarity] * bonusMultiplier;
        logger.info(`Rolled ${selectedRarity} card: ${card.name}`, { cardId: card.id });
      } else {
        // Fallback vers une carte commune si aucune carte de cette rareté n'existe
        const fallbackCard = await this.selectRandomCardFromRarity(CardRarity.COMMON);
        if (fallbackCard) {
          rolledCards.push(fallbackCard);
          totalValue += RARITY_VALUES[CardRarity.COMMON] * bonusMultiplier;
          logger.warn(`No cards of rarity ${selectedRarity}, fell back to common card`);
        }
      }
    }

    logger.info(`Roll completed`, { 
      userId, 
      packType, 
      cardsRolled: rolledCards.length,
      totalValue,
      bonusMultiplier 
    });

    return {
      cards: rolledCards,
      packType,
      totalValue: Math.round(totalValue),
      bonusMultiplier,
    };
  }

  /**
   * Recherche de cartes par texte
   */
  async searchCards(query: string, limit: number = 20): Promise<Card[]> {
    if (!query.trim()) {
      throw new ValidationError('Search query cannot be empty');
    }

    const cards = await prisma.card.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { flavor: { contains: query, mode: 'insensitive' } },
              { tags: { hasSome: [query.toLowerCase()] } },
            ],
          },
        ],
      },
      take: limit,
      orderBy: [
        { rarity: 'desc' }, // Les raretés les plus élevées en premier
        { name: 'asc' },
      ],
    });

    logger.info(`Search for "${query}" returned ${cards.length} results`);
    return cards;
  }

  /**
   * Statistiques des cartes
   */
  async getCardStats() {
    const [total, byRarity, byType] = await Promise.all([
      prisma.card.count({ where: { isActive: true } }),
      
      prisma.card.groupBy({
        by: ['rarity'],
        where: { isActive: true },
        _count: true,
      }),

      prisma.card.groupBy({
        by: ['type'],
        where: { isActive: true },
        _count: true,
      }),
    ]);

    const rarityStats = byRarity.reduce((acc, item) => {
      acc[item.rarity] = item._count;
      return acc;
    }, {} as Record<CardRarity, number>);

    const typeStats = byType.reduce((acc, item) => {
      acc[item.type] = item._count;
      return acc;
    }, {} as Record<CardType, number>);

    return {
      total,
      byRarity: rarityStats,
      byType: typeStats,
    };
  }

  /**
   * Obtient les tags les plus populaires
   */
  async getPopularTags(limit: number = 20): Promise<Array<{ tag: string; count: number }>> {
    const cards = await prisma.card.findMany({
      where: { isActive: true },
      select: { tags: true },
    });

    const tagCounts: Record<string, number> = {};
    
    cards.forEach(card => {
      card.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

export const cardService = new CardService();
export default cardService;
