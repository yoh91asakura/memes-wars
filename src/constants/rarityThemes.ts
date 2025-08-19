// Rarity themes for card display
import { CardUtils } from '../models/Card';

export interface RarityTheme {
  borderColor: string;
  glowColor: string;
  backgroundColor: string;
  textColor: string;
  animation: 'none' | 'pulse' | 'shimmer' | 'sparkle' | 'flame' | 'cosmic';
  shadowColor: string;
  gradientStart: string;
  gradientEnd: string;
}

// Get theme based on rarity probability number
export function getRarityTheme(rarityProbability: number): RarityTheme {
  const rarityName = CardUtils.getRarityName(rarityProbability).toLowerCase();
  
  switch (rarityName) {
    case 'common':
      return {
        borderColor: '#9CA3AF',
        glowColor: 'transparent',
        backgroundColor: '#F9FAFB',
        textColor: '#374151',
        animation: 'none',
        shadowColor: '#00000020',
        gradientStart: '#F9FAFB',
        gradientEnd: '#F3F4F6'
      };
    case 'uncommon':
      return {
        borderColor: '#10B981',
        glowColor: '#10B98140',
        backgroundColor: '#ECFDF5',
        textColor: '#065F46',
        animation: 'none',
        shadowColor: '#10B98130',
        gradientStart: '#ECFDF5',
        gradientEnd: '#D1FAE5'
      };
    case 'rare':
      return {
        borderColor: '#3B82F6',
        glowColor: '#3B82F640',
        backgroundColor: '#EFF6FF',
        textColor: '#1E3A8A',
        animation: 'pulse',
        shadowColor: '#3B82F640',
        gradientStart: '#EFF6FF',
        gradientEnd: '#DBEAFE'
      };
    case 'epic':
      return {
        borderColor: '#8B5CF6',
        glowColor: '#8B5CF650',
        backgroundColor: '#F5F3FF',
        textColor: '#4C1D95',
        animation: 'pulse',
        shadowColor: '#8B5CF650',
        gradientStart: '#F5F3FF',
        gradientEnd: '#EDE9FE'
      };
    case 'legendary':
      return {
        borderColor: '#FFD700',
        glowColor: '#FFD70080',
        backgroundColor: '#1a1600',
        textColor: '#FFD700',
        animation: 'shimmer',
        shadowColor: '#FFD70080',
        gradientStart: '#1a1600',
        gradientEnd: '#2a2200'
      };
    case 'mythic':
      return {
        borderColor: '#EF4444',
        glowColor: '#EF444470',
        backgroundColor: '#1a0606',
        textColor: '#EF4444',
        animation: 'flame',
        shadowColor: '#EF444470',
        gradientStart: '#1a0606',
        gradientEnd: '#2a0808'
      };
    case 'cosmic':
      return {
        borderColor: '#EC4899',
        glowColor: '#EC489980',
        backgroundColor: '#1a0a1a',
        textColor: '#EC4899',
        animation: 'cosmic',
        shadowColor: '#EC489980',
        gradientStart: '#1a0a1a',
        gradientEnd: '#2a1a2a'
      };
    case 'divine':
      return {
        borderColor: '#FFD700',
        glowColor: '#FFD70090',
        backgroundColor: '#FFFEF0',
        textColor: '#FFB300',
        animation: 'sparkle',
        shadowColor: '#FFD70090',
        gradientStart: '#FFFEF0',
        gradientEnd: '#FEF9C3'
      };
    case 'infinity':
    case 'beyond':
      return {
        borderColor: '#9400D3',
        glowColor: '#9400D390',
        backgroundColor: '#FFF0F5',
        textColor: '#4B0082',
        animation: 'cosmic',
        shadowColor: '#9400D390',
        gradientStart: '#FFF0F5',
        gradientEnd: '#F3E8FF'
      };
    default:
      return {
        borderColor: '#9CA3AF',
        glowColor: 'transparent',
        backgroundColor: '#F9FAFB',
        textColor: '#374151',
        animation: 'none',
        shadowColor: '#00000020',
        gradientStart: '#F9FAFB',
        gradientEnd: '#F3F4F6'
      };
  }
}

// Legacy support - map string rarity to theme
export function getRarityThemeByName(rarityName: string): RarityTheme {
  const rarityMap: Record<string, number> = {
    'common': 2,
    'uncommon': 4,
    'rare': 10,
    'epic': 50,
    'legendary': 200,
    'mythic': 1000,
    'cosmic': 10000,
    'divine': 100000,
    'infinity': 1000000
  };
  
  const probability = rarityMap[rarityName.toLowerCase()] || 2;
  return getRarityTheme(probability);
}

export const formatStatValue = (value: number): string => {
  // Handle undefined, null, or invalid values
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};
