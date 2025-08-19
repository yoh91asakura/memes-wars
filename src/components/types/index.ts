// Re-export the unified card model for backward compatibility
export * from '../../models/unified/Card';
export * from './emoji';

// Global type definitions for The Meme Wars

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  createdAt: Date;
}

// Legacy Card interface - for backward compatibility with components
// Using the simplified version that matches current component usage
export interface Card {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'cosmic';
  emoji: string;
  type?: string;
  cost?: number;
  damage?: number;
  attack?: number;
  defense?: number;
  color?: string;
  stats: {
    attack: number;
    defense: number;
    health: number;
    speed?: number;
  };
  effects?: string[];
  tags?: string[];
  ability?: string;
  flavor?: string;
  createdAt?: Date;
}

export type Rarity = Card['rarity'];

export interface CardRoll {
  id: string;
  userId: string;
  card: Card;
  rolledAt: Date;
  packType?: string;
}

export interface GameStats {
  totalRolls: number;
  totalCards: number;
  cardsByRarity: Record<Rarity, number>;
  favoriteCard?: Card;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

// Re-export Button types from atoms
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonShape } from '../atoms/Button';

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'number';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// Animation types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

// Theme types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    background: string;
    foreground: string;
    border: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}
