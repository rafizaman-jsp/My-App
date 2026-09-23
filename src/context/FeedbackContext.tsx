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

import React, { createContext, useContext, useState, ReactNode } from 'react';

// ==================== TYPE DEFINITIONS ====================

interface FeedbackContextType {
  /** Whether feedback modal is visible */
  isVisible: boolean;

  /** Open feedback modal */
  openFeedback: () => void;

  /** Close feedback modal */
  closeFeedback: () => void;

}

// ==================== CONTEXT ====================

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

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

  // ==================== HANDLERS ====================

  const openFeedback = () => setIsVisible(true);
  const closeFeedback = () => setIsVisible(false);

  // ==================== RENDER ====================

  return (
    <FeedbackContext.Provider
      value={{
        isVisible,
        openFeedback,
        closeFeedback,
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
