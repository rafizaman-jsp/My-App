import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../utils/appAlert';
import { adminRequest, API_BASE_URL } from '../../utils/adminApi';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  age: number;
  gender: string;
  contact: string;
  email: string;
  startTime: string;
  finishTime: string;
  fees: number | null;
}

export default function AdminDoctorsScreen({ navigation }: { navigation: any }) {
  const { user, isAuthLoading, setUser } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDoctors = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const { response, result } = await adminRequest('/api/admin-doctors', user.token);
      if (response.status === 401) {
        await setUser(null);
        navigation.replace('LoginScreen');
        return;
      }
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load doctors.');
      setDoctors(result.doctors || []);
    } catch (error: any) {
      Alert.alert('Doctors error', error.message || `Cannot reach ${API_BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  }, [navigation, setUser, user?.token]);

  useEffect(() => {
    if (!isAuthLoading && (!user?.token || user.role !== 'admin')) {
      navigation.replace('LoginScreen');
    }
  }, [isAuthLoading, navigation, user?.role, user?.token]);

  // Reload after returning from either the add or edit screen.
  useFocusEffect(useCallback(() => {
    if (!isAuthLoading && user?.token && user.role === 'admin') loadDoctors();
  }, [isAuthLoading, loadDoctors, user?.role, user?.token]));

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#1565C0" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Doctors</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AdminAddDoctor')}>
          <Text style={styles.addButtonText}>Add Doctor</Text>
        </TouchableOpacity>
      </View>

      {doctors.length === 0 ? <Text style={styles.empty}>No doctors found.</Text> : doctors.map((doctor) => (
        <View style={styles.row} key={doctor.id}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{doctor.name}</Text>
            <Text style={styles.detail}>{doctor.specialization} | {doctor.email}</Text>
            <Text style={styles.detail}>{doctor.startTime} - {doctor.finishTime} | {doctor.contact}</Text>
            <Text style={styles.detail}>Fees: {doctor.fees == null ? 'Not set' : doctor.fees}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AdminEditDoctor', { doctor })}>
            <Text style={styles.link}>Edit</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F5F7FA' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#123B5D' },
  addButton: { backgroundColor: '#1565C0', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 7 },
  addButtonText: { color: '#FFF', fontWeight: 'bold' },
  row: { flexDirection: 'row', backgroundColor: '#FFF', padding: 14, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  rowText: { flex: 1 },
  rowTitle: { fontWeight: 'bold', color: '#123B5D' },
  detail: { color: '#64748B', marginTop: 4 },
  link: { color: '#1565C0', fontWeight: 'bold', padding: 8 },
  empty: { color: '#64748B', textAlign: 'center', marginTop: 30 },
});
