/**
 * PatientProfileScreen Component
 * 
 * Main dashboard for authenticated patients
 * Displays:
 * - User profile information
 * - List of all appointments related to the patient
 * - Action buttons for welcome message
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useFeedback } from '../../context/FeedbackContext';

// ==================== CONSTANTS ====================

/** API base URL - matches LoginScreen configuration */
const API_PORT = 8080;
const ANDROID_LOCAL_IP = '10.0.4.12';
const LOCALHOST = 'http://localhost';

/**
 * Determines the API base URL based on platform and environment configuration
 * @returns {string} API base URL
 */
const getApiBaseUrl = () => {
    const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
    if (configuredUrl) {
        return configuredUrl.replace(/\/$/, '');
    }
    if (Platform.OS === 'android') {
        return `http://${ANDROID_LOCAL_IP}:${API_PORT}`;
    }
    return `${LOCALHOST}:${API_PORT}`;
};

const API_BASE_URL = getApiBaseUrl();

// ==================== MAIN COMPONENT ====================

/**
 * Patient Profile Screen
 * Shows user information and all appointments associated with the patient
 * 
 * @param {Object} navigation - React Navigation object
 * @param {Object} route - Route object with user data from login
 * @returns {JSX.Element} Patient profile UI
 */
export default function PatientProfileScreen({ navigation, route }: any) {
    // ==================== STATE MANAGEMENT ====================

    const { user: storedUser, setUser } = useFeedback();
    
    /** User data passed from LoginScreen */
    const user = route.params?.user || storedUser;
    
    /** List of appointments for the patient */
    const [appointments, setAppointments] = useState<any[]>([]);
    
    /** Loading state while fetching appointments */
    const [isLoading, setIsLoading] = useState(false);
    
    /** Error message if appointment fetch fails */
    const [error, setError] = useState('');

    // ==================== EFFECTS ====================

    /**
     * Fetch appointments when component mounts
     * Uses patient ID from user data
     */
    useEffect(() => {
        if (user?.userId) {
            fetchAppointments();
        }
    }, [user?.userId]);

    useEffect(() => {
        if (!user) {
            navigation.replace('LoginScreen');
        }
    }, [navigation, user]);

    if (!user) {
        return null;
    }

    // ==================== API CALLS ====================

    /**
     * Fetches all appointments for the current patient
     * Calls /api/patient-appointments endpoint with patient ID
     * 
     * @async
     * @returns {Promise<void>}
     */
    const fetchAppointments = async () => {
        setIsLoading(true);
        setError('');
        
        try {
            // Construct the full API URL
            const appointmentsUrl = `${API_BASE_URL}/api/patient-appointments?patientId=${user.userId}`;
            
            console.log('Fetching from:', appointmentsUrl);
            console.log('Auth token:', user.token?.substring(0, 10) + '...');

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(appointmentsUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            console.log('Response status:', response.status);

            const result = await response.json();
            console.log('Response:', result);

            if (response.ok && result.success) {
                setAppointments(result.appointments || []);
            } else {
                setError(result.message || 'Unable to load appointments');
            }
        } catch (err: any) {
            console.error('Fetch error:', err);
            
            // Provide detailed error message
            const errorMsg = err?.message || 'Unknown error';
            const detailedError = `Server Error: ${errorMsg}\n\nAPI Base URL: ${API_BASE_URL}\n\n` +
                `Make sure:\n` +
                `1. Backend server is running on port 8080\n` +
                `2. Database connection is configured\n` +
                `3. Environment variables are set:\n   - ORACLE_URL\n   - ORACLE_USERNAME\n   - ORACLE_PASSWORD`;
            
            setError(detailedError);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Log out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log out',
                style: 'destructive',
                onPress: async () => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'LoginScreen' }],
                    });
                    await setUser(null);
                },
            },
        ]);
    };

    // ==================== SUB-COMPONENTS ====================

    /**
     * Appointment Row Component
     * Displays a single appointment with doctor info, status badge, and action buttons
     * Matches JSP implementation with status icons and conditional action buttons
     * 
     * @param {Object} item - Appointment object with appointment details
     * @returns {JSX.Element} Formatted appointment row with status and actions
     */
    const AppointmentRow = ({ item }: any) => {
        // Determine status icon and styling
        const getStatusDetails = (status: string) => {
            const statusMap: any = {
                'PENDING': { icon: '⏳', class: 'pending', color: '#FF9800' },
                'CONFIRMED': { icon: '✓', class: 'confirmed', color: '#4CAF50' },
                'BOOKED': { icon: '✓', class: 'confirmed', color: '#4CAF50' },
                'COMPLETED': { icon: '✔', class: 'completed', color: '#2196F3' },
                'CANCELLED': { icon: '✕', class: 'cancelled', color: '#B00020' },
            };
            return statusMap[status] || { icon: '•', class: 'unknown', color: '#999' };
        };

        const statusDetails = getStatusDetails(item.status);
        
        // Check if appointment can be modified (not completed/cancelled)
        const isModifiable = !['COMPLETED', 'CANCELLED'].includes(item.status?.toUpperCase());

        const cancelAppointment = async () => {
            const appointmentId = item.appointmentId ?? item.id;
            if (!appointmentId) {
                Alert.alert('Missing data', 'This appointment does not have an ID.');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/appointments/cancel`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        token: user.token,
                        appointmentId: String(appointmentId),
                    }).toString(),
                });

                const result = await response.json();
                if (!response.ok || !result.success) {
                    Alert.alert('Cancel failed', result.message || 'Unable to cancel appointment.');
                    return;
                }

                Alert.alert('Success', 'Appointment cancelled successfully.');
                fetchAppointments();
            } catch (error: any) {
                Alert.alert('Error', error?.message || 'Unable to cancel appointment.');
            }
        };

        return (
            <View style={styles.appointmentRowWrapper}>
                {/* Appointment Details */}
                <View style={styles.appointmentRow}>
                    {/* Doctor Column */}
                    <View style={[styles.appointmentCell, { flex: 1.2 }]}>
                        <Text style={styles.appointmentLabel}>Doctor</Text>
                        <Text style={styles.appointmentValue} numberOfLines={2}>
                            {item.doctorName || 'N/A'}
                        </Text>
                    </View>

                    {/* Specialization Column */}
                    <View style={[styles.appointmentCell, { flex: 1 }]}>
                        <Text style={styles.appointmentLabel}>Specialty</Text>
                        <Text style={styles.appointmentValue} numberOfLines={2}>
                            {item.specialization || 'N/A'}
                        </Text>
                    </View>

                    {/* Date Column */}
                    <View style={[styles.appointmentCell, { flex: 1 }]}>
                        <Text style={styles.appointmentLabel}>Date</Text>
                        <Text style={styles.appointmentValue}>
                            {item.appointmentDate || 'N/A'}
                        </Text>
                    </View>

                    {/* Time Column */}
                    <View style={[styles.appointmentCell, { flex: 0.8 }]}>
                        <Text style={styles.appointmentLabel}>Time</Text>
                        <Text style={styles.appointmentValue}>
                            {item.appointmentTime || 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* Status and Action Buttons Row */}
                <View style={styles.statusActionRow}>
                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: statusDetails.color }]}>
                        <Text style={styles.statusIcon}>{statusDetails.icon}</Text>
                        <Text style={styles.statusText}>{item.status || 'UNKNOWN'}</Text>
                    </View>

                    {/* Action Buttons - Only for modifiable appointments */}
                    {isModifiable ? (
                        <View style={styles.actionButtonsGroup}>
                            {/* Change Time Button */}
                            <TouchableOpacity
                                style={styles.actionButtonSmall}
                                onPress={async () => {
                                    await AsyncStorage.setItem(
                                        'mad-pms-change-appointment',
                                        JSON.stringify(item)
                                    );
                                    navigation.navigate('ChangeAppointmentTime', {
                                        user,
                                        appointment: item,
                                    });
                                }}
                            >
                                <Text style={styles.actionButtonTextSmall}>✏️ Change</Text>
                            </TouchableOpacity>

                            {/* Cancel Appointment Button */}
                            <TouchableOpacity
                                style={[styles.actionButtonSmall, styles.actionButtonDanger]}
                                onPress={() => {
                                    Alert.alert(
                                        'Cancel Appointment',
                                        'Are you sure you want to cancel this appointment?',
                                        [
                                            { text: 'No', style: 'cancel' },
                                            { text: 'Yes, Cancel', onPress: cancelAppointment, style: 'destructive' }
                                        ]
                                    );
                                }}
                            >
                                <Text style={styles.actionButtonTextSmall}>✕ Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.emptyActionSpace} />
                    )}
                </View>
            </View>
        );
    };

    // ==================== RENDER ====================

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
        >
            {/* Profile Header Section */}
            <View style={styles.container}>
                <Image
                    source={{ uri: 'https://via.placeholder.com/150' }}
                    style={styles.logo}
                />
            </View>

            {/* User Information Card */}
            <View style={styles.card}>
                <Text style={styles.title}>User Profile</Text>
                <Text style={styles.infoText}>
                    Name: <Text style={styles.infoValue}>{user?.name || 'Not available'}</Text>
                </Text>
                <Text style={styles.infoText}>
                    Role: <Text style={styles.infoValue}>{user?.role || 'Not available'}</Text>
                </Text>
                <Text style={styles.infoText}>
                    User ID: <Text style={styles.infoValue}>{user?.userId || 'Not available'}</Text>
                </Text>
            </View>

            {/* Appointments Section */}
            <View style={styles.appointmentsSection}>
                <Text style={styles.sectionTitle}>My Appointments</Text>
                
                {/* Loading Indicator */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1565C0" />
                        <Text style={styles.loadingText}>Loading appointments...</Text>
                    </View>
                )}

                {/* Error Message */}
                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorTitle}>⚠️ Connection Error</Text>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={fetchAppointments}
                        >
                            <Text style={styles.retryButtonText}>🔄 Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* Appointments List */}
                {!isLoading && appointments.length > 0 ? (
                    <View style={styles.appointmentsTable}>
                        {/* Table Header */}
                        <View style={[styles.tableHeaderRow, styles.tableHeader]}>
                            <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Doctor</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Specialty</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Date</Text>
                            <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Time</Text>
                        </View>

                        {/* Table Rows */}
                        {appointments.map((item, index) => (
                            <AppointmentRow
                                key={item.appointmentId ?? item.id ?? index}
                                item={item}
                            />
                        ))}
                    </View>
                ) : !isLoading && !error ? (
                    // No Appointments Message
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>📅 No appointments scheduled</Text>
                    </View>
                ) : null}

                {/* Refresh Button */}
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={fetchAppointments}
                >
                    <Text style={styles.refreshButtonText}>🔄 Refresh Appointments</Text>
                </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                        Alert.alert("Welcome", `Welcome back, ${user?.name}!`);
                    }}
                >
                    <Text style={styles.actionButtonText}>Show Welcome</Text>
                </TouchableOpacity>
            </View>

            {/* Navigation Buttons */}
            <View style={styles.navButtonsContainer}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('BookAppointment', { user })}
                >
                    <Text style={styles.navButtonText}>📅 Book New Appointment</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            navigation.navigate('Home');
                        }
                    }}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Log out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
    // ==================== LAYOUT ====================
    
    // Main scroll view container
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },

    // Top container for logo
    container: {
        alignItems: 'center',
        marginBottom: 20,
    },

    // Logo image styling
    logo: {
        width: 260,
        height: 100,
        alignSelf: 'center',
        marginBottom: 20,
    },

    // ==================== CARDS AND SECTIONS ====================

    // Profile information card
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        width: '100%',
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },

    // Appointments section container
    appointmentsSection: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },

    // ==================== TYPOGRAPHY ====================

    // Main card title
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'left',
        marginBottom: 12,
    },

    // Section title for appointments
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1565C0',
    },

    // Profile information label and value
    infoText: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
        color: '#333',
    },

    // Info value (right side)
    infoValue: {
        fontWeight: 'bold',
        color: '#1565C0',
    },

    // ==================== APPOINTMENTS TABLE ====================

    // Appointments table container
    appointmentsTable: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 15,
    },

    // Table header row (column titles)
    tableHeaderRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#0D47A1',
    },

    // Table header styling
    tableHeader: {
        backgroundColor: '#1565C0',
    },

    // Table header text
    tableHeaderText: {
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontSize: 12,
    },

    // Appointment row wrapper - contains main row and status/action row
    appointmentRowWrapper: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 0,
        backgroundColor: '#FAFAFA',
    },

    // Single appointment row (main data)
    appointmentRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 10,
    },

    // Individual cell in appointment row
    appointmentCell: {
        flex: 1,
        paddingHorizontal: 5,
        justifyContent: 'center',
    },

    // Appointment cell label (shown on small screens)
    appointmentLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#999',
        marginBottom: 3,
    },

    // Appointment cell value
    appointmentValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#333',
    },

    // Status and action buttons row
    statusActionRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        justifyContent: 'space-between',
    },

    // Status badge styling
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },

    // Status icon (emoji)
    statusIcon: {
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Status text
    statusText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 12,
    },

    // Action buttons group
    actionButtonsGroup: {
        flexDirection: 'row',
        gap: 8,
        flex: 1,
        justifyContent: 'flex-end',
    },

    // Small action button styling
    actionButtonSmall: {
        backgroundColor: '#4CAF50',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Danger action button (cancel)
    actionButtonDanger: {
        backgroundColor: '#B00020',
    },

    // Small action button text
    actionButtonTextSmall: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 11,
    },

    // Empty space when no actions available
    emptyActionSpace: {
        flex: 1,
    },

    // ==================== STATUS INDICATORS ====================

    // Loading container
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },

    // Loading text
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#999',
    },

    // Error container
    errorContainer: {
        backgroundColor: '#FFEBEE',
        borderLeftWidth: 4,
        borderLeftColor: '#B00020',
        padding: 15,
        borderRadius: 4,
        marginBottom: 15,
    },

    // Error title
    errorTitle: {
        color: '#B00020',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
    },

    // Error message text
    errorText: {
        color: '#B00020',
        fontSize: 12,
        marginBottom: 12,
        lineHeight: 18,
    },

    // Empty state container
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },

    // Empty state text
    emptyText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    },

    // ==================== BUTTONS ====================

    // Retry button after error
    retryButton: {
        backgroundColor: '#B00020',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },

    // Retry button text
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 12,
    },

    // Refresh appointments button
    refreshButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },

    // Refresh button text
    refreshButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 15,
    },

    // Action button container
    buttonContainer: {
        marginBottom: 15,
        alignItems: 'center',
    },

    // Primary action button
    actionButton: {
        backgroundColor: '#1565C0',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },

    // Action button text
    actionButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },

    // Navigation buttons container
    navButtonsContainer: {
        marginBottom: 20,
        gap: 10,
    },

    // Navigation button - Book appointment
    navButton: {
        backgroundColor: '#FF9800',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },

    // Navigation button text
    navButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 15,
    },

    // Go back button
    backButton: {
        borderWidth: 2,
        borderColor: '#1565C0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },

    // Go back button text
    backButtonText: {
        color: '#1565C0',
        fontWeight: '600',
        fontSize: 15,
    },

    logoutButton: {
        backgroundColor: '#B00020',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },

    logoutButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 15,
    },
});
