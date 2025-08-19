import { CardRarity } from '../models/unified/Card';

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

export const RARITY_THEMES: Record<CardRarity, RarityTheme> = {
  [CardRarity.COMMON]: {
    borderColor: '#9CA3AF',
    glowColor: 'transparent',
    backgroundColor: '#F9FAFB',
    textColor: '#374151',
    animation: 'none',
    shadowColor: '#00000020',
    gradientStart: '#F9FAFB',
    gradientEnd: '#F3F4F6'
  },
  [CardRarity.UNCOMMON]: {
    borderColor: '#10B981',
    glowColor: '#10B98140',
    backgroundColor: '#ECFDF5',
    textColor: '#065F46',
    animation: 'none',
    shadowColor: '#10B98130',
    gradientStart: '#ECFDF5',
    gradientEnd: '#D1FAE5'
  },
  [CardRarity.RARE]: {
    borderColor: '#3B82F6',
    glowColor: '#3B82F640',
    backgroundColor: '#EFF6FF',
    textColor: '#1E3A8A',
    animation: 'pulse',
    shadowColor: '#3B82F640',
    gradientStart: '#EFF6FF',
    gradientEnd: '#DBEAFE'
  },
  [CardRarity.EPIC]: {
    borderColor: '#8B5CF6',
    glowColor: '#8B5CF650',
    backgroundColor: '#F5F3FF',
    textColor: '#4C1D95',
    animation: 'pulse',
    shadowColor: '#8B5CF650',
    gradientStart: '#F5F3FF',
    gradientEnd: '#EDE9FE'
  },
  [CardRarity.LEGENDARY]: {
    borderColor: '#F59E0B',
    glowColor: '#F59E0B60',
    backgroundColor: '#FFFBEB',
    textColor: '#92400E',
    animation: 'shimmer',
    shadowColor: '#F59E0B60',
    gradientStart: '#FFFBEB',
    gradientEnd: '#FEF3C7'
  },
  [CardRarity.MYTHIC]: {
    borderColor: '#EF4444',
    glowColor: '#EF444470',
    backgroundColor: '#FEF2F2',
    textColor: '#991B1B',
    animation: 'flame',
    shadowColor: '#EF444470',
    gradientStart: '#FEF2F2',
    gradientEnd: '#FEE2E2'
  },
  [CardRarity.COSMIC]: {
    borderColor: '#EC4899',
    glowColor: '#EC489980',
    backgroundColor: '#FDF2F8',
    textColor: '#831843',
    animation: 'cosmic',
    shadowColor: '#EC489980',
    gradientStart: '#FDF2F8',
    gradientEnd: '#FCE7F3'
  },
  [CardRarity.DIVINE]: {
    borderColor: '#FFD700',
    glowColor: '#FFD70090',
    backgroundColor: '#FFFEF0',
    textColor: '#FFB300',
    animation: 'sparkle',
    shadowColor: '#FFD70090',
    gradientStart: '#FFFEF0',
    gradientEnd: '#FEF9C3'
  },
  [CardRarity.INFINITY]: {
    borderColor: '#9400D3',
    glowColor: '#9400D390',
    backgroundColor: '#FFF0F5',
    textColor: '#4B0082',
    animation: 'cosmic',
    shadowColor: '#9400D390',
    gradientStart: '#FFF0F5',
    gradientEnd: '#F3E8FF'
  }
};

export const formatStatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};
