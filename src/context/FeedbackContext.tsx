/**
 * FeedbackContext
 * 
 * Global context for managing feedback modal state and operations
 * Allows any screen to open/close the feedback modal and submit feedback
 * 
 * Usage:
 * 1. Wrap app with FeedbackProvider
 * 2. Use useFeedback hook in any component to access context
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// ==================== TYPE DEFINITIONS ====================

interface FeedbackContextType {
  user: any | null;
  isAuthLoading: boolean;
  setUser: (user: any | null) => Promise<void>;

  /** Whether feedback modal is visible */
  isVisible: boolean;

  /** Open feedback modal */
  openFeedback: () => void;

  /** Close feedback modal */
  closeFeedback: () => void;

  /** User token for authenticated feedback submission */
  userToken: string | null;

  /** Set user token (called after login) */
  setUserToken: (token: string | null) => void;
}

// ==================== CONTEXT ====================

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'mad-pms-auth-user';

// ==================== PROVIDER COMPONENT ====================

/**
 * FeedbackProvider Component
 * Wraps the app to provide feedback context
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider wrapper
 */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  // ==================== STATE ====================

  /** Feedback modal visibility */
  const [isVisible, setIsVisible] = useState(false);

  /** User token for authenticated requests */
  const [userToken, setUserToken] = useState<string | null>(null);

  const [user, setStoredUser] = useState<any | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(USER_STORAGE_KEY)
      .then((savedUser) => {
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setStoredUser(parsedUser);
          setUserToken(parsedUser.token || null);
        }
      })
      .catch(() => AsyncStorage.removeItem(USER_STORAGE_KEY))
      .finally(() => setIsAuthLoading(false));
  }, []);

  // ==================== HANDLERS ====================

  const openFeedback = () => setIsVisible(true);
  const closeFeedback = () => setIsVisible(false);

  const setUser = async (nextUser: any | null) => {
    setStoredUser(nextUser);
    setUserToken(nextUser?.token || null);
    if (nextUser) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  // ==================== RENDER ====================

  return (
    <FeedbackContext.Provider
      value={{
        user,
        isAuthLoading,
        setUser,
        isVisible,
        openFeedback,
        closeFeedback,
        userToken,
        setUserToken,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

// ==================== HOOK ====================

/**
 * useFeedback Hook
 * Use this hook in any component to access feedback context
 * 
 * @throws {Error} If used outside FeedbackProvider
 * @returns {FeedbackContextType} Feedback context object
 * 
 * @example
 * const { openFeedback } = useFeedback();
 * <TouchableOpacity onPress={openFeedback}>
 *   <Text>Send Feedback</Text>
 * </TouchableOpacity>
 */
export function useFeedback(): FeedbackContextType {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
}
