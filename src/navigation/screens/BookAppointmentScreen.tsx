/**
 * BookAppointmentScreen Component
 * 
 * Allows authenticated patients to book new appointments with doctors
 * Flow: Select Doctor → Select Date → Select Time → Confirm Booking
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    Platform,
    FlatList,
    Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

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

// ==================== TYPE DEFINITIONS ====================

interface Doctor {
    id: number;
    name: string;
    specialization: string;
    startTime: string;
    finishTime: string;
}

interface TimeSlot {
    time: string;
}

// ==================== COMPONENT ====================

const BookAppointmentScreen = ({ route }: any) => {
    // ==================== STATE MANAGEMENT ====================

    /** List of doctors fetched from backend */
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    /** Selected doctor ID */
    const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

    /** Available dates for selected doctor (day of week: 1-7) */
    const [availableDays, setAvailableDays] = useState<number[]>([]);

    /** Time slots available for selected date */
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

    /** Selected appointment date (YYYY-MM-DD format) */
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    /** Selected appointment time (HH:MM format) */
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    /** Loading state for API calls */
    const [loading, setLoading] = useState(false);

    /** Calendar modal visibility */
    const [showCalendar, setShowCalendar] = useState(false);

    /** Time slots modal visibility */
    const [showTimeSlots, setShowTimeSlots] = useState(false);

    /** Current calendar view date */
    const [calendarDate, setCalendarDate] = useState(new Date());

    /** User token for authentication (from login) */
    const userToken = route.params?.user?.token || '';

    // ==================== EFFECTS ====================

    /**
     * Fetch list of doctors when component mounts
     */
    useEffect(() => {
        fetchDoctors();
    }, []);

    /**
     * Load availability when doctor changes
     */
    useEffect(() => {
        if (selectedDoctorId) {
            loadAvailability();
            setSelectedDate(null);
            setSelectedTime(null);
            setTimeSlots([]);
        }
    }, [selectedDoctorId]);

    // ==================== API CALLS ====================

    /**
     * Fetches list of all doctors from backend
     */
    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/doctors`);
            const result = await response.json();

            if (result.success && result.doctors) {
                setDoctors(result.doctors);
            } else {
                Alert.alert('Error', 'Failed to load doctors list.');
            }
        } catch (error) {
            Alert.alert(
                'Connection Error',
                `Cannot reach the server at ${API_BASE_URL}`
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Loads available days for selected doctor
     */
    const loadAvailability = async () => {
        if (!selectedDoctorId) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/availability?doctorId=${selectedDoctorId}`
            );
            const result = await response.json();

            if (result.success && result.days) {
                setAvailableDays(result.days);
            }
        } catch (error) {
            console.error('Error loading availability:', error);
        }
    };

    /**
     * Loads time slots for selected date
     * @param date - Date in YYYY-MM-DD format
     */
    const loadTimeSlots = async (date: string) => {
        if (!selectedDoctorId) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/time-slots?doctorId=${selectedDoctorId}&date=${date}`
            );
            const result = await response.json();

            if (result.success && result.slots) {
                setTimeSlots(result.slots);
            }
        } catch (error) {
            console.error('Error loading time slots:', error);
            Alert.alert('Error', 'Failed to load available time slots.');
        }
    };

    /**
     * Books appointment with selected doctor, date, and time
     */
    const bookAppointment = async () => {
        if (!selectedDoctorId || !selectedDate || !selectedTime) {
            Alert.alert('Validation', 'Please select doctor, date, and time.');
            return;
        }

        if (!userToken) {
            Alert.alert('Error', 'User token not found. Please login again.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    token: userToken,
                    doctorId: selectedDoctorId.toString(),
                    appointmentDate: selectedDate,
                    appointmentTime: selectedTime,
                }).toString(),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                Alert.alert(
                    'Booking Failed',
                    result.message || 'Unable to book appointment.'
                );
                return;
            }

            Alert.alert('Success', 'Appointment booked successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Reset form
                        setSelectedDoctorId(null);
                        setSelectedDate(null);
                        setSelectedTime(null);
                        setTimeSlots([]);
                    },
                },
            ]);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to book appointment. Please try again.');
            console.error('Booking error:', error);
        } finally {
            setLoading(false);
        }
    };

    // ==================== CALENDAR HELPERS ====================

    /**
     * Gets all dates for the current calendar view
     */
    const getCalendarDates = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();

        // First day of month and last day
        const firstDay = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();

        const dates = [];

        // Empty slots for days before month starts
        for (let i = 0; i < firstDay; i++) {
            dates.push(null);
        }

        // Days of current month
        for (let i = 1; i <= lastDay; i++) {
            dates.push(i);
        }

        return dates;
    };

    /**
     * Formats date as YYYY-MM-DD string
     */
    const formatDateString = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(
            2,
            '0'
        )}`;
    };

    /**
     * Checks if date is available (doctor works on that day of week)
     */
    const isDateAvailable = (dayOfMonth: number | null) => {
        if (!dayOfMonth) return false;
        const date = new Date(
            calendarDate.getFullYear(),
            calendarDate.getMonth(),
            dayOfMonth
        );
        const dayOfWeek = date.getDay(); // 0-6 (Sun-Sat)
        return availableDays.includes(dayOfWeek);
    };

    /**
     * Handles date selection from calendar
     */
    const selectDate = (dayOfMonth: number) => {
        if (!isDateAvailable(dayOfMonth)) return;

        const dateString = formatDateString(
            calendarDate.getFullYear(),
            calendarDate.getMonth(),
            dayOfMonth
        );

        setSelectedDate(dateString);
        loadTimeSlots(dateString);
        setShowCalendar(false);
    };

    // ==================== RENDER HELPERS ====================

    /**
     * Renders calendar modal with date selection
     */
    const renderCalendar = () => {
        const dates = getCalendarDates();
        const monthYear = calendarDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });

        return (
            <Modal visible={showCalendar} transparent animationType="fade">
                <View style={styles.calendarOverlay}>
                    <View style={styles.calendarModal}>
                        <View style={styles.calendarHeader}>
                            <Text style={styles.calendarTitle}>{monthYear}</Text>
                            <TouchableOpacity onPress={() => setShowCalendar(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.weekDays}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                                (day) => (
                                    <Text key={day} style={styles.weekDayLabel}>
                                        {day}
                                    </Text>
                                )
                            )}
                        </View>

                        <View style={styles.calendarGrid}>
                            {dates.map((dayOfMonth, index) => {
                                const available = isDateAvailable(dayOfMonth);
                                const isSelected =
                                    dayOfMonth &&
                                    selectedDate ===
                                        formatDateString(
                                            calendarDate.getFullYear(),
                                            calendarDate.getMonth(),
                                            dayOfMonth
                                        );

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.calendarDay,
                                            !dayOfMonth ? styles.calendarDayEmpty : null,
                                            !available && dayOfMonth ? styles.calendarDayUnavailable : null,
                                            isSelected ? styles.calendarDaySelected : null,
                                        ]}
                                        onPress={() =>
                                            dayOfMonth && available && selectDate(dayOfMonth)
                                        }
                                        disabled={!available || !dayOfMonth}
                                    >
                                        <Text
                                            style={[
                                                styles.calendarDayText,
                                                (!available || !dayOfMonth) &&
                                                    styles.calendarDayTextDisabled,
                                            ]}
                                        >
                                            {dayOfMonth}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.calendarFooter}>
                            <TouchableOpacity
                                onPress={() =>
                                    setCalendarDate(
                                        new Date(
                                            calendarDate.getFullYear(),
                                            calendarDate.getMonth() - 1
                                        )
                                    )
                                }
                            >
                                <Text style={styles.navButton}>◀ Prev</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() =>
                                    setCalendarDate(
                                        new Date(
                                            calendarDate.getFullYear(),
                                            calendarDate.getMonth() + 1
                                        )
                                    )
                                }
                            >
                                <Text style={styles.navButton}>Next ▶</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    /**
     * Renders time slots selection modal
     */
    const renderTimeSlots = () => (
        <Modal visible={showTimeSlots} transparent animationType="fade">
            <View style={styles.timeSlotsOverlay}>
                <View style={styles.timeSlotsModal}>
                    <View style={styles.timeSlotsHeader}>
                        <Text style={styles.timeSlotsTitle}>Select Time</Text>
                        <TouchableOpacity onPress={() => setShowTimeSlots(false)}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={timeSlots}
                        keyExtractor={(item) => item.time}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.timeSlotButton,
                                    selectedTime === item.time &&
                                        styles.timeSlotButtonSelected,
                                ]}
                                onPress={() => {
                                    setSelectedTime(item.time);
                                    setShowTimeSlots(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.timeSlotText,
                                        selectedTime === item.time &&
                                            styles.timeSlotTextSelected,
                                    ]}
                                >
                                    {item.time}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );

    // ==================== RENDER ====================

    const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.heading}>Book Appointment</Text>

                {/* ===== DOCTOR SELECTION ===== */}
                <View style={styles.section}>
                    <Text style={styles.label}>Select Doctor</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedDoctorId}
                            onValueChange={(value) => setSelectedDoctorId(value)}
                            style={styles.picker}
                        >
                            <Picker.Item
                                label="-- Select Doctor --"
                                value={null}
                            />
                            {doctors.map((doctor) => (
                                <Picker.Item
                                    key={doctor.id}
                                    label={`${doctor.name} - ${doctor.specialization}`}
                                    value={doctor.id}
                                />
                            ))}
                        </Picker>
                    </View>

                    {selectedDoctor && (
                        <View style={styles.doctorInfo}>
                            <Text style={styles.doctorInfoText}>
                                <Text style={styles.doctorLabel}>Name: </Text>
                                {selectedDoctor.name}
                            </Text>
                            <Text style={styles.doctorInfoText}>
                                <Text style={styles.doctorLabel}>Specialization: </Text>
                                {selectedDoctor.specialization}
                            </Text>
                            <Text style={styles.doctorInfoText}>
                                <Text style={styles.doctorLabel}>Hours: </Text>
                                {selectedDoctor.startTime} - {selectedDoctor.finishTime}
                            </Text>
                        </View>
                    )}
                </View>

                {/* ===== DATE SELECTION ===== */}
                <View style={styles.section}>
                    <Text style={styles.label}>Appointment Date</Text>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            !selectedDoctorId && styles.buttonDisabled,
                        ]}
                        onPress={() => setShowCalendar(true)}
                        disabled={!selectedDoctorId}
                    >
                        <Text style={styles.buttonText}>
                            {selectedDate || 'Select Date'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ===== TIME SELECTION ===== */}
                <View style={styles.section}>
                    <Text style={styles.label}>Appointment Time</Text>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            (!selectedDate || timeSlots.length === 0) &&
                                styles.buttonDisabled,
                        ]}
                        onPress={() => setShowTimeSlots(true)}
                        disabled={!selectedDate || timeSlots.length === 0}
                    >
                        <Text style={styles.buttonText}>
                            {selectedTime || 'Select Time'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ===== CONFIRM BOOKING ===== */}
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        (!selectedDoctorId || !selectedDate || !selectedTime || loading) &&
                            styles.confirmButtonDisabled,
                    ]}
                    onPress={bookAppointment}
                    disabled={
                        !selectedDoctorId || !selectedDate || !selectedTime || loading
                    }
                >
                    <Text style={styles.confirmButtonText}>
                        {loading ? 'Booking...' : 'Confirm Appointment'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ===== MODALS ===== */}
            {renderCalendar()}
            {renderTimeSlots()}
        </ScrollView>
    );
};

