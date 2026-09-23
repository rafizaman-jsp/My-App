import { Platform } from 'react-native';

const API_PORT = 8080;
const ANDROID_LOCAL_IP = '192.168.0.106';
const LOCALHOST = 'http://localhost';

// Keep the environment URL as the first choice for tunnels and physical devices.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '') ||
  (Platform.OS === 'android' ? `http://${ANDROID_LOCAL_IP}:${API_PORT}` : `${LOCALHOST}:${API_PORT}`);
