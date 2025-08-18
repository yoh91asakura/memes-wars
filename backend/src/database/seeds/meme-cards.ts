import { PrismaClient, CardRarity, CardType } from '@prisma/client';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient();

// Cartes meme amusantes pour le MVP
const memeCards = [
  // Common Memes
  {
    name: 'Doge 🐕',
    description: 'Much wow! Such power! Very attack!',
    emoji: '🐕',
    rarity: CardRarity.COMMON,
    type: CardType.CREATURE,
    cost: 2,
    attack: 3,
    defense: 2,
    health: 3,
    attackSpeed: 1.2,
    color: '#F4A460',
    effects: ['wow_factor', 'meme_power'],
    tags: ['dog', 'meme', 'classic', 'wow'],
    flavor: 'Much attack, such defend, very memeable.',
    lore: 'The OG meme that started it all. Still making people smile after all these years.',
    craftable: false,
  },
  {
    name: 'Grumpy Cat 😾',
    description: 'Disapproves of your life choices and deals damage accordingly.',
    emoji: '😾',
    rarity: CardRarity.COMMON,
    type: CardType.CREATURE,
    cost: 1,
    attack: 2,
    defense: 3,
    health: 2,
    attackSpeed: 0.8,
    color: '#696969',
    effects: ['grumpiness', 'judgment'],
    tags: ['cat', 'meme', 'grumpy', 'classic'],
    flavor: '"NO." - Grumpy Cat',
    craftable: false,
  },
  {
    name: 'Pepe 🐸',
    description: 'Feels good man! A versatile meme with many forms.',
    emoji: '🐸',
    rarity: CardRarity.COMMON,
    type: CardType.CREATURE,
    cost: 2,
    attack: 2,
    defense: 2,
    health: 3,
    attackSpeed: 1.0,
    color: '#32CD32',
    effects: ['feels_good', 'adaptability'],
    tags: ['frog', 'meme', 'feels', 'versatile'],
    flavor: 'Feels good to be in a card game, man.',
    craftable: false,
  },

  // Uncommon Memes
  {
    name: 'Distracted Boyfriend 👫👀',
    description: 'Gets distracted and might attack the wrong target.',
    emoji: '👫👀',
    rarity: CardRarity.UNCOMMON,
    type: CardType.CREATURE,
    cost: 3,
    attack: 4,
    defense: 2,
    health: 4,
    attackSpeed: 1.1,
    color: '#FF69B4',
    effects: ['distraction', 'random_target'],
    tags: ['human', 'meme', 'relationship', 'chaos'],
    flavor: 'Wait, what was I supposed to be attacking again?',
    craftable: true,
    craftCost: 50,
  },
  {
    name: 'This is Fine Dog 🔥☕',
    description: 'Ignores all damage while drinking coffee in a burning room.',
    emoji: '🔥☕',
    rarity: CardRarity.UNCOMMON,
    type: CardType.CREATURE,
    cost: 4,
    attack: 1,
    defense: 6,
    health: 5,
    attackSpeed: 0.5,
    color: '#D2691E',
    effects: ['ignore_damage', 'denial', 'coffee_boost'],
    tags: ['dog', 'meme', 'fire', 'fine'],
    flavor: 'This is fine. Everything is fine. I am fine.',
    craftable: true,
    craftCost: 75,
  },

  // Rare Memes
  {
    name: 'Chad 💪😎',
    description: 'The ultimate alpha. Intimidates enemies just by existing.',
    emoji: '💪😎',
    rarity: CardRarity.RARE,
    type: CardType.CREATURE,
    cost: 5,
    attack: 7,
    defense: 5,
    health: 6,
    attackSpeed: 1.3,
    color: '#FF6347',
    effects: ['alpha_presence', 'intimidation', 'chad_energy'],
    tags: ['human', 'meme', 'alpha', 'chad'],
    flavor: 'Yes.',
    lore: 'The embodiment of peak performance and confidence.',
    craftable: true,
    craftCost: 150,
  },
  {
    name: 'Stonks Guy 📈',
    description: 'Makes all cards more valuable through pure financial energy.',
    emoji: '📈',
    rarity: CardRarity.RARE,
    type: CardType.CREATURE,
    cost: 4,
    attack: 3,
    defense: 4,
    health: 5,
    attackSpeed: 1.0,
    color: '#4169E1',
    effects: ['stonks_boost', 'value_increase', 'market_manipulation'],
    tags: ['human', 'meme', 'finance', 'stonks'],
    flavor: 'Stonks only go up! 📈📈📈',
    craftable: true,
    craftCost: 200,
  },

  // Epic Memes
  {
    name: 'Big Chungus 🐰💯',
    description: 'An absolute unit. Takes up extra space on the battlefield.',
    emoji: '🐰💯',
    rarity: CardRarity.EPIC,
    type: CardType.CREATURE,
    cost: 7,
    attack: 8,
    defense: 9,
    health: 12,
    attackSpeed: 0.7,
    color: '#8B4513',
    effects: ['absolute_unit', 'thicc_presence', 'chungus_power'],
    tags: ['rabbit', 'meme', 'big', 'chungus', 'unit'],
    flavor: 'He\'s a big chungus. He\'s a big chunky boy.',
    lore: 'When the universe needed a hero, it got Big Chungus instead. And that was somehow enough.',
    craftable: true,
    craftCost: 400,
  },
  {
    name: 'Harambe\'s Spirit 🦍👼',
    description: 'The eternal guardian of memes. Grants protection from above.',
    emoji: '🦍👼',
    rarity: CardRarity.EPIC,
    type: CardType.CREATURE,
    cost: 6,
    attack: 6,
    defense: 8,
    health: 10,
    attackSpeed: 1.0,
    color: '#FFD700',
    effects: ['divine_protection', 'meme_blessing', 'eternal_watch'],
    tags: ['gorilla', 'meme', 'spirit', 'guardian', 'blessed'],
    flavor: 'Dicks out for Harambe. Forever in our hearts.',
    lore: 'Though he left this world, his spirit lives on in every meme.',
    craftable: true,
    craftCost: 350,
  },

  // Legendary Memes
  {
    name: 'Keanu Reeves 🕴️✨',
    description: 'Breathtaking! The most wholesome force in the universe.',
    emoji: '🕴️✨',
    rarity: CardRarity.LEGENDARY,
    type: CardType.CREATURE,
    cost: 8,
    attack: 10,
    defense: 7,
    health: 12,
    attackSpeed: 1.5,
    color: 'linear-gradient(45deg, #000000, #333333, #666666)',
    effects: ['breathtaking', 'wholesomeness', 'john_wick_mode', 'matrix_dodge'],
    tags: ['human', 'meme', 'wholesome', 'keanu', 'breathtaking'],
    flavor: 'You\'re breathtaking!',
    lore: 'The internet\'s boyfriend. Loved by all, wholesome beyond measure.',
    craftable: true,
    craftCost: 777, // Lucky number for a legend
  },
  {
    name: 'Shrek 🧌👑',
    description: 'The ultimate meme lord. Shrek is love, Shrek is life.',
    emoji: '🧌👑',
    rarity: CardRarity.LEGENDARY,
    type: CardType.CREATURE,
    cost: 9,
    attack: 12,
    defense: 8,
    health: 15,
    attackSpeed: 1.2,
    color: '#9ACD32',
    effects: ['swamp_power', 'onion_layers', 'meme_lord', 'all_star'],
    tags: ['ogre', 'meme', 'shrek', 'lord', 'layers'],
    flavor: 'Somebody once told me...',
    lore: 'In the beginning, there was Shrek. And Shrek was good.',
    craftable: true,
    craftCost: 888,
  },

  // Mythic Meme
  {
    name: 'Number One 1️⃣👑',
    description: 'We are number one! The eternal meme that united the internet.',
    emoji: '1️⃣👑',
    rarity: CardRarity.MYTHIC,
    type: CardType.CREATURE,
    cost: 10,
    attack: 15,
    defense: 10,
    health: 20,
    attackSpeed: 1.0,
    color: 'linear-gradient(45deg, #FFD700, #FFA500, #FF69B4)',
    effects: ['number_one', 'villain_song', 'internet_unity', 'eternal_meme'],
    tags: ['human', 'meme', 'villain', 'number_one', 'eternal'],
    flavor: 'Here\'s a little lesson in trickery!',
    lore: 'Stefan Karl Stefansson gave us the greatest meme of all time. His legacy lives forever.',
    craftable: false, // Too precious to craft
  },

  // Special Utility Cards
  {
    name: 'Stonks 📈',
    description: 'Pure economic energy. Doubles the value of the next roll.',
    emoji: '📈',
    rarity: CardRarity.RARE,
    type: CardType.SPELL,
    cost: 3,
    attack: 0,
    defense: 0,
    health: 1,
    attackSpeed: 1.0,
    color: '#00FF00',
    effects: ['double_value', 'stonks_energy'],
    tags: ['spell', 'meme', 'economy', 'stonks'],
    flavor: 'Line goes up!',
    craftable: true,
    craftCost: 100,
  },
  {
    name: 'Press F 🇫',
    description: 'Pay respects. Revive one fallen card.',
    emoji: '🇫',
    rarity: CardRarity.UNCOMMON,
    type: CardType.SPELL,
    cost: 2,
    attack: 0,
    defense: 0,
    health: 1,
    attackSpeed: 1.0,
    color: '#808080',
    effects: ['pay_respects', 'revive'],
    tags: ['spell', 'meme', 'respect', 'revival'],
    flavor: 'F',
    craftable: true,
    craftCost: 60,
  },
];

