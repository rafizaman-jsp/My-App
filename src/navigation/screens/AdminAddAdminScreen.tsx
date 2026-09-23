import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../utils/appAlert';
import { adminRequest } from '../../utils/adminApi';

export default function AdminAddAdminScreen({ navigation }: { navigation: any }) {
  const { user, isAuthLoading, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!isAuthLoading && (!user?.token || user.role !== 'admin')) navigation.replace('LoginScreen'); }, [isAuthLoading, user?.token, user?.role]);
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || form.password.trim().length < 4) { Alert.alert('Validation', 'Enter name and email, and use at least 4 password characters.'); return; }
    setSaving(true);
    try {
      const { response, result } = await adminRequest('/api/admin-admins/add', user?.token || '', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token: user?.token || '', ...form }).toString() });
      if (response.status === 401) { await setUser(null); navigation.replace('LoginScreen'); return; }
      if (!response.ok || !result.success) { Alert.alert('Save failed', result.message || 'Unable to add administrator.'); return; }
      setForm({ name: '', email: '', password: '' }); Alert.alert('Success', 'Administrator added successfully.');
    } catch (error: any) { Alert.alert('Connection error', error.message || 'Unable to add administrator.'); }
    finally { setSaving(false); }
  };
  if (isAuthLoading || !user) return <ActivityIndicator size="large" color="#1565C0" />;
  return <View style={styles.container}><View style={styles.card}><Text style={styles.title}>Add Administrator</Text>{(['name', 'email', 'password'] as const).map((field) => <TextInput key={field} style={styles.input} placeholder={field} value={form[field]} secureTextEntry={field === 'password'} onChangeText={(value) => update(field, value)} />)}<TouchableOpacity style={styles.button} onPress={submit} disabled={saving}><Text style={styles.buttonText}>{saving ? 'Saving...' : 'Add Administrator'}</Text></TouchableOpacity></View></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 20, backgroundColor: '#F5F7FA' }, card: { backgroundColor: '#FFF', padding: 20, borderRadius: 8 }, title: { fontSize: 24, fontWeight: 'bold', color: '#1565C0', marginBottom: 18 }, input: { height: 48, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 7, paddingHorizontal: 12, marginBottom: 12 }, button: { backgroundColor: '#1565C0', padding: 15, borderRadius: 7, alignItems: 'center' }, buttonText: { color: '#FFF', fontWeight: 'bold' } });
