import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  clearSplitDraft,
  readSplitDraft,
  writeSplitDraft,
  type SplitDraft,
} from '../../domain/splitDraft';

// Luonnos elää react-queryn välimuistissa ja AsyncStoragessa yhtä aikaa: cache
// pitää jakonäytön ja joka näytöllä näkyvän muistutuspalkin samassa tilassa,
// AsyncStorage säilyttää sen sovelluksen käynnistysten yli.
export const SPLIT_DRAFT_QUERY_KEY = ['splitDraft'] as const;

export function useSplitDraft() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: SPLIT_DRAFT_QUERY_KEY,
    queryFn: readSplitDraft,
    staleTime: Infinity,
  });

  const save = useCallback(
    async (draft: SplitDraft) => {
      await writeSplitDraft(draft);
      queryClient.setQueryData(SPLIT_DRAFT_QUERY_KEY, draft);
    },
    [queryClient],
  );

  const clear = useCallback(async () => {
    await clearSplitDraft();
    queryClient.setQueryData(SPLIT_DRAFT_QUERY_KEY, null);
  }, [queryClient]);

  return { draft: data ?? null, loading: isLoading, save, clear };
}
