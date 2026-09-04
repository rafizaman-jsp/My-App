/**
 * AuthContext
 *
 * Stores the authenticated user and token for the application.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';

interface AuthContextType {
  user: any | null;
  isAuthLoading: boolean;
  setUser: (user: any | null) => Promise<void>;
  userToken: string | null;
  setUserToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'mad-pms-auth-user';

const getWebUser = () => Platform.OS === 'web' && typeof window !== 'undefined'
  ? window.localStorage.getItem(USER_STORAGE_KEY)
  : null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setStoredUser] = useState<any | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(USER_STORAGE_KEY)
      .then((savedUser) => {
        const parsedUser = JSON.parse(savedUser || getWebUser() || 'null');
        if (parsedUser) {
          setStoredUser(parsedUser);
          setUserToken(parsedUser.token || null);
        }
      })
      .catch(() => {
        const parsedUser = JSON.parse(getWebUser() || 'null');
        if (parsedUser) {
          setStoredUser(parsedUser);
          setUserToken(parsedUser.token || null);
        }
      })
      .finally(() => setIsAuthLoading(false));
  }, []);

  const setUser = async (nextUser: any | null) => {
    setStoredUser(nextUser);
    setUserToken(nextUser?.token || null);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (nextUser) window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
      else window.localStorage.removeItem(USER_STORAGE_KEY);
    }

    if (nextUser) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, setUser, userToken, setUserToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
