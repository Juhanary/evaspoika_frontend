import { QueryParams, apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { NetvisorResponseEnvelope, NetvisorResponsePayload } from '../domain/types';

export function fetchNetvisorResource<TResponse = NetvisorResponsePayload>(
  path: string,
  query?: QueryParams
) {
  return apiRequest<NetvisorResponseEnvelope<TResponse>>(`${endpoints.netvisor}${path}`, {
    auth: 'netvisorRead',
    query,
  });
}

export function postNetvisorXml<TResponse = NetvisorResponsePayload>(
  path: string,
  xmlBody: string
) {
  return apiRequest<NetvisorResponseEnvelope<TResponse>>(`${endpoints.netvisor}${path}`, {
    method: 'POST',
    auth: 'netvisorWrite',
    body: xmlBody,
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

export function putNetvisorXml<TResponse = NetvisorResponsePayload>(
  path: string,
  xmlBody: string
) {
  return apiRequest<NetvisorResponseEnvelope<TResponse>>(`${endpoints.netvisor}${path}`, {
    method: 'PUT',
    auth: 'netvisorWrite',
    body: xmlBody,
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
