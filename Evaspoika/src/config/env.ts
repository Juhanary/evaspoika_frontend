const normalizeApiBaseUrl = (value: string) => value.replace(/\/+$/, '');

const requireEnv = (value: string | undefined, key: string): string => {
  const trimmed = value?.trim();
  if (!trimmed) throw new Error(`${key} is not set`);
  return trimmed;
};

const optionalEnv = (value: string | undefined): string => value?.trim() ?? '';

export const API_BASE_URL = normalizeApiBaseUrl(
  requireEnv(process.env.EXPO_PUBLIC_API_BASE_URL, 'EXPO_PUBLIC_API_BASE_URL')
);
export const API_READ_TOKEN = optionalEnv(process.env.EXPO_PUBLIC_API_READ_TOKEN);
export const API_WRITE_TOKEN = optionalEnv(process.env.EXPO_PUBLIC_API_WRITE_TOKEN);
export const NETVISOR_READ_TOKEN = optionalEnv(process.env.EXPO_PUBLIC_NETVISOR_READ_TOKEN);
export const NETVISOR_WRITE_TOKEN = optionalEnv(process.env.EXPO_PUBLIC_NETVISOR_WRITE_TOKEN);
