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
import { confirmAction } from '../../utils/confirmAction';
import { Alert } from '../../utils/appAlert';

const API_PORT = 8080;
const ANDROID_LOCAL_IP = '192.168.0.106';
const LOCALHOST = 'http://localhost';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '') ||
  (Platform.OS === 'android' ? `http://${ANDROID_LOCAL_IP}:${API_PORT}` : `${LOCALHOST}:${API_PORT}`);

interface Doctor { id: number; name: string; specialization: string; age: number; gender: string; contact: string; email: string; startTime: string; finishTime: string; fees: number | null; }
interface Summary { doctors: number; patients: number; appointments: number; completed: number; cancelled: number; feedback: number; }

export default function AdminDashboardScreen({ navigation }: { navigation: any }) {
  const { user, setUser, isAuthLoading } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', specialization: '', age: '', gender: 'Male', contact: '', email: '', startTime: '', finishTime: '', fees: '', password: '' });
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });

  const authHeaders = { Authorization: `Bearer ${user?.token || ''}` };
  const updateField = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const loadDashboard = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const responses = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin-summary`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/api/admin-doctors`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/api/admin-patients`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/api/admin-appointments`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/api/admin-feedback`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/api/admin-admins`, { headers: authHeaders }),
      ]);
      if (responses.some((response) => response.status === 401)) {
        await setUser(null);
        navigation.replace('LoginScreen');
        return;
      }
      const results = await Promise.all(responses.map((response) => response.json()));
      if (results.some((result) => !result.success)) throw new Error('Unable to load administrator data.');
      setSummary(results[0]); setDoctors(results[1].doctors || []); setPatients(results[2].patients || []);
      setAppointments(results[3].appointments || []); setFeedback(results[4].feedback || []);
      setAdmins(results[5].admins || []);
    } catch (error: any) {
      Alert.alert('Dashboard error', error.message || 'Unable to load administrator data.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user?.token || !user?.userId) {
      navigation.replace('LoginScreen');
      return;
    }
    if (user && user.role !== 'admin') {
      navigation.replace(user.role === 'patient' ? 'PatientProfile' : 'DoctorDashboard');
      return;
    }
    loadDashboard();
  }, [isAuthLoading, navigation, setUser, user?.token, user?.userId, user?.role]);

  const editDoctor = (doctor: Doctor) => {
    setEditingId(doctor.id);
    setForm({ name: doctor.name || '', specialization: doctor.specialization || '', age: String(doctor.age || ''), gender: doctor.gender || 'Male', contact: doctor.contact || '', email: doctor.email || '', startTime: doctor.startTime || '', finishTime: doctor.finishTime || '', fees: doctor.fees == null ? '' : String(doctor.fees), password: '' });
  };

  const saveDoctor = async () => {
    const required = ['name', 'specialization', 'age', 'gender', 'contact', 'email', 'startTime', 'finishTime'];
    if (required.some((field) => !form[field as keyof typeof form].trim()) || (!editingId && form.password.trim().length < 4) || (editingId && form.password.trim() && form.password.trim().length < 4)) {
      Alert.alert('Validation', 'Complete all doctor fields, including a password for a new doctor.'); return;
    }
    setSaving(true);
    try {
      const endpoint = editingId ? '/api/admin-doctors/update' : '/api/admin-doctors/add';
      const body: Record<string, string> = { token: user?.token || '', ...form };
      if (editingId) body.doctorId = String(editingId);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body).toString() });
      const result = await response.json();
      if (!response.ok || !result.success) { Alert.alert('Save failed', result.message || 'Unable to save doctor.'); return; }
      setEditingId(null); setForm({ name: '', specialization: '', age: '', gender: 'Male', contact: '', email: '', startTime: '', finishTime: '', fees: '', password: '' });
      await loadDashboard();
    } catch { Alert.alert('Connection error', `Cannot reach the server at ${API_BASE_URL}.`); } finally { setSaving(false); }
  };

  const logout = async () => {
    if (!await confirmAction('Log out', 'Are you sure you want to log out?')) return;
    await setUser(null);
    navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
  };

  const addAdmin = async () => {
    if (!adminForm.name.trim() || !adminForm.email.trim() || adminForm.password.trim().length < 4) {
      Alert.alert('Validation', 'Complete the administrator name and email, and use at least 4 password characters.'); return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin-admins/add`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token: user?.token || '', ...adminForm }).toString() });
      const result = await response.json();
      if (!response.ok || !result.success) { Alert.alert('Save failed', result.message || 'Unable to add administrator.'); return; }
      setAdminForm({ name: '', email: '', password: '' }); await loadDashboard();
    } catch { Alert.alert('Connection error', `Cannot reach the server at ${API_BASE_URL}.`); }
  };
  if (!user) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Dashboard 1111</Text>
      <Text style={styles.subtitle}>Welcome, {user.name}</Text>
      {loading && !summary ? <ActivityIndicator size="large" color="#1565C0" /> : null}
      {summary ? <View style={styles.metrics}>{Object.entries({ Doctors: summary.doctors, Patients: summary.patients, Appointments: summary.appointments, Completed: summary.completed, Cancelled: summary.cancelled, Feedback: summary.feedback }).map(([label, value]) => <View style={styles.metric} key={label}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>)}</View> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{editingId ? 'Edit Doctor' : 'Add Doctor'}</Text>
        {(['name', 'specialization', 'age', 'contact', 'email', 'startTime', 'finishTime', 'fees', 'password'] as const).map((field) => <TextInput key={field} style={styles.input} placeholder={field === 'startTime' ? 'Start time (HH:MM)' : field === 'finishTime' ? 'Finish time (HH:MM)' : field[0].toUpperCase() + field.slice(1)} keyboardType={field === 'age' || field === 'fees' ? 'numeric' : field === 'email' ? 'email-address' : 'default'} secureTextEntry={field === 'password'} value={form[field]} onChangeText={(value) => updateField(field, value)} />)}
        <View style={styles.genderRow}><TouchableOpacity style={[styles.genderButton, form.gender === 'Male' && styles.genderSelected]} onPress={() => updateField('gender', 'Male')}><Text>Male</Text></TouchableOpacity><TouchableOpacity style={[styles.genderButton, form.gender === 'Female' && styles.genderSelected]} onPress={() => updateField('gender', 'Female')}><Text>Female</Text></TouchableOpacity></View>
        <TouchableOpacity style={styles.primaryButton} onPress={saveDoctor} disabled={saving}><Text style={styles.primaryText}>{saving ? 'Saving...' : editingId ? 'Update Doctor' : 'Add Doctor'}</Text></TouchableOpacity>
        {editingId ? <TouchableOpacity onPress={() => { setEditingId(null); setForm({ name: '', specialization: '', age: '', gender: 'Male', contact: '', email: '', startTime: '', finishTime: '', fees: '', password: '' }); }}><Text style={styles.link}>Cancel editing</Text></TouchableOpacity> : null}
      </View>

      <DataSection title="Doctors" data={doctors} renderItem={(doctor: Doctor) =>
        <View style={styles.row} key={doctor.id}>
          <View style={styles.rowText}><Text style={styles.rowTitle}>{doctor.name}</Text><Text
            style={styles.detail}>{doctor.specialization} | {doctor.startTime}-{doctor.finishTime}</Text></View>
          <TouchableOpacity onPress={() => editDoctor(doctor)}><Text style={styles.link}>Edit</Text></TouchableOpacity>
        </View>} />
      <DataSection title="Patients" data={patients} renderItem={(patient: any) =>
        <View style={styles.row} key={patient.id}><Text style={styles.rowTitle}>{patient.name}</Text><Text
          style={styles.detail}>{patient.email} | {patient.phone || 'No phone'}</Text></View>} />
      <DataSection title="Appointments" data={appointments} renderItem={(item: any) =>
        <View style={styles.row} key={item.id}><Text style={styles.rowTitle}>{item.patientName} with
          {item.doctorName}</Text><Text style={styles.detail}>{item.date} at {item.time} | {item.status}</Text></View>}
      />
      <DataSection title="Feedback" data={feedback} renderItem={(item: any) =>
        <View style={styles.row} key={item.id}><Text style={styles.rowTitle}>{item.patientName}</Text><Text
          style={styles.detail}>{item.message}</Text></View>} />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add Administrator</Text>
        {(['name', 'email', 'password'] as const).map((field) => <TextInput key={field} style={styles.input}
          placeholder={field[0].toUpperCase() + field.slice(1)} secureTextEntry={field === 'password'}
          value={adminForm[field]} onChangeText={(value) => setAdminForm((current) => ({
            ...current, [field]: value
          }))} />)}
        <TouchableOpacity style={styles.primaryButton} onPress={addAdmin}><Text style={styles.primaryText}>Add
          Administrator</Text></TouchableOpacity>
        {admins.map((admin) => <View style={styles.row} key={admin.id}><Text
          style={styles.rowTitle}>{admin.name}</Text><Text style={styles.detail}>{admin.email}</Text></View>)}
      </View>
      <TouchableOpacity style={styles.refreshButton} onPress={loadDashboard}>
        <Text style={styles.link}>Refresh Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ChangePassword')}>
        <Text style={styles.primaryText}>Change Password</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}><Text style={styles.primaryText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function DataSection({ title, data, renderItem }: { title: string; data: any[]; renderItem: (item: any) => React.ReactNode }) { return <View style={styles.card}><Text style={styles.cardTitle}>{title}</Text>{data.length ? data.map(renderItem) : <Text style={styles.empty}>No records found.</Text>}</View>; }

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F5F7FA' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#123B5D' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 6, marginBottom: 18 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  metric: { width: '31.5%', minWidth: 95, backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  metricValue: { fontSize: 23, fontWeight: 'bold', color: '#1565C0' },
  metricLabel: { color: '#64748B', fontSize: 12, textAlign: 'center', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1565C0', marginBottom: 14 },
  input: { height: 48, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 7, paddingHorizontal: 12, marginBottom: 10 },
  genderRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  genderButton: { flex: 1, padding: 11, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 7, alignItems: 'center' },
  genderSelected: { backgroundColor: '#DBEAFE', borderColor: '#1565C0' },
  primaryButton: { backgroundColor: '#1565C0', padding: 14, borderRadius: 7, alignItems: 'center', marginTop: 4 },
  primaryText: { color: '#FFFFFF', fontWeight: 'bold' },
  row: { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingVertical: 12 },
  rowText: { flex: 1 }, rowTitle: { fontSize: 15, fontWeight: 'bold', color: '#123B5D' },
  detail: { color: '#64748B', fontSize: 13, lineHeight: 19, marginTop: 3 },
  link: { color: '#1565C0', fontWeight: 'bold', textAlign: 'center', marginTop: 12 },
  empty: { color: '#64748B' },
  refreshButton: { padding: 12, alignItems: 'center', marginBottom: 4 },
  logoutButton: { backgroundColor: '#B00020', padding: 14, borderRadius: 7, alignItems: 'center', marginTop: 10, marginBottom: 20 },
});
