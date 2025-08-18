import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { StyledButtonProps } from './Button.types';

const getVariantStyles = (variant: string) => {
  const variantMap = {
    primary: css`
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[500]}, ${({ theme }) => theme.colors.primary[600]});
      color: ${({ theme }) => theme.colors.text.inverse};
      border: 1px solid ${({ theme }) => theme.colors.primary[600]};
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[600]}, ${({ theme }) => theme.colors.primary[700]});
        border-color: ${({ theme }) => theme.colors.primary[700]};
      }
      
      &:active:not(:disabled) {
        background: ${({ theme }) => theme.colors.primary[700]};
      }
    `,
    
    secondary: css`
      background: ${({ theme }) => theme.colors.background.secondary};
      color: ${({ theme }) => theme.colors.text.primary};
      border: 1px solid ${({ theme }) => theme.colors.gray[300]};
      
      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.gray[100]};
        border-color: ${({ theme }) => theme.colors.gray[400]};
      }
      
      &:active:not(:disabled) {
        background: ${({ theme }) => theme.colors.gray[200]};
      }
    `,
    
    success: css`
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.success[500]}, ${({ theme }) => theme.colors.success[600]});
      color: ${({ theme }) => theme.colors.text.inverse};
      border: 1px solid ${({ theme }) => theme.colors.success[600]};
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.success[600]}, ${({ theme }) => theme.colors.success[700]});
      }
    `,
    
    warning: css`
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.warning[500]}, ${({ theme }) => theme.colors.warning[600]});
      color: ${({ theme }) => theme.colors.text.inverse};
      border: 1px solid ${({ theme }) => theme.colors.warning[600]};
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.warning[600]}, ${({ theme }) => theme.colors.warning[700]});
      }
    `,
    
    error: css`
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.error[500]}, ${({ theme }) => theme.colors.error[600]});
      color: ${({ theme }) => theme.colors.text.inverse};
      border: 1px solid ${({ theme }) => theme.colors.error[600]};
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.error[600]}, ${({ theme }) => theme.colors.error[700]});
      }
    `,
    
    ghost: css`
      background: transparent;
      color: ${({ theme }) => theme.colors.text.primary};
      border: 1px solid transparent;
      
      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.gray[100]};
      }
      
      &:active:not(:disabled) {
        background: ${({ theme }) => theme.colors.gray[200]};
      }
    `,
    
    outline: css`
      background: transparent;
      color: ${({ theme }) => theme.colors.primary[600]};
      border: 1px solid ${({ theme }) => theme.colors.primary[300]};
      
      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.primary[50]};
        border-color: ${({ theme }) => theme.colors.primary[500]};
      }
      
      &:active:not(:disabled) {
        background: ${({ theme }) => theme.colors.primary[100]};
      }
    `,
  };
  
  return variantMap[variant as keyof typeof variantMap] || variantMap.primary;
};

const getSizeStyles = (size: string, isTouch: boolean) => {
  const touchMultiplier = isTouch ? 1.2 : 1;
  
  const sizeMap = {
    xs: css`
      padding: ${({ theme }) => `calc(${theme.spacing[1]} * ${touchMultiplier}) calc(${theme.spacing[2]} * ${touchMultiplier})`};
      font-size: ${({ theme }) => theme.typography.sizes.xs};
      min-height: ${44 * (isTouch ? 1 : 0.8)}px; /* Touch target minimum */
    `,
    
    sm: css`
      padding: ${({ theme }) => `calc(${theme.spacing[2]} * ${touchMultiplier}) calc(${theme.spacing[3]} * ${touchMultiplier})`};
      font-size: ${({ theme }) => theme.typography.sizes.sm};
      min-height: ${44 * (isTouch ? 1 : 0.9)}px;
    `,
    
    md: css`
      padding: ${({ theme }) => `calc(${theme.spacing[3]} * ${touchMultiplier}) calc(${theme.spacing[4]} * ${touchMultiplier})`};
      font-size: ${({ theme }) => theme.typography.sizes.base};
      min-height: ${44 * touchMultiplier}px;
    `,
    
    lg: css`
      padding: ${({ theme }) => `calc(${theme.spacing[4]} * ${touchMultiplier}) calc(${theme.spacing[6]} * ${touchMultiplier})`};
      font-size: ${({ theme }) => theme.typography.sizes.lg};
      min-height: ${48 * touchMultiplier}px;
    `,
    
    xl: css`
      padding: ${({ theme }) => `calc(${theme.spacing[5]} * ${touchMultiplier}) calc(${theme.spacing[8]} * ${touchMultiplier})`};
      font-size: ${({ theme }) => theme.typography.sizes.xl};
      min-height: ${56 * touchMultiplier}px;
    `,
  };
  
  return sizeMap[size as keyof typeof sizeMap] || sizeMap.md;
};

