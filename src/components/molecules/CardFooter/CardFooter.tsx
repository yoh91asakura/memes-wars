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
  // Always use compact variant to hide labels
  const badgeVariant = 'compact';

  // Default values if undefined
  const safeHealth = health !== undefined && health !== null ? health : 0;
  const safeLuck = luck !== undefined && luck !== null ? luck : 0;

  return (
    <div className={footerClass}>
      <StatBadge 
        icon="❤️"
        value={safeHealth}
        label="HP"
        color="#ef4444"
        size={badgeSize}
        variant={badgeVariant}
      />
      <StatBadge 
        icon="🍀"
        value={safeLuck}
        label="Luck"
        color="#10b981"
        size={badgeSize}
        variant={badgeVariant}
      />
    </div>
  );
};
