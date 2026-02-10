import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (extra.apiBaseUrl as string | undefined) ??
  'http://localhost:3000/api';
