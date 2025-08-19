import { HTMLAttributes, ReactNode } from 'react';

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle' | 'body' | 'caption' | 'overline';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextColor = 'primary' | 'secondary' | 'muted' | 'inverse' | 'accent' | 'success' | 'warning' | 'error' | 'inherit';

export interface TextProps extends BaseComponentProps, Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Text variant/style */
  variant?: TextVariant;
  
  /** Font weight */
  weight?: TextWeight;
  
  /** Text alignment */
  align?: TextAlign;
  
  /** Text color */
  color?: TextColor;
  
  /** Truncate text with ellipsis */
  truncate?: boolean;
  
  /** HTML element to render */
  as?: keyof JSX.IntrinsicElements;
  
  /** Make text uppercase */
  uppercase?: boolean;
  
  /** Make text italic */
  italic?: boolean;
}

export interface StyledTextProps {
  $variant: TextVariant;
  $weight: TextWeight;
  $align: TextAlign;
  $color: TextColor;
  $truncate: boolean;
  $uppercase: boolean;
  $italic: boolean;
}
