import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFeedback } from '../../context/FeedbackContext';

const API_PORT = 8080;
const ANDROID_LOCAL_IP = '10.0.4.12';
const LOCALHOST = 'http://localhost';

const getApiBaseUrl = () => {
    const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
    if (configuredUrl) return configuredUrl.replace(/\/$/, '');
    return Platform.OS === 'android'
        ? `http://${ANDROID_LOCAL_IP}:${API_PORT}`
        : `${LOCALHOST}:${API_PORT}`;
};

const API_BASE_URL = getApiBaseUrl();

const normalizeAppointmentDate = (value: unknown) => {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, 10);
};

const normalizeTime = (value: unknown) => {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, 5);
};

interface TimeSlot {
    time: string;
}

export default function ChangeAppointmentTimeScreen({ navigation, route }: any) {
    const { user: storedUser } = useFeedback();
    const [appointment, setAppointment] = useState<any>(route.params?.appointment || null);
    const user = route.params?.user || storedUser;
    const userToken = user?.token || '';
    const appointmentId = appointment?.appointmentId ?? appointment?.id;
    const doctorId = appointment?.doctorId;
    const appointmentDate = normalizeAppointmentDate(appointment?.appointmentDate);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const returnToProfile = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('PatientProfile', { user });
        }
    };

    useEffect(() => {
        const restoreAppointment = async () => {
            if (appointment) {
                setSelectedTime('');
                loadTimeSlots(appointment);
                return;
            }

            try {
                const savedAppointment = await AsyncStorage.getItem('mad-pms-change-appointment');
                if (savedAppointment) {
                    const restored = JSON.parse(savedAppointment);
                    setAppointment(restored);
                    setSelectedTime('');
                    loadTimeSlots(restored);
                } else {
                    setLoading(false);
                }
            } catch {
                setLoading(false);
                Alert.alert('Error', 'Unable to restore appointment details.');
            }
        };

        restoreAppointment();
    }, []);

    const loadTimeSlots = async (appointmentToLoad: any) => {
        const appointmentDoctorId = appointmentToLoad?.doctorId;
        const appointmentDateToLoad = normalizeAppointmentDate(appointmentToLoad?.appointmentDate);
        const appointmentIdToLoad = appointmentToLoad?.appointmentId ?? appointmentToLoad?.id;

        if (!appointmentDoctorId || !appointmentDateToLoad) {
            setLoading(false);
            Alert.alert('Missing data', 'Doctor ID or appointment date is unavailable. Restart the backend and refresh appointments.');
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/time-slots?doctorId=${appointmentDoctorId}&date=${encodeURIComponent(appointmentDateToLoad)}&appointmentId=${appointmentIdToLoad}`
            );
            const result = await response.json();
            console.log('Change appointment response:', response.status, result);
            if (!response.ok || !result.success) {
                Alert.alert('Unable to load times', result.message || 'No time slots available.');
                return;
            }
            const currentTime = normalizeTime(appointmentToLoad?.appointmentTime);
            setTimeSlots(
                (result.slots || []).filter(
                    (slot: TimeSlot) => normalizeTime(slot.time) !== currentTime
                )
            );
        } catch (error: any) {
            Alert.alert('Connection error', error?.message || 'Unable to load available times.');
        } finally {
            setLoading(false);
        }
    };

    const saveTime = async () => {
        const currentTime = normalizeTime(appointment?.appointmentTime);
        if (!appointmentId || !selectedTime || !userToken) {
            Alert.alert('Validation', 'Please select a time and log in again if necessary.');
            return;
        }
        if (normalizeTime(selectedTime) === currentTime) {
            Alert.alert('Choose another time', 'Please choose a time different from the current appointment time.');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/appointments/change-time`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    token: userToken,
                    appointmentId: String(appointmentId),
                    appointmentTime: selectedTime,
                }).toString(),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                Alert.alert('Update failed', result.message || 'Unable to change appointment time.');
                return;
            }

            Alert.alert('Success', 'Appointment time updated successfully.', [
                { text: 'OK', onPress: returnToProfile },
            ]);
        } catch (error: any) {
            Alert.alert('Connection error', error?.message || 'Unable to update appointment time.');
        } finally {
            setSaving(false);
        }
    };

    if (!appointment) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Appointment details are unavailable.</Text>
                <TouchableOpacity style={styles.secondaryButton} onPress={returnToProfile}>
                    <Text style={styles.secondaryButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Change Appointment Time</Text>
            <View style={styles.details}>
                <Text style={styles.detail}><Text style={styles.label}>Doctor: </Text>{appointment.doctorName || 'N/A'}</Text>
                <Text style={styles.detail}><Text style={styles.label}>Specialty: </Text>{appointment.specialization || 'N/A'}</Text>
                <Text style={styles.detail}><Text style={styles.label}>Date: </Text>{appointmentDate || 'N/A'}</Text>
                <Text style={styles.detail}><Text style={styles.label}>Current time: </Text>{appointment.appointmentTime || 'N/A'}</Text>
            </View>

            <Text style={styles.subtitle}>Available times</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#1565C0" />
            ) : timeSlots.length === 0 ? (
                <Text style={styles.emptyText}>No available times for this date.</Text>
            ) : (
                <View style={styles.slots}>
                    {timeSlots.map((slot) => (
                        <TouchableOpacity
                            key={slot.time}
                            style={[styles.slot, selectedTime === slot.time && styles.selectedSlot]}
                            onPress={() => setSelectedTime(slot.time)}
                        >
                            <Text style={[styles.slotText, selectedTime === slot.time && styles.selectedSlotText]}>
                                {slot.time}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <TouchableOpacity
                style={[styles.primaryButton, (!selectedTime || saving) && styles.disabledButton]}
                onPress={saveTime}
                disabled={!selectedTime || saving}
            >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Confirm Appointment</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={returnToProfile} disabled={saving}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#F5F7FA' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F5F7FA' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#12304A', marginBottom: 20 },
    subtitle: { fontSize: 18, fontWeight: 'bold', color: '#12304A', marginBottom: 12 },
    details: { backgroundColor: '#FFF', borderRadius: 8, padding: 16, marginBottom: 24 },
    detail: { fontSize: 15, color: '#334155', marginBottom: 8 },
    label: { fontWeight: 'bold', color: '#12304A' },
    slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    slot: { minWidth: 92, paddingVertical: 13, paddingHorizontal: 18, borderWidth: 1, borderColor: '#1565C0', borderRadius: 6, alignItems: 'center', backgroundColor: '#FFF' },
    selectedSlot: { backgroundColor: '#1565C0' },
    slotText: { color: '#1565C0', fontWeight: '600' },
    selectedSlotText: { color: '#FFF' },
    primaryButton: { marginTop: 28, padding: 14, borderRadius: 6, alignItems: 'center', backgroundColor: '#1565C0' },
    disabledButton: { opacity: 0.5 },
    primaryButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    secondaryButton: { marginTop: 12, padding: 13, borderRadius: 6, borderWidth: 1, borderColor: '#64748B', alignItems: 'center' },
    secondaryButtonText: { color: '#334155', fontWeight: '600' },
    emptyText: { color: '#64748B', paddingVertical: 20 },
    errorText: { color: '#B00020', marginBottom: 12 },
});
