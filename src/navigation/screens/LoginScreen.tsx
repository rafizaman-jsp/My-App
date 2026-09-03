/**
 * LoginScreen Component
 * 
 * Handles user authentication for three roles: Doctor, Admin, and Patient
 * Validates credentials against the backend API and navigates to appropriate screen on success
 * 
 * @component
 */

import React, { useState } from 'react';
import {
    Alert,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFeedback } from '../../context/FeedbackContext';

// ==================== CONSTANTS ====================

/** Default API endpoint ports */
const API_PORT = 8080;

/** Android emulator local IP address for backend connection */
const ANDROID_LOCAL_IP = '10.0.4.12';

/** iOS/Web localhost address */
const LOCALHOST = 'http://localhost';

/** Android emulator address */
const ANDROID_EMULATOR = `http://${ANDROID_LOCAL_IP}`;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Determines the API base URL based on platform and environment configuration
 * Priority: Environment variable > Platform-specific default
 * 
 * @returns {string} API base URL (e.g., http://10.0.4.12:8080)
 */
const getApiBaseUrl = () => {
    // Check if API URL is configured in environment variables
    const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
    if (configuredUrl) {
        return configuredUrl.replace(/\/$/, ''); // Remove trailing slash if present
    }

    // Use platform-specific defaults if no config provided
    if (Platform.OS === 'android') {
        return `${ANDROID_EMULATOR}:${API_PORT}`;
    }

    return `${LOCALHOST}:${API_PORT}`;
};

// Initialize API base URL at module load time
const API_BASE_URL = getApiBaseUrl();

/**
 * Main LoginScreen Component
 * Provides login UI and handles authentication
 * 
 * @param {Object} navigation - React Navigation object for screen navigation
 * @returns {JSX.Element} Login screen UI
 */
export default function LoginScreen({ navigation }: { navigation: any }) {
    // ==================== HOOKS ====================

    /** Feedback context for global feedback modal management */
    const { setUser } = useFeedback();

    // ==================== STATE MANAGEMENT ====================
    
    /** Selected user role (doctor, admin, patient) */
    const [role, setRole] = useState('patient');
    
    /** Login ID input (doctor ID, admin username, or patient email) */
    const [loginId, setLoginId] = useState('');
    
    /** Password input */
    const [password, setPassword] = useState('');
    
    /** Error/status message displayed to user */
    const [loginMessage, setLoginMessage] = useState('');

    // ==================== EVENT HANDLERS ====================

    /**
     * Handles login button press
     * Validates inputs, calls API, and navigates to user profile on success
     * 
     * @async
     * @returns {Promise<void>}
     */
    const handleLogin = async () => {
        // Clear previous messages
        setLoginMessage('');

        // Validate that all fields are filled
        if (!loginId || !password) {
            const validationError = 'Please fill in all fields.';
            setLoginMessage(validationError);
            Alert.alert('Login Failed', validationError);
            return;
        }

        let user;

        try {
            // Call login API endpoint
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                // Send credentials as URL-encoded form data
                body: new URLSearchParams({ role, loginId, password }).toString(),
            });

            // Parse JSON response
            const result = await response.json();

            // Check for API errors or invalid credentials
            if (!response.ok || !result.success) {
                const errorMsg = result.message || 'Invalid login credentials.';
                setLoginMessage(errorMsg);
                Alert.alert('Login Failed', errorMsg);
                return;
            }

            // Store user data from successful response
            user = result;

            // Persist the user and share the token with authenticated features
            await setUser(user);
        } catch (error) {
            // Handle network connection errors
            const errorMessage = `Cannot reach the API server at ${API_BASE_URL}. Start the Java backend on port 8080, and if you're using a phone, change EXPO_PUBLIC_API_BASE_URL to your computer's local IP.`;
            setLoginMessage(errorMessage);
            Alert.alert('Login Failed', 'Unable to connect to the server.');
            return;
        }

        // Navigate to user profile screen with user data
        navigation.replace('PatientProfile', { user });
    };

    // ==================== SUB-COMPONENTS ====================

    /**
     * RadioButton component for role selection
     * Toggles between doctor, admin, and patient roles
     * 
     * @param {Object} props - Component props
     * @param {string} props.value - Role value (doctor, admin, patient)
     * @param {string} props.label - Display label for the role
     * @returns {JSX.Element} Radio button with label
     */
    const RadioButton = ({ value, label }: any) => (
        <TouchableOpacity
            style={styles.radioContainer}
            onPress={() => setRole(value)}
        >
            {/* Radio button circle */}
            <View
                style={[
                    styles.radio,
                    role === value && styles.radioSelected,
                ]}
            />
            {/* Role label */}
            <Text>{label}</Text>
        </TouchableOpacity>
    );

    // ==================== RENDER ====================

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>

                {/* Screen Title */}
                <Text style={styles.heading}>User Login</Text>

                {/* Error Message Display */}
                {loginMessage ? <Text style={styles.errorText}>{loginMessage}</Text> : null}

                {/* Role Selection Section */}
                <Text style={styles.label}>Login As</Text>
                <View style={styles.roleRow}>
                    <RadioButton value="doctor" label="Doctor" />
                    <RadioButton value="admin" label="Admin" />
                    <RadioButton value="patient" label="Patient" />
                </View>

                {/* Login ID Input */}
                <Text style={styles.label}>
                    Doctor ID / Admin Username / Patient Email
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your ID / Username / Email"
                    value={loginId}
                    onChangeText={setLoginId}
                />

                {/* Password Input */}
                <Text style={styles.label}>Password</Text>
                <TextInput
                    secureTextEntry
                    style={styles.input}
                    placeholder="Enter Password"
                    value={password}
                    onChangeText={setPassword}
                />

                {/* Login Button */}
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                >
                    <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>

                {/* Divider */}
                <Text style={styles.or}>OR</Text>

                {/* Signup Link - For Patients Only */}
                <TouchableOpacity
                    style={styles.signupButton}
                    onPress={() => navigation.navigate('PatientRegistrationScreen')}
                >
                    <Text style={styles.signupText}>
                        Patient Signup
                    </Text>
                </TouchableOpacity>

            </View>
        </View>
    );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
    // Container and Layout
    container: {
        flex: 1,
        padding: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
    },

    // Form wrapper - limits width on larger screens
    formContainer: {
        width: '100%',
        maxWidth: 420,
        marginTop: 30,
    },

    // ==================== TYPOGRAPHY ====================

    // Main page heading
    heading: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 35,
    },

    // Error message styling
    errorText: {
        color: '#B00020', // Material Design red
        textAlign: 'center',
        marginBottom: 10,
    },

    // Form field labels
    label: {
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 10,
    },

    // Divider text between login and signup
    or: {
        textAlign: 'center',
        marginVertical: 15,
        fontWeight: 'bold',
    },

    // ==================== ROLE SELECTION ====================

    // Container for radio buttons row
    roleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },

    // Radio button container (button + label)
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Radio button circle - unselected state
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        marginRight: 6,
    },

    // Radio button circle - selected state
    radioSelected: {
        backgroundColor: '#1565C0', // Material Design blue
    },

    // ==================== INPUT FIELDS ====================

    // Text input styling for login credentials
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 50,
        backgroundColor: '#fff',
        marginBottom: 15,
    },

    // ==================== BUTTONS ====================

    // Login button - primary action
    loginButton: {
        backgroundColor: '#1565C0', // Material Design blue
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },

    // Login button text styling
    loginText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },

    // Signup button - secondary action (outline style)
    signupButton: {
        borderWidth: 1,
        borderColor: '#1565C0',
        padding: 15,
        borderRadius: 8,
    },

    // Signup button text styling
    signupText: {
        color: '#1565C0',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});
