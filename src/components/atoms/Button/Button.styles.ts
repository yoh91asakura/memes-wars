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
        transform: translateY(-1px);
        box-shadow: ${({ theme }) => theme.shadows.lg};
      }
      
      &:active:not(:disabled) {
        background: ${({ theme }) => theme.colors.primary[700]};
        transform: translateY(0);
      }
    `,
    
    secondary: css`
      background: ${({ theme }) => theme.colors.background.secondary};
      color: ${({ theme }) => theme.colors.text.primary};
      border: 1px solid ${({ theme }) => theme.colors.gray[300]};
      
      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.gray[100]};
        border-color: ${({ theme }) => theme.colors.gray[400]};
        transform: translateY(-1px);
        box-shadow: ${({ theme }) => theme.shadows.md};
      }
      
      &:active:not(:disabled) {
        background: ${({ theme }) => theme.colors.gray[200]};
        transform: translateY(0);
      }
    `,
    
    success: css`
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.success[500]}, ${({ theme }) => theme.colors.success[600]});
      color: ${({ theme }) => theme.colors.text.inverse};
      border: 1px solid ${({ theme }) => theme.colors.success[600]};
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.success[600]}, ${({ theme }) => theme.colors.success[700]});
        transform: translateY(-1px);
        box-shadow: ${({ theme }) => theme.shadows.lg};
      }
    `,
    
    warning: css`
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.warning[500]}, ${({ theme }) => theme.colors.warning[600]});
      color: ${({ theme }) => theme.colors.text.inverse};
      border: 1px solid ${({ theme }) => theme.colors.warning[600]};
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.warning[600]}, ${({ theme }) => theme.colors.warning[700]});
        transform: translateY(-1px);
        box-shadow: ${({ theme }) => theme.shadows.lg};
      }
    `,
    
    danger: css`
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.error[500]}, ${({ theme }) => theme.colors.error[600]});
      color: ${({ theme }) => theme.colors.text.inverse};
      border: 1px solid ${({ theme }) => theme.colors.error[600]};
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.error[600]}, ${({ theme }) => theme.colors.error[700]});
        transform: translateY(-1px);
        box-shadow: ${({ theme }) => theme.shadows.lg};
      }
    `,
    
    ghost: css`
      background: transparent;
      color: ${({ theme }) => theme.colors.text.primary};
      border: 1px solid transparent;
      
      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.gray[100]};
        color: ${({ theme }) => theme.colors.text.primary};
      }
    `,
    
    outline: css`
      background: transparent;
      color: ${({ theme }) => theme.colors.primary[600]};
      border: 1px solid ${({ theme }) => theme.colors.primary[600]};
      
      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.primary[600]};
        color: ${({ theme }) => theme.colors.text.inverse};
      }
    `,
  };
  
  return variantMap[variant as keyof typeof variantMap] || variantMap.primary;
};

const getSizeStyles = (size: string) => {
  const sizeMap = {
    xs: css`
      padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
      font-size: ${({ theme }) => theme.typography.sizes.xs};
      font-weight: ${({ theme }) => theme.typography.weights.medium};
      min-height: 28px;
    `,
    sm: css`
      padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
      font-size: ${({ theme }) => theme.typography.sizes.sm};
      font-weight: ${({ theme }) => theme.typography.weights.medium};
      min-height: 32px;
    `,
    md: css`
      padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
      font-size: ${({ theme }) => theme.typography.sizes.base};
      font-weight: ${({ theme }) => theme.typography.weights.medium};
      min-height: 40px;
    `,
    lg: css`
      padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
      font-size: ${({ theme }) => theme.typography.sizes.lg};
      font-weight: ${({ theme }) => theme.typography.weights.semibold};
      min-height: 48px;
    `,
    xl: css`
      padding: ${({ theme }) => theme.spacing[5]} ${({ theme }) => theme.spacing[8]};
      font-size: ${({ theme }) => theme.typography.sizes.xl};
      font-weight: ${({ theme }) => theme.typography.weights.semibold};
      min-height: 56px;
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
  appearance: none;
  border: none;
  margin: 0;
  outline: none;
  text-decoration: none;
  
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.typography.fonts.sans};
  line-height: ${({ theme }) => theme.typography.lineHeights.tight};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.durations.fast} ${({ theme }) => theme.animations.easings.easeInOut};
  user-select: none;
  white-space: nowrap;
  
  /* Size styles */
  ${({ $size }) => getSizeStyles($size)}
  
  /* Shape styles */
  ${({ $shape }) => getShapeStyles($shape)}
  
  /* Variant styles */
  ${({ $variant }) => getVariantStyles($variant)}
  
  /* Full width */
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
  
  /* Loading state */
  ${({ $loading }) => $loading && css`
    pointer-events: none;
    opacity: 0.8;
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  /* Focus styles */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  /* Touch styles */
  ${({ $isTouch }) => $isTouch && css`
    &:hover {
      transform: none;
    }
  `}
`;

export const StyledMotionButton = styled(motion.button)<StyledButtonProps>`
  /* Reset */
  appearance: none;
  border: none;
  margin: 0;
  outline: none;
  text-decoration: none;
  
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.typography.fonts.sans};
  line-height: ${({ theme }) => theme.typography.lineHeights.tight};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.durations.fast} ${({ theme }) => theme.animations.easings.easeInOut};
  user-select: none;
  white-space: nowrap;
  
  /* Size styles */
  ${({ $size }) => getSizeStyles($size)}
  
  /* Shape styles */
  ${({ $shape }) => getShapeStyles($shape)}
  
  /* Variant styles */
  ${({ $variant }) => getVariantStyles($variant)}
  
  /* Full width */
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
  
  /* Loading state */
  ${({ $loading }) => $loading && css`
    pointer-events: none;
    opacity: 0.8;
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  /* Focus styles */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  /* Touch styles */
  ${({ $isTouch }) => $isTouch && css`
    &:hover {
      transform: none;
    }
  `}
`;

export const ButtonSpinner = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
`;

export const ButtonSpinnerIcon = styled.svg`
  width: 100%;
  height: 100%;
`;

export const ButtonIcon = styled.div<{ $position: 'left' | 'right' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  ${({ $position }) => $position === 'left' && css`
    margin-right: -${({ theme }) => theme.spacing[1]};
  `}
  
  ${({ $position }) => $position === 'right' && css`
    margin-left: -${({ theme }) => theme.spacing[1]};
  `}
`;

export const ButtonText = styled.span`
  /* Text specific styles can go here if needed */
`;
