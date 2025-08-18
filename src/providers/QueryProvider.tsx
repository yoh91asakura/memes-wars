/**
 * Provider React Query pour la gestion du cache et des requêtes
 */

import { QueryClient, QueryClientProvider, DefaultOptions } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

// Configuration par défaut des requêtes
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Cache pendant 5 minutes
    staleTime: 5 * 60 * 1000,
    // Garde en mémoire 10 minutes
    gcTime: 10 * 60 * 1000, // was cacheTime in v4
    // 3 tentatives de retry avec backoff exponentiel
    retry: (failureCount, error: any) => {
      // Ne pas retry sur les erreurs d'auth
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch au focus de la fenêtre
    refetchOnWindowFocus: true,
    // Refetch sur reconnexion réseau
    refetchOnReconnect: true,
    // Ne pas refetch au mount si les données sont fraîches
    refetchOnMount: true,
  },
  mutations: {
    // 2 tentatives pour les mutations
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },
};

// Configuration spéciale pour différents types de données
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
    // logger removed in v5, use devtools instead
  });
};

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Créer une instance par composant pour éviter les fuites mémoire
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools seulement en développement */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position={'bottom-right' as any} // Type assertion for position
        />
      )}
    </QueryClientProvider>
  );
}

// Hook pour accéder au query client dans les composants
export { useQueryClient } from '@tanstack/react-query';

// Types utiles pour les développeurs
export type { 
  UseQueryResult, 
  UseMutationResult,
  QueryKey,
  MutationKey
} from '@tanstack/react-query';
