import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { Progress } from '../Progress';
import './LoadingFallback.css';

interface LoadingFallbackProps {
  variant?: 'spinner' | 'skeleton' | 'progress' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  description?: string;
  progress?: number;
  showProgress?: boolean;
  className?: string;
  testId?: string;
  // Skeleton specific props
  lines?: number;
  avatar?: boolean;
  // Custom loading content
  children?: React.ReactNode;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  variant = 'spinner',
  size = 'md',
  message = 'Loading...',
  description,
  progress,
  showProgress = false,
  className = '',
  testId,
  lines = 3,
  avatar = false,
  children
}) => {
  const sizeClasses = {
    sm: 'loading-fallback--sm',
    md: 'loading-fallback--md',
    lg: 'loading-fallback--lg',
    xl: 'loading-fallback--xl'
  };

  const renderSpinner = () => (
    <motion.div
      className="loading-fallback__spinner"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Icon name="loader" size={size === 'sm' ? 'md' : size === 'xl' ? '2xl' : 'lg'} />
    </motion.div>
  );

  const renderSkeleton = () => (
    <div className="loading-fallback__skeleton">
      {avatar && (
        <div className="loading-fallback__skeleton-avatar">
          <div className="loading-fallback__skeleton-circle" />
        </div>
      )}
      <div className="loading-fallback__skeleton-content">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`loading-fallback__skeleton-line ${
              index === lines - 1 ? 'loading-fallback__skeleton-line--short' : ''
            }`}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          />
        ))}
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="loading-fallback__progress-container">
      <Icon name="download" size={size === 'sm' ? 'md' : 'lg'} />
      {showProgress && typeof progress === 'number' && (
        <Progress 
          value={progress} 
          className="loading-fallback__progress-bar"
          variant="primary"
        />
      )}
    </div>
  );

  const renderDots = () => (
    <div className="loading-fallback__dots">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="loading-fallback__dot"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <motion.div
      className="loading-fallback__pulse"
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Icon name="heart" size={size === 'sm' ? 'md' : size === 'xl' ? '2xl' : 'lg'} />
    </motion.div>
  );

  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'skeleton':
        return renderSkeleton();
      case 'progress':
        return renderProgress();
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  return (
    <div 
      className={`loading-fallback loading-fallback--${variant} ${sizeClasses[size]} ${className}`.trim()}
      data-testid={testId}
      role="status"
      aria-label={message}
    >
      {children ? (
        children
      ) : (
        <div className="loading-fallback__content">
          {variant !== 'skeleton' && (
            <div className="loading-fallback__indicator">
              {renderLoadingIndicator()}
            </div>
          )}
          
          {variant === 'skeleton' && renderLoadingIndicator()}

          {(message || description || (showProgress && typeof progress === 'number')) && (
            <div className="loading-fallback__text">
              {message && (
                <Text 
                  variant={size === 'sm' ? 'subtitle' : size === 'lg' || size === 'xl' ? 'h4' : 'body'} 
                  weight="medium"
                  className="loading-fallback__message"
                >
                  {message}
                </Text>
              )}
              
              {description && (
                <Text 
                  variant={size === 'sm' ? 'caption' : 'body'} 
                  color="muted"
                  className="loading-fallback__description"
                >
                  {description}
                </Text>
              )}
              
              {showProgress && typeof progress === 'number' && (
                <Text variant="caption" color="muted" className="loading-fallback__progress-text">
                  {Math.round(progress)}% complete
                </Text>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Specific loading components for common use cases
export const CardGridLoading: React.FC<{ cardCount?: number; className?: string }> = ({ 
  cardCount = 12, 
  className = '' 
}) => (
  <div className={`loading-fallback__card-grid ${className}`}>
    {Array.from({ length: cardCount }, (_, index) => (
      <div key={index} className="loading-fallback__card-skeleton">
        <div className="loading-fallback__card-image" />
        <div className="loading-fallback__card-content">
          <div className="loading-fallback__skeleton-line loading-fallback__skeleton-line--title" />
          <div className="loading-fallback__skeleton-line loading-fallback__skeleton-line--short" />
        </div>
      </div>
    ))}
  </div>
);

export const FiltersPanelLoading: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`loading-fallback__filters-panel ${className}`}>
    <div className="loading-fallback__filters-header">
      <div className="loading-fallback__skeleton-line loading-fallback__skeleton-line--title" />
    </div>
    <div className="loading-fallback__filters-content">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="loading-fallback__filter-group">
          <div className="loading-fallback__skeleton-line loading-fallback__skeleton-line--short" />
          <div className="loading-fallback__filter-options">
            {Array.from({ length: 3 }, (_, optIndex) => (
              <div key={optIndex} className="loading-fallback__filter-option" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const StatsLoading: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`loading-fallback__stats ${className}`}>
    <div className="loading-fallback__stats-grid">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="loading-fallback__stat-item">
          <div className="loading-fallback__skeleton-line loading-fallback__skeleton-line--number" />
          <div className="loading-fallback__skeleton-line loading-fallback__skeleton-line--short" />
        </div>
      ))}
    </div>
    <div className="loading-fallback__stats-chart">
      <div className="loading-fallback__skeleton-chart" />
    </div>
  </div>
);

// Higher-order component for loading states
export const withLoading = <P extends object>(
  Component: React.ComponentType<P>,
  LoadingComponent?: React.ComponentType<any>
) => {
  return ({ loading, ...props }: P & { loading: boolean }) => {
    if (loading) {
      return LoadingComponent ? <LoadingComponent /> : <LoadingFallback />;
    }
    
    return <Component {...(props as P)} />;
  };
};

export default LoadingFallback;