import {
  API_BASE_URL,
  API_READ_TOKEN,
  API_WRITE_TOKEN,
  NETVISOR_READ_TOKEN,
  NETVISOR_WRITE_TOKEN,
} from '@/src/config/env';
import { ApiError } from './error';

export type QueryParamPrimitive = string | number | boolean;
export type QueryParamValue =
  | QueryParamPrimitive
  | QueryParamPrimitive[]
  | null
  | undefined;
export type QueryParams = Record<string, QueryParamValue>;
export type ApiAuthScope = 'apiRead' | 'apiWrite' | 'netvisorRead' | 'netvisorWrite';

export type ApiRequestOptions = RequestInit & {
  query?: QueryParams;
  auth?: ApiAuthScope | false | { token: string };
  signal?: AbortSignal;
};

const resolveDefaultAuthScope = (method?: string): ApiAuthScope => {
  const normalizedMethod = String(method ?? 'GET').toUpperCase();
  return normalizedMethod === 'GET' || normalizedMethod === 'HEAD'
    ? 'apiRead'
    : 'apiWrite';
};

const resolveAuthToken = (auth: ApiRequestOptions['auth'], method?: string) => {
  if (auth === false) return undefined;

  if (auth && typeof auth === 'object' && 'token' in auth) {
    return auth.token.trim() || undefined;
  }

  const scope = auth ?? resolveDefaultAuthScope(method);
  switch (scope) {
    case 'apiRead':
      return API_READ_TOKEN || API_WRITE_TOKEN || undefined;
    case 'apiWrite':
      return API_WRITE_TOKEN || undefined;
    case 'netvisorRead':
      return NETVISOR_READ_TOKEN || NETVISOR_WRITE_TOKEN || undefined;
    case 'netvisorWrite':
      return NETVISOR_WRITE_TOKEN || undefined;
    default:
      return undefined;
  }
};

const appendQueryParams = (path: string, query?: QueryParams) => {
  if (!query) return `${API_BASE_URL}${path}`;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;
    const normalizedValue = Array.isArray(value)
      ? value
          .map((item) => (typeof item === 'boolean' ? (item ? '1' : '0') : String(item)))
          .join(',')
      : typeof value === 'boolean'
        ? value ? '1' : '0'
        : String(value);
    params.set(key, normalizedValue);
  }

  const queryString = params.toString();
  return queryString ? `${API_BASE_URL}${path}?${queryString}` : `${API_BASE_URL}${path}`;
};

const parseResponseBody = (text: string) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const REQUEST_TIMEOUT_MS = 30_000;

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { query, auth, signal: callerSignal, ...requestOptions } = options;
  const url = appendQueryParams(path, query);
  const method = String(requestOptions.method ?? 'GET').toUpperCase();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  if (callerSignal) {
    callerSignal.addEventListener('abort', () => controller.abort());
  }
  const { signal } = controller;

  const headers = new Headers(requestOptions.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (requestOptions.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = resolveAuthToken(auth, method);
  if (token && !headers.has('Authorization') && !headers.has('X-API-Key')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    console.log('[API] -->', method, url);
    const response = await fetch(url, { ...requestOptions, headers, signal });

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    const data = parseResponseBody(text);

    if (!response.ok) {
      console.error('[API] ERR', response.status, url, data ?? text);
      throw new ApiError(response.status, data ?? text);
    }

    console.log('[API] OK', response.status, url);
    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error('[API] FAIL', url, String(err));
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
