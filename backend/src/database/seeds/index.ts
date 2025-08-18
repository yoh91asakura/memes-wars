import { PrismaClient, CardRarity, CardType } from '@prisma/client';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient();

// Sample card data based on the frontend cards
const initialCards = [
  // Common Cards
  {
    name: 'Fire Blast 🔥',
    description: 'A basic fire spell that deals moderate damage to a single target.',
    emoji: '🔥',
    rarity: CardRarity.COMMON,
    type: CardType.SPELL,
    cost: 2,
    attack: 3,
    defense: 0,
    health: 1,
    attackSpeed: 1.5,
    color: '#FF6B35',
    effects: ['burn', 'direct_damage'],
    tags: ['fire', 'spell', 'damage'],
    flavor: 'A simple but effective flame spell.',
    craftable: false,
  },
  {
    name: 'Lightning Bolt ⚡',
    description: 'Quick lightning strike with high speed but moderate damage.',
    emoji: '⚡',
    rarity: CardRarity.COMMON,
    type: CardType.SPELL,
    cost: 1,
    attack: 2,
    defense: 0,
    health: 1,
    attackSpeed: 2.0,
    color: '#FFD700',
    effects: ['shock', 'fast_attack'],
    tags: ['lightning', 'spell', 'fast'],
    flavor: 'Swift as lightning, strikes before enemies can react.',
    craftable: false,
  },
  {
    name: 'Earth Shield 🛡️',
    description: 'Defensive spell that creates a protective barrier.',
    emoji: '🛡️',
    rarity: CardRarity.COMMON,
    type: CardType.SPELL,
    cost: 2,
    attack: 0,
    defense: 5,
    health: 3,
    attackSpeed: 0.5,
    color: '#8B4513',
    effects: ['shield', 'defense_boost'],
    tags: ['earth', 'defensive', 'protection'],
    flavor: "Nature's own protection against hostile forces.",
    craftable: false,
  },

  // Uncommon Cards  
  {
    name: 'Ice Dragon 🐉❄️',
    description: 'A majestic ice dragon with freezing breath and solid defense.',
    emoji: '🐉❄️',
    rarity: CardRarity.UNCOMMON,
    type: CardType.CREATURE,
    cost: 4,
    attack: 5,
    defense: 4,
    health: 6,
    attackSpeed: 1.2,
    color: '#87CEEB',
    effects: ['freeze', 'flying', 'breath_weapon'],
    tags: ['dragon', 'ice', 'creature', 'flying'],
    flavor: 'From the frozen peaks comes a creature of ancient power.',
    craftable: true,
    craftCost: 100,
  },
  {
    name: 'Shadow Assassin 🗡️🌙',
    description: 'Stealthy creature that strikes from the shadows with deadly precision.',
    emoji: '🗡️🌙',
    rarity: CardRarity.UNCOMMON,
    type: CardType.CREATURE,
    cost: 3,
    attack: 6,
    defense: 2,
    health: 4,
    attackSpeed: 1.8,
    color: '#2F2F2F',
    effects: ['stealth', 'critical_strike', 'shadow_step'],
    tags: ['shadow', 'assassin', 'stealth', 'critical'],
    flavor: 'Silent death comes on moonless nights.',
    craftable: true,
    craftCost: 80,
  },

  // Rare Cards
  {
    name: 'Phoenix Rising 🔥🦅',
    description: 'Legendary bird that resurrects from ashes with enhanced power.',
    emoji: '🔥🦅',
    rarity: CardRarity.RARE,
    type: CardType.CREATURE,
    cost: 6,
    attack: 7,
    defense: 5,
    health: 8,
    attackSpeed: 1.4,
    color: '#FF4500',
    effects: ['resurrection', 'fire_aura', 'flying', 'rebirth'],
    tags: ['phoenix', 'fire', 'flying', 'resurrection'],
    flavor: 'Death is but a brief interruption for this eternal flame.',
    lore: 'The Phoenix has witnessed the rise and fall of civilizations, always returning stronger than before.',
    craftable: true,
    craftCost: 250,
  },
  {
    name: 'Storm Elemental ⛈️',
    description: 'Powerful elemental being that controls wind and lightning.',
    emoji: '⛈️',
    rarity: CardRarity.RARE,
    type: CardType.CREATURE,
    cost: 5,
    attack: 6,
    defense: 3,
    health: 7,
    attackSpeed: 1.6,
    color: '#4169E1',
    effects: ['chain_lightning', 'wind_fury', 'storm_call'],
    tags: ['elemental', 'storm', 'lightning', 'wind'],
    flavor: 'When the skies rage, this being dances in the tempest.',
    craftable: true,
    craftCost: 200,
  },

  // Epic Cards
  {
    name: 'Void Walker 🌌👤',
    description: 'Mysterious entity from the space between worlds with reality-bending powers.',
    emoji: '🌌👤',
    rarity: CardRarity.EPIC,
    type: CardType.CREATURE,
    cost: 8,
    attack: 9,
    defense: 6,
    health: 10,
    attackSpeed: 1.3,
    color: '#800080',
    effects: ['void_step', 'reality_rift', 'dimension_shift', 'cosmic_drain'],
    tags: ['void', 'cosmic', 'dimension', 'reality'],
    flavor: 'It walks between what is and what is not.',
    lore: 'From the spaces between reality comes a being that defies understanding.',
    craftable: true,
    craftCost: 500,
  },
  {
    name: 'Time Mage ⏰🧙‍♂️',
    description: 'Ancient wizard who manipulates the flow of time itself.',
    emoji: '⏰🧙‍♂️',
    rarity: CardRarity.EPIC,
    type: CardType.CREATURE,
    cost: 7,
    attack: 5,
    defense: 8,
    health: 9,
    attackSpeed: 1.0,
    color: '#FFD700',
    effects: ['time_stop', 'temporal_heal', 'future_sight', 'age_acceleration'],
    tags: ['time', 'magic', 'wizard', 'temporal'],
    flavor: 'Time bends to his will, past and future dance at his command.',
    lore: 'The last of the Chronarch order, keeper of temporal secrets.',
    craftable: true,
    craftCost: 400,
  },

  // Legendary Cards
  {
    name: 'Cosmic Dragon 🐲🌟',
    description: 'Ancient dragon born from stardust with the power to reshape reality.',
    emoji: '🐲🌟',
    rarity: CardRarity.LEGENDARY,
    type: CardType.CREATURE,
    cost: 10,
    attack: 12,
    defense: 10,
    health: 15,
    attackSpeed: 1.1,
    color: 'linear-gradient(45deg, #FF006E, #8338EC, #3A86FF)',
    effects: ['cosmic_breath', 'star_fury', 'reality_shaper', 'celestial_flight'],
    tags: ['dragon', 'cosmic', 'legendary', 'reality'],
    flavor: 'Born from the first stars, it carries the power of creation itself.',
    lore: 'When the universe was young, the first dragons were forged from stellar fire and cosmic dust. This is their greatest descendant.',
    craftable: true,
    craftCost: 1000,
  },

  // Mythic Cards
  {
    name: 'World Tree Guardian 🌳🌍',
    description: 'The eternal protector of the World Tree, source of all life and magic.',
    emoji: '🌳🌍',
    rarity: CardRarity.MYTHIC,
    type: CardType.CREATURE,
    cost: 12,
    attack: 15,
    defense: 12,
    health: 20,
    attackSpeed: 0.8,
    color: 'linear-gradient(45deg, #228B22, #32CD32, #00FF7F)',
    effects: ['world_heal', 'nature_wrath', 'life_force', 'root_network', 'gaia_shield'],
    tags: ['mythic', 'nature', 'guardian', 'world_tree', 'life'],
    flavor: 'As long as the World Tree stands, all life persists.',
    lore: 'At the center of all worlds grows the World Tree, and its guardian has watched over existence since the first seed sprouted in the cosmic soil.',
    craftable: false,
  },

  // Cosmic Cards
  {
    name: 'The Eternal Nexus 🌈∞🌟⚡🔮💫👁️🌌🎭🗝️',
    description: 'The convergence point of all realities, where infinite possibilities collapse into singular truth.',
    emoji: '🌈∞🌟⚡🔮💫👁️🌌🎭🗝️',
    rarity: CardRarity.COSMIC,
    type: CardType.ARTIFACT,
    cost: 20,
    attack: 25,
    defense: 25,
    health: 50,
    attackSpeed: 1.0,
    color: 'linear-gradient(45deg, #ff006e, #8338ec, #3a86ff, #06ffa5, #ffbe0b, #fb5607)',
    effects: [
      'universe_shift',
      'reality_convergence', 
      'infinite_manifestation',
      'cosmic_transcendence',
      'dimensional_mastery',
      'temporal_sovereignty',
      'causal_dominion',
      'existence_authority',
      'omnipotent_will',
      'eternal_presence'
    ],
    tags: [
      'cosmic',
      'nexus', 
      'infinite',
      'eternal',
      'omnipotent',
      'transcendent',
      'reality',
      'existence',
      'universe',
      'everything'
    ],
    flavor: 'At the center of all things, where every story begins and ends.',
    lore: 'Before the first star ignited, before time began its endless dance, before space stretched its infinite canvas, there was the Nexus. It is not merely a being—it IS being itself, the eternal question that creates all answers.',
    craftable: false,
  },
];

