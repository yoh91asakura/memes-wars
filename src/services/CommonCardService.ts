import { CommonCardData } from '../types/cards/common/common-cards.types';
import commonCardsJson from '../data/cards/common/common-cards-full.json';

const commonCardsData: CommonCardData[] = commonCardsJson as CommonCardData[];

export class CommonCardService {
  private static instance: CommonCardService;
  private cards: Map<string, CommonCardData> = new Map();

  private constructor() {
    this.initializeCards();
  }

  public static getInstance(): CommonCardService {
    if (!CommonCardService.instance) {
      CommonCardService.instance = new CommonCardService();
    }
    return CommonCardService.instance;
  }

  private initializeCards(): void {
    commonCardsData.forEach(card => {
      this.cards.set(card.id, card);
    });
  }

  public getAllCommonCards(): CommonCardData[] {
    return Array.from(this.cards.values());
  }

  public getCardById(id: string): CommonCardData | undefined {
    return this.cards.get(id);
  }

  public getCardsByTag(tag: string): CommonCardData[] {
    return this.getAllCommonCards().filter(card => 
      card.tags.includes(tag)
    );
  }

  public getCardsByType(type: 'creature' | 'spell'): CommonCardData[] {
    return this.getAllCommonCards().filter(card => 
      card.type === type
    );
  }

  public getCardsByCost(cost: number): CommonCardData[] {
    return this.getAllCommonCards().filter(card => 
      card.cost === cost
    );
  }

  public getRandomCommonCard(): CommonCardData {
    const cards = this.getAllCommonCards();
    const randomIndex = Math.floor(Math.random() * cards.length);
    return cards[randomIndex];
  }

  public getRandomCommonCards(count: number): CommonCardData[] {
    const cards = this.getAllCommonCards();
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, cards.length));
  }

  public validateCard(card: any): card is CommonCardData {
    return (
      typeof card.id === 'string' &&
      card.id.startsWith('COMMON_') &&
      typeof card.name === 'string' &&
      typeof card.emoji === 'string' &&
      card.rarity === 'common' &&
      (card.type === 'creature' || card.type === 'spell') &&
      typeof card.cost === 'number' &&
      card.cost >= 1 && card.cost <= 2 &&
      typeof card.description === 'string' &&
      typeof card.flavorText === 'string' &&
      Array.isArray(card.tags) &&
      typeof card.ability === 'object'
    );
  }

  public getCardStats(): {
    total: number;
    creatures: number;
    spells: number;
    averageCost: number;
    averageAttack: number;
    averageDefense: number;
    averageHealth: number;
  } {
    const cards = this.getAllCommonCards();
    const creatures = cards.filter(c => c.type === 'creature');
    const spells = cards.filter(c => c.type === 'spell');

    return {
      total: cards.length,
      creatures: creatures.length,
      spells: spells.length,
      averageCost: cards.reduce((sum, card) => sum + card.cost, 0) / cards.length,
      averageAttack: creatures.reduce((sum, card) => sum + card.attack, 0) / creatures.length || 0,
      averageDefense: creatures.reduce((sum, card) => sum + card.defense, 0) / creatures.length || 0,
      averageHealth: creatures.reduce((sum, card) => sum + card.health, 0) / creatures.length || 0,
    };
  }
}