export default BookAppointmentScreen;

// ==================== STYLES ====================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 20,
    },

    formContainer: {
        marginVertical: 20,
    },

    heading: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#1565C0',
    },

    section: {
        marginBottom: 25,
    },

    label: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 10,
        color: '#333',
    },

    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },

    picker: {
        height: 50,
    },

    doctorInfo: {
        marginTop: 15,
        padding: 15,
        backgroundColor: '#E3F2FD',
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#1565C0',
    },

    doctorInfoText: {
        fontSize: 14,
        marginBottom: 5,
        color: '#333',
    },

    doctorLabel: {
        fontWeight: '600',
        color: '#1565C0',
    },

    button: {
        backgroundColor: '#1565C0',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 5,
    },

    buttonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.5,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    confirmButton: {
        backgroundColor: '#4CAF50',
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },

    confirmButtonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.5,
    },

    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    // ===== CALENDAR STYLES =====

    calendarOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    calendarModal: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },

    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    calendarTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },

    weekDays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },

    weekDayLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        width: '14.28%',
        textAlign: 'center',
    },

    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },

    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 5,
        backgroundColor: '#f5f5f5',
    },

    calendarDayEmpty: {
        backgroundColor: 'transparent',
    },

    calendarDayUnavailable: {
        opacity: 0.3,
    },

    calendarDaySelected: {
        backgroundColor: '#1565C0',
    },

    calendarDayText: {
        fontSize: 14,
        color: '#333',
    },

    calendarDayTextDisabled: {
        color: '#ccc',
    },

    calendarFooter: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },

    navButton: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1565C0',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },

    closeButton: {
        fontSize: 24,
        color: '#666',
        fontWeight: 'bold',
    },

    // ===== TIME SLOTS STYLES =====

    timeSlotsOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    timeSlotsModal: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        width: '90%',
        maxHeight: '70%',
    },

    timeSlotsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    timeSlotsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },

    timeSlotButton: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 10,
        marginVertical: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },

    timeSlotButtonSelected: {
        backgroundColor: '#1565C0',
        borderColor: '#1565C0',
    },

    timeSlotText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
    },

    timeSlotTextSelected: {
        color: '#fff',
    },
});
