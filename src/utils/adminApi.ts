import { Platform } from 'react-native';

const API_PORT = 8080;
const ANDROID_LOCAL_IP = '192.168.0.106';
const API_HOST = 'http://localhost';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '') ||
  (Platform.OS === 'android' ? `http://${ANDROID_LOCAL_IP}:${API_PORT}` : `${API_HOST}:${API_PORT}`);

export async function adminRequest(path: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const result = await response.json();
  return { response, result };
}
