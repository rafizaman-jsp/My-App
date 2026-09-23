import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../utils/appAlert';
import { adminRequest } from '../../utils/adminApi';

type DoctorForm = {
  name: string;
  specialization: string;
  age: string;
  gender: string;
  contact: string;
  email: string;
  startTime: string;
  finishTime: string;
  fees: string;
  password: string;
};

const weekdays = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const emptyForm: DoctorForm = {
  name: '', specialization: '', age: '', gender: 'Male', contact: '', email: '',
  startTime: '', finishTime: '', fees: '', password: '',
};

const formFromDoctor = (doctor: any): DoctorForm => ({
  ...emptyForm,
  name: doctor?.name || '',
  specialization: doctor?.specialization || '',
  age: doctor?.age == null ? '' : String(doctor.age),
  gender: doctor?.gender || 'Male',
  contact: doctor?.contact || '',
  email: doctor?.email || '',
  startTime: doctor?.startTime || '',
  finishTime: doctor?.finishTime || '',
  fees: doctor?.fees == null ? '' : String(doctor.fees),
});

export default function AdminDoctorFormScreen({ navigation, route }: { navigation: any; route: any }) {
  const { user, isAuthLoading, setUser } = useAuth();
  const doctor = route.params?.doctor;
  const editing = Boolean(doctor?.id);
  const [form, setForm] = useState<DoctorForm>(() => formFromDoctor(doctor));
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && (!user?.token || user.role !== 'admin')) navigation.replace('LoginScreen');
  }, [isAuthLoading, navigation, user?.role, user?.token]);

  useEffect(() => {
    if (!editing || !user?.token) return;
    adminRequest(`/api/availability?doctorId=${doctor.id}`, user.token)
      .then(async ({ response, result }) => {
        if (response.status === 401) {
          await setUser(null);
          navigation.replace('LoginScreen');
          return;
        }
        if (response.ok && result.success) setAvailableDays(result.days || []);
      })
      .catch(() => Alert.alert('Availability error', 'Unable to load the doctor weekdays.'));
  }, [doctor?.id, editing, navigation, setUser, user?.token]);

  const update = (key: keyof DoctorForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    const required: (keyof DoctorForm)[] = ['name', 'specialization', 'age', 'contact', 'email', 'startTime', 'finishTime'];
    if (required.some((field) => !form[field].trim())) return 'Complete all required doctor fields.';

    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 18) return 'Doctor age must be a whole number of at least 18.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.';
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(form.finishTime)) return 'Use HH:MM format for working hours.';
    if (form.startTime >= form.finishTime) return 'Finish time must be later than start time.';
    if (availableDays.length === 0) return 'Select at least one available weekday.';
    if (form.fees.trim() && (!Number.isFinite(Number(form.fees)) || Number(form.fees) < 0)) return 'Fees must be a non-negative number.';
    if ((!editing && form.password.length < 4) || (editing && form.password && form.password.length < 4)) return 'Password must contain at least 4 characters.';
    return null;
  };

  const save = async () => {
    const error = validate();
    if (error) { Alert.alert('Validation', error); return; }
    setSaving(true);
    try {
      const payload: Record<string, string> = { token: user?.token || '', ...form };
      // Send weekdays using the same 0 = Sunday ... 6 = Saturday mapping as JavaScript Date.getDay().
      payload.days = [...availableDays].sort((a, b) => a - b).join(',');
      if (editing) {
        payload.doctorId = String(doctor.id);
        delete payload.password;
      }
      const path = editing ? '/api/admin-doctors/update' : '/api/admin-doctors/add';
      const { response, result } = await adminRequest(path, user?.token || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload).toString(),
      });
      if (response.status === 401) { await setUser(null); navigation.replace('LoginScreen'); return; }
      if (!response.ok || !result.success) { Alert.alert('Save failed', result.message || 'Unable to save doctor.'); return; }
      Alert.alert('Success', editing ? 'Doctor updated successfully.' : 'Doctor added successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Connection error', error.message || 'Unable to save doctor.');
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof DoctorForm; label: string; keyboardType?: any }[] = [
    { key: 'name', label: 'Doctor name' },
    { key: 'specialization', label: 'Specialization' },
    { key: 'age', label: 'Age', keyboardType: 'numeric' },
    { key: 'contact', label: 'Contact', keyboardType: 'phone-pad' },
    { key: 'email', label: 'Email', keyboardType: 'email-address' },
    { key: 'startTime', label: 'Start time (HH:MM)' },
    { key: 'finishTime', label: 'Finish time (HH:MM)' },
    { key: 'fees', label: 'Fees', keyboardType: 'decimal-pad' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{editing ? 'Edit Doctor' : 'Add Doctor'}</Text>
      {fields.map((field) => (
        <TextInput key={field.key} style={styles.input} placeholder={field.label} value={form[field.key]} keyboardType={field.keyboardType} onChangeText={(value) => update(field.key, value)} />
      ))}
      <View style={styles.genderRow}>
        {['Male', 'Female'].map((gender) => <TouchableOpacity key={gender} style={[styles.gender, form.gender === gender && styles.selected]} onPress={() => update('gender', gender)}><Text>{gender}</Text></TouchableOpacity>)}
      </View>
      {/* Separate weekday controls make the doctor's appointment schedule explicit. */}
      <Text style={styles.sectionLabel}>Available weekdays</Text>
      <View style={styles.weekdayRow}>
        {weekdays.map((day) => {
          const selected = availableDays.includes(day.value);
          return (
            <TouchableOpacity
              key={day.value}
              style={[styles.weekday, selected && styles.weekdaySelected]}
              onPress={() => setAvailableDays((current) => selected
                ? current.filter((value) => value !== day.value)
                : [...current, day.value])}
            >
              <Text style={selected ? styles.weekdayTextSelected : styles.weekdayText}>{day.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {!editing ? <TextInput style={styles.input} placeholder="Initial password" secureTextEntry value={form.password} onChangeText={(value) => update('password', value)} /> : <Text style={styles.hint}>Password is unchanged while editing.</Text>}
      <TouchableOpacity style={styles.primary} onPress={save} disabled={saving}><Text style={styles.primaryText}>{saving ? 'Saving...' : editing ? 'Update Doctor' : 'Add Doctor'}</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F5F7FA' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#123B5D', marginBottom: 16 },
  input: { height: 46, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 7, paddingHorizontal: 12, marginBottom: 10, backgroundColor: '#FFF' },
  genderRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  gender: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', borderRadius: 7, backgroundColor: '#FFF' },
  selected: { backgroundColor: '#DBEAFE', borderColor: '#1565C0' },
  sectionLabel: { color: '#123B5D', fontWeight: 'bold', marginBottom: 8 },
  weekdayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  weekday: { width: 68, padding: 11, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', borderRadius: 7, backgroundColor: '#FFF' },
  weekdaySelected: { backgroundColor: '#DBEAFE', borderColor: '#1565C0' },
  weekdayText: { color: '#334155' },
  weekdayTextSelected: { color: '#1565C0', fontWeight: 'bold' },
  hint: { color: '#64748B', marginBottom: 12 },
  primary: { backgroundColor: '#1565C0', padding: 14, alignItems: 'center', borderRadius: 7, marginTop: 4 },
  primaryText: { color: '#FFF', fontWeight: 'bold' },
  cancel: { textAlign: 'center', color: '#1565C0', fontWeight: 'bold', padding: 14 },
});
