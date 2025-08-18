import React, { forwardRef, useCallback } from 'react';
// import { Variants } from 'framer-motion'; // Disabled due to prop conflicts
import { useResponsive } from '../../../hooks/useResponsive';
import { ButtonProps } from './Button.types';
import {
  StyledButton,
  // StyledMotionButton, // Disabled due to prop conflicts
  ButtonSpinner,
  ButtonSpinnerIcon,
  ButtonIcon,
  ButtonText,
} from './Button.styles';

/**
 * Button Component
 * 
 * A flexible, accessible button component with multiple variants, sizes, and animations.
 * Follows the design system and supports both regular and motion variants.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  noAnimation = false,
  motionProps = {},
  children,
  className = '',
  disabled,
  type = 'button',
  'aria-label': ariaLabel,
  loadingText = 'Loading...',
  onClick,
  ...props
}, ref) => {
  const { isMobile } = useResponsive();
  const prefersReducedMotion = false; // Default for simplicity
  const isTouch = isMobile;
  
  const isDisabled = disabled || loading;
  const shouldAnimate = !noAnimation && !prefersReducedMotion;
  
  // Animation variants for Framer Motion (disabled due to prop conflicts)
  // const animationVariants: Variants | undefined = shouldAnimate ? { ... } : undefined;
  
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
    onClick?.(event);
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
  
  // Separate HTML props from Framer Motion props to avoid conflicts
  const { 
    onAnimationStart: _onAnimationStart,
    onAnimationEnd: _onAnimationEnd,
    onAnimationIteration: _onAnimationIteration,
    onTransitionEnd: _onTransitionEnd,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    onDrag: _onDrag,
    onTouchStart: _onTouchStart,
    onTouchMove: _onTouchMove,
    onTouchEnd: _onTouchEnd,
    onPointerDown: _onPointerDown,
    onPointerMove: _onPointerMove,
    onPointerUp: _onPointerUp,
    ...htmlProps
  } = props;
  
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
    ...htmlProps,
    ...styledProps,
  };
  
  // Temporarily disable styled motion button to fix prop conflicts
  // TODO: Fix Framer Motion + styled-components prop conflicts in future iteration
  
  // Render as regular button if animations are disabled
  return (
    <StyledButton {...commonProps}>
      {buttonContent}
    </StyledButton>
  );
});

Button.displayName = 'Button';
