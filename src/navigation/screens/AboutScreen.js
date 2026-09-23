

import { Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

export default function AboutScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>About CityCare General Hospital</Text>
      <Text style={styles.text}>
        CityCare General Hospital provides reliable, compassionate healthcare with experienced
        doctors, modern diagnostic facilities, and a simple appointment experience.
      </Text>
      <Text style={styles.text}>
        Patients can view doctors, check availability, book appointments, and manage their visits
        from one secure application.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#F5F7FA",
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#123B5D",
  },
  text: {
    fontSize: 16,
    lineHeight: 25,
    color: "#475569",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#1565C0",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