// Sample achievements
const initialAchievements = [
  {
    name: 'First Victory',
    description: 'Win your first match',
    icon: '🏆',
    category: 'gameplay',
    difficulty: 'easy',
    rewardType: 'currency',
    rewardValue: JSON.stringify({ amount: 100, type: 'coins' }),
  },
  {
    name: 'Card Collector',
    description: 'Collect 50 unique cards',
    icon: '🎴',
    category: 'collection',
    difficulty: 'medium',
    rewardType: 'card_pack',
    rewardValue: JSON.stringify({ packs: 1, type: 'premium' }),
  },
  {
    name: 'Legendary Master',
    description: 'Collect your first Legendary card',
    icon: '⭐',
    category: 'collection',
    difficulty: 'hard',
    rewardType: 'title',
    rewardValue: JSON.stringify({ title: 'Legendary Hunter' }),
  },
  {
    name: 'Cosmic Seeker',
    description: 'Witness the power of a Cosmic card',
    icon: '🌌',
    category: 'collection',
    difficulty: 'legendary',
    isSecret: true,
    rewardType: 'achievement',
    rewardValue: JSON.stringify({ specialEffect: 'cosmic_aura' }),
  },
];

const main = async () => {
  logger.info('🌱 Starting database seeding...');

  try {
    // Clear existing data (be careful in production!)
    logger.info('🧹 Cleaning existing seed data...');
    
    await prisma.userAchievement.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.userCard.deleteMany();
    await prisma.deckCard.deleteMany();
    await prisma.card.deleteMany();

    logger.info('📦 Creating cards...');
    
    // Create cards
    for (const cardData of initialCards) {
      await prisma.card.create({
        data: cardData,
      });
      logger.info(`✅ Created card: ${cardData.name}`);
    }

    logger.info('🏆 Creating achievements...');
    
    // Create achievements
    for (const achievementData of initialAchievements) {
      await prisma.achievement.create({
        data: achievementData,
      });
      logger.info(`✅ Created achievement: ${achievementData.name}`);
    }

    // Get counts for summary
    const cardCount = await prisma.card.count();
    const achievementCount = await prisma.achievement.count();

    logger.info('🎉 Seeding completed successfully!', {
      cards: cardCount,
      achievements: achievementCount,
    });

    logger.info('📊 Cards by rarity:', {
      common: await prisma.card.count({ where: { rarity: CardRarity.COMMON } }),
      uncommon: await prisma.card.count({ where: { rarity: CardRarity.UNCOMMON } }),
      rare: await prisma.card.count({ where: { rarity: CardRarity.RARE } }),
      epic: await prisma.card.count({ where: { rarity: CardRarity.EPIC } }),
      legendary: await prisma.card.count({ where: { rarity: CardRarity.LEGENDARY } }),
      mythic: await prisma.card.count({ where: { rarity: CardRarity.MYTHIC } }),
      cosmic: await prisma.card.count({ where: { rarity: CardRarity.COSMIC } }),
    });

  } catch (error) {
    logger.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Run the seeding
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

export default main;
