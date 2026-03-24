import React from 'react';
import { AppState } from 'react-native';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Kerro TanStack Querylle että "focus" = app tulee etualalle
focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener('change', (state) => {
    handleFocus(state === 'active');
  });
  return () => sub.remove();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
      refetchOnWindowFocus: true, // toimii AppState-handlerin ansiosta
    },
  },
});

type Props = { children: React.ReactNode };

export function QueryProvider({ children }: Props) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
