import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFeedback } from '../../context/FeedbackContext';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../utils/appAlert';

const API_PORT = 8080;
const ANDROID_LOCAL_IP = '192.168.0.106';
const LOCALHOST = 'http://localhost';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '') ||
  (Platform.OS === 'android' ? `http://${ANDROID_LOCAL_IP}:${API_PORT}` : `${LOCALHOST}:${API_PORT}`);

export default function ChangePasswordScreen({ navigation }: { navigation: any }) {
  const { user, userToken, isAuthLoading } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && (!user?.token || !user?.userId)) {
      navigation.replace('LoginScreen');
    }
  }, [isAuthLoading, user?.token, user?.userId]);

  const changePassword = async () => {
    if (!userToken || !user) {
      Alert.alert('Login required', 'Please log in again before changing your password.');
      navigation.replace('LoginScreen');
      return;
    }
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Validation', 'Complete all password fields.');
      return;
    }
    if (newPassword.length < 4) {
      Alert.alert('Validation', 'The new password must contain at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation', 'The new passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: userToken,
          oldPassword,
          newPassword,
          confirmPassword,
        }).toString(),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        Alert.alert('Update failed', result.message || 'Unable to change password.');
        return;
      }
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Your password has been updated.');
    } catch {
      Alert.alert('Connection error', `Cannot reach the server at ${API_BASE_URL}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.title}>Change Password</Text>
        <TextInput style={styles.input} placeholder="Current password" secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
        <TextInput style={styles.input} placeholder="New password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
        <TextInput style={styles.input} placeholder="Confirm new password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        <TouchableOpacity style={[styles.primaryButton, saving && styles.disabled]} onPress={changePassword} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Update Password</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()} disabled={saving}>
          <Text style={styles.secondaryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#F5F7FA' },
  form: { width: '100%', maxWidth: 420, alignSelf: 'center', marginTop: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#123B5D', marginBottom: 24 },
  input: { height: 52, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 14, marginBottom: 14 },
  primaryButton: { backgroundColor: '#1565C0', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.6 },
  primaryText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { padding: 14, alignItems: 'center', marginTop: 10 },
  secondaryText: { color: '#1565C0', fontWeight: '600' },
});
