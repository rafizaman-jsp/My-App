import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../utils/appAlert';
import { adminRequest } from '../../utils/adminApi';

const config: any = { patients: ['/api/admin-patients', 'Patients'], appointments: ['/api/admin-appointments', 'Appointments'], feedback: ['/api/admin-feedback', 'Feedback'] };
export default function AdminRecordsScreen({ navigation, route }: { navigation: any; route: any }) {
  const { user, isAuthLoading, setUser } = useAuth();
  const type = route.params?.type || 'patients';
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (isAuthLoading) return;
    if (!user?.token || user.role !== 'admin') { navigation.replace('LoginScreen'); return; }
    const [path] = config[type] || config.patients;
    adminRequest(path, user.token).then(async ({ response, result }) => {
      if (response.status === 401) { await setUser(null); navigation.replace('LoginScreen'); return; }
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load records.');
      const key = type === 'patients' ? 'patients' : type;
      setRows(result[key] || []);
    }).catch((error) => Alert.alert('Records error', error.message || 'Unable to load records.')).finally(() => setLoading(false));
  }, [isAuthLoading, user?.token, user?.role, type]);
  const [, title] = config[type] || config.patients;
  return <ScrollView contentContainerStyle={styles.container}><Text style={styles.title}>{title}</Text>{loading ? <ActivityIndicator size="large" color="#1565C0" /> : rows.map((row, index) => <View style={styles.row} key={row.id || row.appointmentId || index}><Text style={styles.heading}>{row.name || row.patientName || row.doctorName || 'Record'}</Text><Text style={styles.detail}>{row.email || row.phone || row.doctorName || row.message || `${row.date || row.appointmentDate || ''} ${row.time || row.appointmentTime || ''}`}</Text><Text style={styles.detail}>{row.status || row.specialization || ''}</Text></View>)}</ScrollView>;
}
const styles = StyleSheet.create({ container: { flexGrow: 1, padding: 20, backgroundColor: '#F5F7FA' }, title: { fontSize: 28, fontWeight: 'bold', color: '#123B5D', marginBottom: 16 }, row: { backgroundColor: '#FFF', padding: 15, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }, heading: { fontSize: 16, fontWeight: 'bold', color: '#123B5D' }, detail: { color: '#64748B', marginTop: 5 } });
