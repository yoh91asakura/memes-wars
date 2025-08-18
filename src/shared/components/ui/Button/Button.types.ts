import { ButtonHTMLAttributes } from 'react';
import { HTMLMotionProps } from 'framer-motion';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonShape = 'rectangle' | 'rounded' | 'pill' | 'circle';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** Button variant */
  variant?: ButtonVariant;
  
  /** Button size */
  size?: ButtonSize;
  
  /** Button shape */
  shape?: ButtonShape;
  
  /** Loading state */
  loading?: boolean;
  
  /** Icon to show before text */
  leftIcon?: React.ReactNode;
  
  /** Icon to show after text */
  rightIcon?: React.ReactNode;
  
  /** Full width button */
  fullWidth?: boolean;
  
  /** Disable animations */
  noAnimation?: boolean;
  
  /** Custom motion props */
  motionProps?: HTMLMotionProps<'button'>;
  
  /** Accessible label for screen readers */
  'aria-label'?: string;
  
  /** Loading text for screen readers */
  loadingText?: string;
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
