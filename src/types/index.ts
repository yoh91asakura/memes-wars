// Re-export the card model for backward compatibility
export * from '../models';
export * from '../components/types/emoji';

// Component types
export * from './components';

// Global type definitions for The Meme Wars

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  createdAt: Date;
}

// Note: Card interfaces are now unified in src/models/Card.ts
// This file re-exports them for backward compatibility

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

export interface InputProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
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

// Re-export base component props for backward compatibility
export type { BaseComponentProps } from './components';