export const seedMemeCards = async () => {
  logger.info('🎭 Seeding meme cards for MVP...');
  
  try {
    // Clear existing cards first (optional)
    await prisma.card.deleteMany({
      where: {
        name: {
          in: memeCards.map(card => card.name)
        }
      }
    });

    // Create meme cards
    for (const cardData of memeCards) {
      await prisma.card.create({
        data: cardData,
      });
      logger.info(`✅ Created meme card: ${cardData.name}`);
    }

    const totalCards = await prisma.card.count();
    logger.info(`🎉 Meme cards seeded successfully! Total cards in database: ${totalCards}`);

    // Log distribution by rarity
    const distribution = {
      common: await prisma.card.count({ where: { rarity: CardRarity.COMMON } }),
      uncommon: await prisma.card.count({ where: { rarity: CardRarity.UNCOMMON } }),
      rare: await prisma.card.count({ where: { rarity: CardRarity.RARE } }),
      epic: await prisma.card.count({ where: { rarity: CardRarity.EPIC } }),
      legendary: await prisma.card.count({ where: { rarity: CardRarity.LEGENDARY } }),
      mythic: await prisma.card.count({ where: { rarity: CardRarity.MYTHIC } }),
    };

    logger.info('📊 Card distribution:', distribution);
    
  } catch (error) {
    logger.error('❌ Error seeding meme cards:', error);
    throw error;
  }
};

// Si ce fichier est exécuté directement
if (require.main === module) {
  seedMemeCards()
    .then(() => {
      logger.info('🎭 Meme cards seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Meme cards seeding failed:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export default seedMemeCards;
