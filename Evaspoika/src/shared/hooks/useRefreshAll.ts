import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRefreshAll() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh: invalidoi kaikki kyselyt
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries();
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  // Yhdistää operaation ja datan päivityksen — yksi tila molemmille
  const withRefresh = useCallback(
    async (fn: () => Promise<void>) => {
      setRefreshing(true);
      try {
        await fn();
        await queryClient.invalidateQueries();
      } finally {
        setRefreshing(false);
      }
    },
    [queryClient]
  );

  return { refreshing, onRefresh, withRefresh };
}
