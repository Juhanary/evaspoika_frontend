import { useQuery } from '@tanstack/react-query';
import { fetchCodeTrace, fetchTraceCustomers } from '../../infrastructure/traceApi';

// Jäljitys katsoo menneisyyteen, joten kyselyitä ei pollata. Data haetaan kun
// näyttö avataan ja pidetään tuoreena puoli minuuttia.
const TRACE_STALE_MS = 30_000;

export function useTraceCustomers(search?: string) {
  return useQuery({
    queryKey: ['trace', 'customers', search?.trim() ?? ''],
    queryFn: () => fetchTraceCustomers(search),
    staleTime: TRACE_STALE_MS,
  });
}

export function useCodeTrace(code?: string) {
  const trimmed = code?.trim() ?? '';

  return useQuery({
    queryKey: ['trace', 'code', trimmed],
    queryFn: () => fetchCodeTrace(trimmed),
    enabled: trimmed.length > 0,
    staleTime: TRACE_STALE_MS,
    // Tuntematon koodi on normaali tulos näppäillessä, ei verkkovirhe — ei
    // yritetä uudelleen jotta "ei löydy" näkyy heti.
    retry: false,
  });
}
