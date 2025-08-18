import { forwardRef, memo } from 'react';
import { TextProps } from './Text.types';
import { StyledText } from './Text.styles';

const getElementFromVariant = (variant: string): keyof JSX.IntrinsicElements => {
  const elementMap: Record<string, keyof JSX.IntrinsicElements> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    subtitle: 'h2',
    body: 'p',
    caption: 'span',
    overline: 'span',
  };
  
  return elementMap[variant] || 'span';
};

/**
 * Text Component
 * 
 * A flexible text component with multiple variants, weights, colors, and alignment options.
 * Follows the atomic design system and uses styled-components for styling.
 */
export const Text = memo(forwardRef<HTMLElement, TextProps>(({
  variant = 'body',
  weight = 'normal',
  align = 'left',
  color = 'primary',
  truncate = false,
  uppercase = false,
  italic = false,
  as,
  children,
  className = '',
  testId,
  ...props
}, ref) => {
  const Element = as || getElementFromVariant(variant);
  
  const styledProps = {
    $variant: variant,
    $weight: weight,
    $align: align,
    $color: color,
    $truncate: truncate,
    $uppercase: uppercase,
    $italic: italic,
  };

  return (
    <StyledText
      as={Element}
      ref={ref}
      className={className}
      data-testid={testId}
      {...styledProps}
      {...props}
    >
      {children}
    </StyledText>
  );
}));

Text.displayName = 'Text';