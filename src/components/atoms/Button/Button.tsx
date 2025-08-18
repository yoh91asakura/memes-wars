import React, { forwardRef, useCallback, memo } from 'react';
import { useResponsive } from '../../../shared/hooks/useResponsive';
import { ButtonProps } from './Button.types';
import {
  StyledButton,
  ButtonSpinner,
  ButtonSpinnerIcon,
  ButtonIcon,
  ButtonText,
} from './Button.styles';

/**
 * Button Component
 * 
 * A flexible, accessible button component with multiple variants, sizes, and animations.
 * Follows the atomic design system and supports both regular and motion variants.
 */
export const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  noAnimation = false,
  motionProps: _motionProps = {},
  children,
  className = '',
  disabled,
  type = 'button',
  'aria-label': ariaLabel,
  loadingText = 'Loading...',
  onClick,
  testId,
  ...props
}, ref) => {
  const { isMobile } = useResponsive();
  const prefersReducedMotion = false; // Can be enhanced with actual media query
  const isTouch = isMobile;
  
  const isDisabled = disabled || loading;
  const shouldAnimate = !noAnimation && !prefersReducedMotion;
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <ButtonSpinner
      animate={shouldAnimate ? { rotate: 360 } : {}}
      transition={shouldAnimate ? { 
        duration: 1, 
        repeat: Infinity, 
        ease: 'linear' 
      } : {}}
      aria-hidden="true"
    >
      <ButtonSpinnerIcon 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </ButtonSpinnerIcon>
    </ButtonSpinner>
  );
  
  // Handle click with loading state
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.();
  }, [isDisabled, onClick]);
  
  // Button content
  const buttonContent = (
    <>
      {loading && <LoadingSpinner />}
      {!loading && leftIcon && (
        <ButtonIcon $position="left" aria-hidden="true">
          {leftIcon}
        </ButtonIcon>
      )}
      {children && (
        <ButtonText>
          {children}
        </ButtonText>
      )}
      {!loading && rightIcon && (
        <ButtonIcon $position="right" aria-hidden="true">
          {rightIcon}
        </ButtonIcon>
      )}
      
      {/* Screen reader content for loading state */}
      {loading && (
        <span className="sr-only">{loadingText}</span>
      )}
    </>
  );
  
  const styledProps = {
    $variant: variant,
    $size: size,
    $shape: shape,
    $fullWidth: fullWidth,
    $loading: loading,
    $disabled: isDisabled,
    $isTouch: isTouch,
  };
  
  const commonProps = {
    ref,
    type,
    className,
    disabled: isDisabled,
    onClick: handleClick,
    'aria-label': ariaLabel,
    'aria-disabled': isDisabled,
    'aria-busy': loading,
    'data-testid': testId,
    ...props,
    ...styledProps,
  };
  
  // For now, use regular button to avoid motion prop conflicts
  // TODO: Fix framer-motion + styled-components compatibility
  return (
    <StyledButton {...commonProps}>
      {buttonContent}
    </StyledButton>
  );
}));

Button.displayName = 'Button';
