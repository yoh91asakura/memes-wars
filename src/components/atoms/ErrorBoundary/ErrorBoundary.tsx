import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Text } from '../Text';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  className?: string;
  testId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state when resetKeys change
    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (resetKey, idx) => prevProps.resetKeys?.[idx] !== resetKey
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to your error tracking service
    // like Sentry, Bugsnag, or similar
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'CardManagement',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.log('Would report error to service:', errorData);
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private copyErrorDetails = () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    const errorDetails = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    const errorText = JSON.stringify(errorDetails, null, 2);
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(errorText);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = errorText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = false, className = '', testId } = this.props;

    if (hasError) {
      // Custom fallback provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div 
          className={`error-boundary ${className}`.trim()} 
          data-testid={testId}
          role="alert"
        >
          <div className="error-boundary__content">
            <div className="error-boundary__icon">
              <Icon name="alert-triangle" size="2xl" color="error" />
            </div>
            
            <div className="error-boundary__message">
              <Text variant="h3" weight="semibold" color="error">
                Something went wrong
              </Text>
              <Text variant="body" color="muted" className="error-boundary__description">
                We're sorry, but something unexpected happened. You can try refreshing the page or going back.
              </Text>
            </div>

            <div className="error-boundary__actions">
              <Button variant="primary" onClick={this.handleRetry}>
                <Icon name="refresh-cw" size="sm" />
                Try Again
              </Button>
              
              <Button variant="secondary" onClick={this.handleReload}>
                <Icon name="rotate-ccw" size="sm" />
                Reload Page
              </Button>
              
              {showDetails && error && (
                <Button variant="ghost" onClick={this.copyErrorDetails}>
                  <Icon name="copy" size="sm" />
                  Copy Error Details
                </Button>
              )}
            </div>

            {showDetails && error && (
              <details className="error-boundary__details">
                <summary className="error-boundary__details-summary">
                  <Text variant="subtitle" weight="medium">
                    Technical Details
                  </Text>
                </summary>
                
                <div className="error-boundary__error-info">
                  <div className="error-boundary__error-section">
                    <Text variant="caption" weight="semibold" color="error">
                      Error Message:
                    </Text>
                    <Text variant="caption" className="error-boundary__error-text">
                      {error.message}
                    </Text>
                  </div>
                  
                  <div className="error-boundary__error-section">
                    <Text variant="caption" weight="semibold" color="error">
                      Error Type:
                    </Text>
                    <Text variant="caption" className="error-boundary__error-text">
                      {error.name}
                    </Text>
                  </div>
                  
                  {error.stack && (
                    <div className="error-boundary__error-section">
                      <Text variant="caption" weight="semibold" color="error">
                        Stack Trace:
                      </Text>
                      <pre className="error-boundary__stack-trace">
                        <code>{error.stack}</code>
                      </pre>
                    </div>
                  )}
                  
                  {errorInfo?.componentStack && (
                    <div className="error-boundary__error-section">
                      <Text variant="caption" weight="semibold" color="error">
                        Component Stack:
                      </Text>
                      <pre className="error-boundary__stack-trace">
                        <code>{errorInfo.componentStack}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  return React.useCallback((error: Error, errorInfo?: { componentStack?: string }) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // In a real app, report to error service
    if (process.env.NODE_ENV === 'production') {
      // Report error
    }
  }, []);
};

// Higher-order component version
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;