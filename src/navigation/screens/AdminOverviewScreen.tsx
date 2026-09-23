import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../utils/appAlert';
import { adminRequest } from '../../utils/adminApi';

export default function AdminOverviewScreen({ navigation }: { navigation: any }) {
  const { user, isAuthLoading, setUser } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  useEffect(() => {
    if (isAuthLoading) return;
    if (!user?.token || user.role !== 'admin') { navigation.replace('LoginScreen'); return; }
    adminRequest('/api/admin-summary', user.token).then(async ({ response, result }) => {
      if (response.status === 401) { await setUser(null); navigation.replace('LoginScreen'); return; }
      if (!response.ok || !result.success) Alert.alert('Dashboard error', result.message || 'Unable to load dashboard.'); else setSummary(result);
    }).catch(() => Alert.alert('Connection error', 'Unable to load dashboard.'));
  }, [isAuthLoading, user?.token, user?.role]);
  if (isAuthLoading || !user) return <ActivityIndicator size="large" color="#1565C0" />;
  const cards = summary ? [['Doctors', summary.doctors], ['Patients', summary.patients], ['Appointments', summary.appointments], ['Completed', summary.completed], ['Cancelled', summary.cancelled], ['Feedback', summary.feedback]] : [];
  return <ScrollView contentContainerStyle={styles.container}><Text style={styles.title}>Admin Dashboard</Text><Text style={styles.subtitle}>Welcome, {user.name}</Text>{summary ? <View style={styles.metrics}>{cards.map(([label, value]) => <View style={styles.metric} key={String(label)}><Text style={styles.value}>{value}</Text><Text>{label}</Text></View>)}</View> : <ActivityIndicator size="large" color="#1565C0" />}<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminDoctors')}><Text style={styles.buttonText}>Manage Doctors</Text></TouchableOpacity><TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminAddAdmin')}><Text style={styles.buttonText}>Add Administrator</Text></TouchableOpacity><TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminRecords', { type: 'patients' })}><Text style={styles.buttonText}>View Patients</Text></TouchableOpacity><TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminRecords', { type: 'appointments' })}><Text style={styles.buttonText}>View Appointments</Text></TouchableOpacity><TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminRecords', { type: 'feedback' })}><Text style={styles.buttonText}>View Feedback</Text></TouchableOpacity></ScrollView>;
}
const styles = StyleSheet.create({ container: { flexGrow: 1, padding: 20, backgroundColor: '#F5F7FA' }, title: { fontSize: 28, fontWeight: 'bold', color: '#123B5D' }, subtitle: { color: '#64748B', marginVertical: 8 }, metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 18 }, metric: { width: '31%', minWidth: 90, padding: 14, backgroundColor: '#FFF', alignItems: 'center', borderRadius: 8 }, value: { fontSize: 24, fontWeight: 'bold', color: '#1565C0' }, button: { backgroundColor: '#1565C0', padding: 15, borderRadius: 7, alignItems: 'center', marginTop: 10 }, buttonText: { color: '#FFF', fontWeight: 'bold' } });
