import React from 'react';
import { AppState } from 'react-native';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/src/infrastructure/api/error';

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15_000),
      staleTime: 10_000,
      refetchOnWindowFocus: true,
    },
  },
});

type Props = { children: React.ReactNode };

export function QueryProvider({ children }: Props) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
