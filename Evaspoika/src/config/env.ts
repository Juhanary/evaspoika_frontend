import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

const resolveString = (...values: (string | undefined | null)[]) =>
  values.find((value) => typeof value === 'string' && value.trim().length > 0)?.trim();

const getExtraString = (key: string) => {
  const value = extra[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
};

export const API_BASE_URL =
  resolveString(process.env.EXPO_PUBLIC_API_BASE_URL, getExtraString('apiBaseUrl')) ??
  'http://localhost:3000/api';

export const API_TOKEN = resolveString(
  process.env.EXPO_PUBLIC_API_TOKEN,
  getExtraString('apiToken')
);

export const API_READ_TOKEN = resolveString(
  process.env.EXPO_PUBLIC_API_READ_TOKEN,
  getExtraString('apiReadToken')
);

export const API_WRITE_TOKEN = resolveString(
  process.env.EXPO_PUBLIC_API_WRITE_TOKEN,
  getExtraString('apiWriteToken')
);

export const NETVISOR_READ_TOKEN = resolveString(
  process.env.EXPO_PUBLIC_NETVISOR_READ_TOKEN,
  getExtraString('netvisorReadToken')
);

export const NETVISOR_WRITE_TOKEN = resolveString(
  process.env.EXPO_PUBLIC_NETVISOR_WRITE_TOKEN,
  getExtraString('netvisorWriteToken')
);
