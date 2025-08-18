import React from 'react';
import { BaseComponentProps } from '../../types';
import './Spinner.css';

interface SpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  testId,
}) => {
  const spinnerClass = [
    'spinner',
    `spinner--${size}`,
    `spinner--${color}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={spinnerClass}
      data-testid={testId}
      role="status"
      aria-label="Loading"
    >
      <div className="spinner__circle"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
