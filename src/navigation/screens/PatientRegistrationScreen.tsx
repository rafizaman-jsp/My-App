import React, { useState } from 'react';
import {
    ActivityIndicator,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
} from 'react-native';
import { Alert } from '../../utils/appAlert';

const API_PORT = 8080;
const ANDROID_LOCAL_IP = '192.168.0.106';
const LOCALHOST = 'http://localhost';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '') ||
    (Platform.OS === 'android' ? `http://${ANDROID_LOCAL_IP}:${API_PORT}` : `${LOCALHOST}:${API_PORT}`);

const PatientRegistrationScreen = () => {
    const [patient, setPatient] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        age: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (key: string, value: string) => {
        setPatient({ ...patient, [key]: value });
    };

    const registerPatient = async () => {
        // Match the backend registration rules before making the network request.
        const age = Number(patient.age.trim());
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !patient.firstName.trim() ||
            !patient.lastName.trim() ||
            !patient.gender ||
            !patient.age.trim() ||
            !Number.isInteger(age) ||
            age < 0 ||
            age > 150 ||
            !patient.phone.trim() ||
            !emailPattern.test(patient.email.trim()) ||
            !patient.password ||
            patient.password.length < 4 ||
            patient.password !== patient.confirmPassword
        ) {
            Alert.alert('Validation', 'Complete all fields, use at least 4 password characters, and make sure both passwords match.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    name: `${patient.firstName.trim()} ${patient.lastName.trim()}`,
                    age: patient.age.trim(),
                    gender: patient.gender.trim(),
                    phone: patient.phone.trim(),
                    email: patient.email.trim(),
                    password: patient.password,
                }).toString(),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                Alert.alert('Registration failed', result.message || 'Unable to register patient.');
                return;
            }
            Alert.alert('Success', 'Patient registered successfully. You can now log in.');
        } catch {
            Alert.alert('Connection error', `Cannot reach the server at ${API_BASE_URL}.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.heading}>Patient Registration</Text>

                <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={patient.firstName}
                    onChangeText={(text) => handleChange('firstName', text)}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={patient.lastName}
                    onChangeText={(text) => handleChange('lastName', text)}
                />

                {/* Use fixed options so gender always matches the database constraint. */}
                <View style={styles.genderRow}>
                    {['Male', 'Female'].map((gender) => (
                        <TouchableOpacity
                            key={gender}
                            style={[styles.genderButton, patient.gender === gender && styles.genderButtonSelected]}
                            onPress={() => handleChange('gender', gender)}
                        >
                            <Text style={[styles.genderButtonText, patient.gender === gender && styles.genderButtonTextSelected]}>
                                {gender}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Age"
                    keyboardType="numeric"
                    value={patient.age}
                    onChangeText={(text) => handleChange('age', text)}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Phone"
                    keyboardType="phone-pad"
                    value={patient.phone}
                    onChangeText={(text) => handleChange('phone', text)}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    value={patient.email}
                    onChangeText={(text) => handleChange('email', text)}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={patient.password}
                    onChangeText={(text) => handleChange('password', text)}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    secureTextEntry
                    value={patient.confirmPassword}
                    onChangeText={(text) => handleChange('confirmPassword', text)}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={registerPatient}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register Patient</Text>}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default PatientRegistrationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 20,
    },

    formContainer: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: 420,
        marginTop: 30,
    },

    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1565C0',
        textAlign: 'center',
        marginVertical: 20,
    },

    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 15,
    },

    genderRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 15,
    },

    genderButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
    },

    genderButtonSelected: {
        backgroundColor: '#E3F2FD',
        borderColor: '#1565C0',
    },

    genderButtonText: {
        color: '#555',
        fontWeight: '600',
    },

    genderButtonTextSelected: {
        color: '#1565C0',
    },

    address: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 10,
    },

    button: {
        backgroundColor: '#1565C0',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 40,
    },

    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
