import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@evaspoika/settings';

export interface AppSettings {
  apiBaseUrl: string;
  apiReadToken: string;
  apiWriteToken: string;
  netvisorReadToken: string;
  netvisorWriteToken: string;
}

const DEFAULTS: AppSettings = {
  apiBaseUrl: 'https://127.0.1.1:3000/api',
  apiReadToken: process.env.EXPO_PUBLIC_API_READ_TOKEN ?? '',
  apiWriteToken: process.env.EXPO_PUBLIC_API_WRITE_TOKEN ?? '',
  netvisorReadToken: process.env.EXPO_PUBLIC_NETVISOR_READ_TOKEN ?? '',
  netvisorWriteToken: process.env.EXPO_PUBLIC_NETVISOR_WRITE_TOKEN ?? '',
};

let cache: AppSettings = { ...DEFAULTS };

export const loadSettings = async (): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as Partial<AppSettings>;
      cache = { ...DEFAULTS, ...stored };
    }
  } catch {
    // keep defaults on read failure
  }
};

export const getSettings = (): AppSettings => cache;

export const saveSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  cache = { ...cache, ...settings };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
};
