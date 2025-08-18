import React from 'react';
import { BaseComponentProps } from '../../types';
import './Badge.css';

interface BadgeProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  outlined?: boolean;
  rounded?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  outlined = false,
  rounded = false,
  className = '',
  children,
  testId,
}) => {
  const badgeClass = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    outlined && 'badge--outlined',
    rounded && 'badge--rounded',
    className
  ].filter(Boolean).join(' ');

  return (
    <span 
      className={badgeClass}
      data-testid={testId}
    >
      {children}
    </span>
  );
};
