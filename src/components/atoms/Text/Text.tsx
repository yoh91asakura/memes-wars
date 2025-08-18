import React from 'react';
import { BaseComponentProps } from '../../types';
import './Text.css';

interface TextProps extends BaseComponentProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'subtitle';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'danger' | 'inherit';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  as?: keyof JSX.IntrinsicElements;
  truncate?: boolean;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'inherit',
  weight = 'normal',
  align = 'left',
  as,
  truncate = false,
  className = '',
  children,
  testId,
}) => {
  // Determine the HTML element to render
  const getElement = (): keyof JSX.IntrinsicElements => {
    if (as) return as;
    
    switch (variant) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return variant;
      case 'caption':
        return 'small';
      case 'subtitle':
        return 'h6';
      default:
        return 'p';
    }
  };

  const Element = getElement();

  const textClass = [
    'text',
    `text--${variant}`,
    `text--${color}`,
    `text--${weight}`,
    `text--${align}`,
    truncate && 'text--truncate',
    className
  ].filter(Boolean).join(' ');

  return (
    <Element 
      className={textClass}
      data-testid={testId}
    >
      {children}
    </Element>
  );
};
