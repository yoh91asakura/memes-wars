import React from 'react';
import { StatBadge } from '../../atoms/StatBadge';
import styles from './CardFooter.module.css';

export interface CardFooterProps {
  health: number;
  luck: number;
  layout?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact';
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  health,
  luck,
  layout = 'horizontal',
  size = 'medium',
  variant = 'default',
  className = ''
}) => {
  const footerClass = [
    styles.cardFooter,
    styles[layout],
    styles[variant],
    className
  ].filter(Boolean).join(' ');

  const badgeSize = size === 'large' ? 'medium' : size === 'small' ? 'small' : 'medium';
  const badgeVariant = variant === 'compact' ? 'compact' : 'default';

  return (
    <div className={footerClass}>
      <StatBadge 
        icon="❤️"
        value={health}
        label="HP"
        color="#ef4444"
        size={badgeSize}
        variant={badgeVariant}
      />
      <StatBadge 
        icon="🍀"
        value={luck}
        label="Luck"
        color="#10b981"
        size={badgeSize}
        variant={badgeVariant}
      />
    </div>
  );
};
