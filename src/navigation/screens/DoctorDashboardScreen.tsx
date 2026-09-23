import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFeedback } from '../../context/FeedbackContext';
import { useAuth } from '../../context/AuthContext';
import { confirmAction } from '../../utils/confirmAction';
import { Alert } from '../../utils/appAlert';

const API_PORT = 8080;
const ANDROID_LOCAL_IP = '192.168.0.106';
const LOCALHOST = 'http://localhost';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '') ||
  (Platform.OS === 'android' ? `http://${ANDROID_LOCAL_IP}:${API_PORT}` : `${LOCALHOST}:${API_PORT}`);

interface DoctorAppointment {
  appointmentId: number;
  patientName: string;
  phone?: string;
  email?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
}

export default function DoctorDashboardScreen({ navigation }: { navigation: any }) {
  const { user, setUser, isAuthLoading } = useAuth();
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadAppointments = async () => {
    if (!user?.token) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor-appointments`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.message || 'Unable to load appointments.');
        return;
      }
      setAppointments(result.appointments || []);
    } catch {
      setError(`Cannot reach the server at ${API_BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user?.token || !user?.userId) {
      navigation.replace('LoginScreen');
      return;
    }
    if (user && user.role !== 'doctor') {
      navigation.replace(user.role === 'patient' ? 'PatientProfile' : 'AdminDashboard');
      return;
    }
    loadAppointments();
  }, [isAuthLoading, user?.token, user?.userId, user?.role]);

  const updateStatus = async (appointmentId: number, action: 'complete' | 'cancel') => {
    if (!user?.token) return;
    if (action === 'cancel' && !await confirmAction('Cancel appointment', 'Are you sure you want to cancel this appointment?')) return;
    setUpdatingId(appointmentId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor-appointments/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: user.token, appointmentId: String(appointmentId) }).toString(),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        Alert.alert('Update failed', result.message || 'Unable to update appointment.');
        return;
      }
      await loadAppointments();
    } catch {
      Alert.alert('Connection error', `Cannot reach the server at ${API_BASE_URL}.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const logout = async () => {
    if (!await confirmAction('Log out', 'Are you sure you want to log out?')) return;
    await setUser(null);
    navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
  };

  if (!user) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Doctor Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, {user.name}</Text>

      <View style={styles.accountCard}>
        <Text style={styles.cardTitle}>Your Appointments</Text>
        {loading ? <ActivityIndicator color="#1565C0" /> : error ? (
          <View><Text style={styles.error}>{error}</Text><TouchableOpacity onPress={loadAppointments}><Text style={styles.link}>Retry</Text></TouchableOpacity></View>
        ) : appointments.length === 0 ? (
          <Text style={styles.empty}>No appointments assigned.</Text>
        ) : appointments.map((appointment) => {
          const status = appointment.status?.toUpperCase();
          const active = !['COMPLETED', 'CANCELLED'].includes(status);
          return (
            <View style={styles.appointment} key={appointment.appointmentId}>
              <View style={styles.appointmentHeader}>
                <Text style={styles.patientName}>{appointment.patientName}</Text>
                <Text style={[styles.status, status === 'COMPLETED' ? styles.completed : status === 'CANCELLED' ? styles.cancelled : styles.booked]}>{status}</Text>
              </View>
              <Text style={styles.detail}>Date: {appointment.appointmentDate} at {appointment.appointmentTime}</Text>
              {appointment.phone ? <Text style={styles.detail}>Phone: {appointment.phone}</Text> : null}
              {appointment.email ? <Text style={styles.detail}>Email: {appointment.email}</Text> : null}
              {active ? (
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.completeButton} disabled={updatingId === appointment.appointmentId} onPress={() => updateStatus(appointment.appointmentId, 'complete')}>
                    <Text style={styles.actionText}>Mark Done</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} disabled={updatingId === appointment.appointmentId} onPress={() => updateStatus(appointment.appointmentId, 'cancel')}>
                    <Text style={styles.actionText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          );
        })}
        <TouchableOpacity style={styles.refreshButton} onPress={loadAppointments} disabled={loading}>
          <Text style={styles.refreshText}>Refresh Appointments</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ChangePassword')}>
        <Text style={styles.primaryText}>Change Password</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.primaryText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F5F7FA' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#123B5D' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 6, marginBottom: 20 },
  accountCard: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1565C0', marginBottom: 16 },
  appointment: { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingVertical: 15 },
  appointmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  patientName: { flex: 1, fontSize: 17, fontWeight: 'bold', color: '#123B5D' },
  status: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  booked: { backgroundColor: '#F59E0B' },
  completed: { backgroundColor: '#2196F3' },
  cancelled: { backgroundColor: '#B00020' },
  detail: { color: '#475569', fontSize: 14, lineHeight: 21, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  completeButton: { flex: 1, backgroundColor: '#16A34A', padding: 11, borderRadius: 6, alignItems: 'center' },
  cancelButton: { flex: 1, backgroundColor: '#B00020', padding: 11, borderRadius: 6, alignItems: 'center' },
  actionText: { color: '#FFFFFF', fontWeight: 'bold' },
  refreshButton: { borderWidth: 1, borderColor: '#1565C0', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 16 },
  refreshText: { color: '#1565C0', fontWeight: 'bold' },
  empty: { color: '#64748B', paddingVertical: 18 },
  error: { color: '#B00020', lineHeight: 20 },
  link: { color: '#1565C0', fontWeight: 'bold', marginTop: 8 },
  primaryButton: { backgroundColor: '#1565C0', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  primaryText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  logoutButton: { backgroundColor: '#B00020', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
});
