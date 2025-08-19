import { ButtonHTMLAttributes, ReactNode } from 'react';
import { HTMLMotionProps } from 'framer-motion';

// Base component props that all components should extend
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonShape = 'rectangle' | 'rounded' | 'pill' | 'circle';

export interface ButtonProps extends BaseComponentProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** Button variant */
  variant?: ButtonVariant;
  
  /** Button size */
  size?: ButtonSize;
  
  /** Button shape */
  shape?: ButtonShape;
  
  /** Loading state */
  loading?: boolean;
  
  /** Icon to show before text */
  leftIcon?: ReactNode;
  
  /** Icon to show after text */
  rightIcon?: ReactNode;
  
  /** Full width button */
  fullWidth?: boolean;
  
  /** Disable animations */
  noAnimation?: boolean;
  
  /** Custom motion props */
  motionProps?: HTMLMotionProps<'button'>;
  
  /** Loading text for screen readers */
  loadingText?: string;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
}

export interface StyledButtonProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $shape: ButtonShape;
  $fullWidth: boolean;
  $loading: boolean;
  $disabled: boolean;
  $isTouch: boolean;
}
