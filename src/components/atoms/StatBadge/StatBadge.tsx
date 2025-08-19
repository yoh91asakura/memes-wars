import React from 'react';
import { formatStatValue } from '../../../constants/rarityThemes';
import styles from './StatBadge.module.css';

export interface StatBadgeProps {
  icon: string;
  value: number;
  label: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact';
  className?: string;
}

export const StatBadge: React.FC<StatBadgeProps> = ({
  icon,
  value,
  label,
  color,
  size = 'medium',
  variant = 'default',
  className = ''
}) => {
  const badgeClass = [
    styles.statBadge,
    styles[size],
    styles[variant],
    className
  ].filter(Boolean).join(' ');

  const formattedValue = formatStatValue(value);

  return (
    <div 
      className={badgeClass}
      style={{
        '--stat-color': color || 'currentColor'
      } as React.CSSProperties}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.value}>{formattedValue}</span>
      {variant === 'default' && (
        <span className={styles.label}>{label}</span>
      )}
    </div>
  );
};
