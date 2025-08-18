import React from 'react';
import { motion } from 'framer-motion';
import { ButtonProps } from '../../types';
import { Spinner } from '../Spinner/Spinner';
import './Button.css';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  type = 'button',
  className = '',
  testId,
}) => {
  const baseClass = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const isDisabled = disabled || loading;

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick();
    }
  };

  return (
    <motion.button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className} ${
        isDisabled ? 'btn--disabled' : ''
      }`.trim()}
      onClick={handleClick}
      disabled={isDisabled}
      data-testid={testId}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.1 }}
    >
      {loading ? (
        <div className="btn__content">
          <Spinner size="sm" />
          {children && <span className="btn__text">{children}</span>}
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};
