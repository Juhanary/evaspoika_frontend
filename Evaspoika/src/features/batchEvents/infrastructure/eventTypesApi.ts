import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { EventType } from '../domain/types';

export function fetchEventTypes() {
  return apiRequest<EventType[]>(endpoints.eventTypes);
}
