import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';

const PatientRegistrationScreen = () => {
    const [patient, setPatient] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        age: '',
        phone: '',
        email: '',
        address: '',
        bloodGroup: '',
    });

    const handleChange = (key: string, value: string) => {
        setPatient({ ...patient, [key]: value });
    };

    const registerPatient = () => {
        if (
            !patient.firstName ||
            !patient.lastName ||
            !patient.phone
        ) {
            Alert.alert('Validation', 'Please fill all required fields.');
            return;
        }

        // TODO: Connect with backend API
        Alert.alert('Success', 'Patient Registered Successfully');
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

                <TextInput
                    style={styles.input}
                    placeholder="Gender"
                    value={patient.gender}
                    onChangeText={(text) => handleChange('gender', text)}
                />

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
                    placeholder="Blood Group"
                    value={patient.bloodGroup}
                    onChangeText={(text) => handleChange('bloodGroup', text)}
                />

                <TextInput
                    style={[styles.input, styles.address]}
                    placeholder="Address"
                    multiline
                    value={patient.address}
                    onChangeText={(text) => handleChange('address', text)}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={registerPatient}
                >
                    <Text style={styles.buttonText}>Register Patient</Text>
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