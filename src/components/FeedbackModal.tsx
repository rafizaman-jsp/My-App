/**
 * FeedbackModal Component
 * 
 * Reusable modal for submitting feedback and reviews
 * Can be opened from any screen using the useFeedback hook
 * 
 * Features:
 * - Star rating system (1-5 stars)
 * - Text feedback/review input
 * - User authentication with token
 * - Loading and error states
 * - Success confirmation
 * 
 * @component
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFeedback } from '../context/FeedbackContext';

// ==================== CONSTANTS ====================

const API_PORT = 8080;
const ANDROID_LOCAL_IP = '10.0.4.12';
const LOCALHOST = 'http://localhost';

/**
 * Determines API base URL based on platform and environment
 */
const getApiBaseUrl = () => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');
  if (Platform.OS === 'android') return `http://${ANDROID_LOCAL_IP}:${API_PORT}`;
  return `${LOCALHOST}:${API_PORT}`;
};

const API_BASE_URL = getApiBaseUrl();

// ==================== COMPONENT ====================

export default function FeedbackModal() {
  // ==================== HOOKS ====================

  const { isVisible, closeFeedback, userToken } = useFeedback();

  // ==================== STATE ====================

  /** Star rating (1-5) */
  const [rating, setRating] = useState(0);

  /** Feedback text message */
  const [message, setMessage] = useState('');

  /** Loading state while submitting */
  const [loading, setLoading] = useState(false);

  // ==================== HANDLERS ====================

  /**
   * Submits feedback to backend
   */
  const handleSubmitFeedback = async () => {
    // Validate input
    if (!message.trim()) {
      Alert.alert('Validation', 'Please enter your feedback or review.');
      return;
    }

    if (!userToken) {
      Alert.alert('Error', 'Please login first to submit feedback.');
      closeFeedback();
      return;
    }

    setLoading(true);

    try {
      // Build feedback message with rating if provided
      const feedbackText = rating > 0 
        ? `[${rating}⭐] ${message}` 
        : message;

      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: userToken,
          message: feedbackText,
        }).toString(),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        Alert.alert('Error', result.message || 'Unable to submit feedback.');
        return;
      }

      // Success
      Alert.alert('Success', 'Thank you! Your feedback has been submitted.', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setMessage('');
            setRating(0);
            closeFeedback();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Connection Error',
        `Cannot reach the server at ${API_BASE_URL}`
      );
      console.error('Feedback error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMessage('');
      setRating(0);
      closeFeedback();
    }
  };

  // ==================== RENDER ====================

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      {/* ===== OVERLAY ===== */}
      <View style={styles.overlay}>
        {/* ===== MODAL CONTAINER ===== */}
        <View style={styles.modalContainer}>
          {/* ===== HEADER ===== */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Share Your Feedback</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={loading}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ===== CONTENT ===== */}
          <View style={styles.content}>
            {/* Star Rating Section */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>How would you rate us?</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    disabled={loading}
                    style={styles.starButton}
                  >
                    <Text
                      style={[
                        styles.star,
                        star <= rating ? styles.starFilled : styles.starEmpty,
                      ]}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </Text>
              )}
            </View>

            {/* Feedback Text Section */}
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>Your Feedback / Review</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Share your experience, suggestions, or compliments..."
                placeholderTextColor="#999"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                editable={!loading}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {message.length} / 500 characters
              </Text>
            </View>

            {/* Info Message */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Your honest feedback helps us improve our services. Thank you!
              </Text>
            </View>
          </View>

          {/* ===== FOOTER ===== */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmitFeedback}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Send Feedback</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '90%',
    maxWidth: 450,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  // ===== HEADER =====

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },

  closeButton: {
    padding: 8,
  },

  closeButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },

  // ===== CONTENT =====

  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    maxHeight: '70%',
  },

  // Rating Section
  ratingSection: {
    marginBottom: 24,
    alignItems: 'center',
  },

  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },

  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },

  starButton: {
    padding: 8,
  },

  star: {
    fontSize: 36,
  },

  starFilled: {
    color: '#FFB800',
  },

  starEmpty: {
    color: '#ddd',
  },

  ratingText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#FFB800',
  },

  // Feedback Section
  feedbackSection: {
    marginBottom: 16,
  },

  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
    minHeight: 100,
  },

  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 6,
  },

  // Info Box
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#1565C0',
    padding: 12,
    borderRadius: 6,
  },

  infoText: {
    fontSize: 12,
    color: '#1565C0',
    fontWeight: '500',
  },

  // ===== FOOTER =====

  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  submitButton: {
    backgroundColor: '#4CAF50',
  },

  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },

  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
