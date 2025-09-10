/**
 * Error Boundary et composants de gestion d'erreurs
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

// === ERROR BOUNDARY ===

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number | boolean | null | undefined>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    eventId: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Met à jour l'état pour afficher l'UI de fallback au prochain rendu
    return { 
      hasError: true, 
      error,
      eventId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
  // errorInfo // Commented out to avoid unused variable warning
    });

    // Appeler le callback personnalisé si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Envoyer l'erreur à un service de monitoring (Sentry, LogRocket, etc.)
    this.reportError(error, errorInfo);
  }

  public override componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    // Reset automatique si les props changent
    if (hasError && prevProps.resetKeys !== resetKeys && resetKeys) {
      if (prevProps.resetKeys) {
        const hasResetKeyChanged = resetKeys.some((resetKey, idx) => {
          return resetKey !== prevProps.resetKeys![idx];
        });
        
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }
    
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  public override componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Ici on pourrait envoyer à Sentry, LogRocket, ou autre service
      if (import.meta.env.PROD) {
        // Service de monitoring en production
        console.log('Sending error to monitoring service:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          eventId: this.state.eventId,
        });
      }
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      // UI de fallback personnalisée
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de fallback par défaut
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          eventId={this.state.eventId}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

// === COMPOSANTS D'ERREUR ===

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
  onRetry?: () => void;
  onReload?: () => void;
}

function ErrorFallback({ 
  error, 
  // errorInfo, // Commented out to avoid unused variable warning
  eventId, 
  onRetry, 
  onReload 
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        {/* Titre */}
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Oups ! Une erreur est survenue
        </h1>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Nous sommes désolés, quelque chose s&apos;est mal passé. Veuillez réessayer.
        </p>

        {/* Actions */}
        <div className="space-y-3 mb-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Réessayer
            </button>
          )}
          
          {onReload && (
            <button
              onClick={onReload}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Recharger la page
            </button>
          )}
        </div>

        {/* Détails techniques */}
        {error && import.meta.env.DEV && (
          <div className="text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2"
            >
              {showDetails ? 'Masquer' : 'Afficher'} les détails techniques
            </button>

            {showDetails && (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4 text-xs text-left overflow-auto max-h-40">
                <div className="mb-2">
                  <strong className="text-red-600 dark:text-red-400">Erreur:</strong>
                  <pre className="mt-1 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {error.message}
                  </pre>
                </div>
                
                {error.stack && (
                  <div className="mb-2">
                    <strong className="text-red-600 dark:text-red-400">Stack:</strong>
                    <pre className="mt-1 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                )}

                {eventId && (
                  <div className="text-gray-500 dark:text-gray-500 text-xs">
                    ID: {eventId}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// === COMPOSANTS D'ERREUR SPÉCIFIQUES ===

export function NetworkError({ 
  onRetry, 
  message = 'Problème de connexion réseau' 
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
        <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Connexion interrompue
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
}

export function NotFoundError({ 
  title = 'Contenu introuvable',
  message = 'Le contenu que vous recherchez n\'existe pas ou a été supprimé.',
  onGoBack
}: {
  title?: string;
  message?: string;
  onGoBack?: () => void;
}) {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700">
        <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-6h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Retour
          </button>
        )}
      </div>
    </div>
  );
}

export function AuthError({ 
  onLogin,
  message = 'Vous devez être connecté pour accéder à cette fonctionnalité.'
}: {
  onLogin?: () => void;
  message?: string;
}) {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20">
        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Connexion requise
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>
        
        {onLogin && (
          <button
            onClick={onLogin}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Se connecter
          </button>
        )}
      </div>
    </div>
  );
}

export function ServerError({ 
  onRetry,
  message = 'Le serveur rencontre des difficultés. Veuillez réessayer dans quelques instants.'
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
        <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Erreur serveur
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
}

// === HOOK UTILITAIRE ===

export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error | string) => {
    if (typeof error === 'string') {
      setError(new Error(error));
    } else {
      setError(error);
    }
  }, []);

  return {
    error,
    handleError,
    resetError,
    hasError: error !== null,
  };
}

export default ErrorBoundary;
