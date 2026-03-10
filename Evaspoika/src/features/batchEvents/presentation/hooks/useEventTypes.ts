import { useQuery } from '@tanstack/react-query';
import { fetchEventTypes } from '../../infrastructure/eventTypesApi';

export function useEventTypes() {
  return useQuery({
    queryKey: ['eventTypes'],
    queryFn: fetchEventTypes,
  });
}
