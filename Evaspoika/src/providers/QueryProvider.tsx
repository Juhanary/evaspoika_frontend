import React from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { focusManager, QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ApiError } from '@/src/infrastructure/api/error';
import { isBackendQueryKey } from '@/src/shared/constants/queryKeys';

focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener('change', (state) => {
    handleFocus(state === 'active');
  });
  return () => sub.remove();
});

const MAX_RETRIES = 3;

// Retrying a 4xx never succeeds — the request is wrong, not the connection.
// Retrying them multiplied every bad token or renamed endpoint by four and
// delayed the error the operator sees by the full backoff.
const shouldRetry = (failureCount: number, error: unknown) => {
  if (failureCount >= MAX_RETRIES) return false;
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return true;
};

// Välimuisti kirjoitetaan levylle, jotta puhelimella näkee viimeksi haetun
// tilanteen myös varaston wifin ulkopuolella. gcTimen on oltava vähintään yhtä
// pitkä kuin persisterin maxAge: React Query palauttaa levyltä vain ne kyselyt
// joita se ei ole jo kerännyt roskiin, joten lyhyempi gcTime tyhjentäisi
// näkymän juuri silloin kun sitä eniten tarvitaan.
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15_000),
      staleTime: 10_000,
      gcTime: CACHE_MAX_AGE,
      refetchOnWindowFocus: true,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'EVASPOIKA_QUERY_CACHE',
  throttleTime: 2_000,
});

type Props = { children: React.ReactNode };

export function QueryProvider({ children }: Props) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: CACHE_MAX_AGE,
        dehydrateOptions: {
          // Sama rajaus kuin yhteystilan päättelyssä, ks. queryKeys.ts.
          shouldDehydrateQuery: (query) =>
            query.state.status === 'success' && isBackendQueryKey(query.queryKey),
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