const getShapeStyles = (shape: string) => {
  const shapeMap = {
    rectangle: css`
      border-radius: ${({ theme }) => theme.borderRadius.none};
    `,
    
    rounded: css`
      border-radius: ${({ theme }) => theme.borderRadius.md};
    `,
    
    pill: css`
      border-radius: ${({ theme }) => theme.borderRadius.full};
    `,
    
    circle: css`
      border-radius: ${({ theme }) => theme.borderRadius.full};
      aspect-ratio: 1;
      padding: ${({ theme }) => theme.spacing[3]};
    `,
  };
  
  return shapeMap[shape as keyof typeof shapeMap] || shapeMap.rounded;
};

export const StyledButton = styled.button<StyledButtonProps>`
  /* Reset */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  
  /* Typography */
  font-family: ${({ theme }) => theme.typography.fonts.sans};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  line-height: ${({ theme }) => theme.typography.lineHeights.none};
  text-decoration: none;
  white-space: nowrap;
  
  /* Layout */
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
  
  /* Interaction */
  cursor: ${({ $disabled, $loading }) => ($disabled || $loading) ? 'not-allowed' : 'pointer'};
  user-select: none;
  
  /* Transitions */
  transition: all ${({ theme }) => theme.animations.durations.normal} ${({ theme }) => theme.animations.easings.easeOut};
  
  /* Variants */
  ${({ $variant }) => getVariantStyles($variant)}
  
  /* Sizes */
  ${({ $size, $isTouch }) => getSizeStyles($size, $isTouch)}
  
  /* Shapes */
  ${({ $shape }) => getShapeStyles($shape)}
  
  /* States */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${({ $loading }) => $loading && css`
    position: relative;
    color: transparent;
  `}
  
  /* Focus styles */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  /* Loading state */
  ${({ $loading }) => $loading && css`
    pointer-events: none;
  `}
`;

export const StyledMotionButton = styled(motion.button)<StyledButtonProps>`
  /* Reset */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  
  /* Typography */
  font-family: ${({ theme }) => theme.typography.fonts.sans};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  line-height: ${({ theme }) => theme.typography.lineHeights.none};
  text-decoration: none;
  white-space: nowrap;
  
  /* Layout */
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
  
  /* Interaction */
  cursor: ${({ $disabled, $loading }) => ($disabled || $loading) ? 'not-allowed' : 'pointer'};
  user-select: none;
  
  /* Variants */
  ${({ $variant }) => getVariantStyles($variant)}
  
  /* Sizes */
  ${({ $size, $isTouch }) => getSizeStyles($size, $isTouch)}
  
  /* Shapes */
  ${({ $shape }) => getShapeStyles($shape)}
  
  /* States */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${({ $loading }) => $loading && css`
    position: relative;
    color: transparent;
  `}
  
  /* Focus styles */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

export const ButtonSpinner = styled(motion.div)`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
`;

export const ButtonSpinnerIcon = styled.svg`
  width: 1em;
  height: 1em;
`;

export const ButtonIcon = styled.span<{ $position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 1em;
    height: 1em;
  }
`;

export const ButtonText = styled.span`
  display: flex;
  align-items: center;
`;
