/**
 * Navigation Configuration
 * 
 * Sets up the main navigation structure for the application
 * Handles screen routing between:
 * - Home, About, Login screens (public)
 * - Patient Profile (protected - after login)
 * - Patient Registration
 * 
 * @component
 */

import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ==================== SCREEN IMPORTS ====================

import HomeScreen from "./screens/HomeScreen";
import AboutScreen from "./screens/AboutScreen";
import LoginScreen from "./screens/LoginScreen";
import PatientRegistrationScreen from "./screens/PatientRegistrationScreen";
import PatientProfileScreen from "./screens/PatientProfile";
import BookAppointmentScreen from "./screens/BookAppointmentScreen";
import ChangeAppointmentTimeScreen from "./screens/ChangeAppointmentTimeScreen";
import { useFeedback } from "../context/FeedbackContext";

// ==================== NAVIGATION SETUP ====================

const Stack = createNativeStackNavigator();

/**
 * Menu items displayed in the dropdown navigation menu
 * Each item maps to a screen defined in the Stack Navigator
 */
const menuItems = [
  { title: "Home", screen: "Home" },
  { title: "About", screen: "About" },
  { title: "Login", screen: "LoginScreen" },
  { title: "Course Dashboard", screen: "CourseDashboard" },
  { title: "Patient Profile", screen: "PatientProfile" }, // After login redirect goes here
  { title: "Patient Registration", screen: "PatientRegistrationScreen" },
  { title: "Book Appointment", screen: "BookAppointment" },
];

// ==================== MENU DROPDOWN COMPONENT ====================

/**
 * MenuDropdown Component
 * Provides hamburger menu navigation to all screens
 * Closes dropdown after selection
 * 
 * @param {Object} navigation - React Navigation object
 * @returns {JSX.Element} Menu dropdown UI
 */
function MenuDropdown({ navigation }: { navigation: any }) {
  // ==================== STATE ====================
  
  /** Controls dropdown visibility */
  const [menuOpen, setMenuOpen] = useState(false);

  // ==================== EVENT HANDLERS ====================

  /**
   * Navigates to selected screen and closes dropdown menu
   * @param {string} screenName - Name of screen to navigate to
   */
  const handleNavigate = (screenName: string) => {
    setMenuOpen(false);
    navigation.navigate(screenName);
  };

  // ==================== RENDER ====================

  return (
    <View style={styles.menuWrapper}>
      {/* Hamburger Menu Button */}
      <TouchableOpacity
        onPress={() => setMenuOpen((prev) => !prev)}
        style={styles.menuButton}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      {/* Dropdown Menu - Shows when menuOpen is true */}
      {menuOpen && (
        <View style={styles.dropdown}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={styles.dropdownItem}
              onPress={() => handleNavigate(item.screen)}
            >
              <Text style={styles.dropdownText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ==================== MAIN NAVIGATION COMPONENT ====================

/**
 * Navigation Component
 * Main navigation container and stack configuration
 * 
 * Screen Flow:
 * 1. Home → Initial screen
 * 2. LoginScreen → User authentication
 *    ↓ (on successful login)
 * 3. PatientProfile → User dashboard (with user data passed as params)
 * 4. PatientRegistrationScreen → New patient signup
 * 5. About → Application information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.theme - Navigation theme configuration
 * @param {Object} props.linking - Deep linking configuration
 * @param {Function} props.onReady - Callback when navigation is ready
 * @returns {JSX.Element} Navigation container with stack navigator
 */
export default function Navigation({
  theme,
  linking,
  onReady,
}: {
  theme?: any;
  linking?: any;
  onReady?: any;
}) {
  const { user, isAuthLoading } = useFeedback();

  if (isAuthLoading) {
    return null;
  }

  return (
    <NavigationContainer
      theme={theme}
      linking={linking}
      onReady={onReady}
    >
      <Stack.Navigator
        initialRouteName={user ? "PatientProfile" : "Home"}
        screenOptions={({ navigation }) => ({
          // ==================== HEADER STYLING ====================
          
          headerStyle: {
            backgroundColor: "#000000", // Black header background
          },
          headerTintColor: "#FFFFFF", // White text and icons
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 20,
          },
          headerTitleAlign: "center", // Center the screen title
          
          // ==================== HEADER COMPONENTS ====================
          
          // Left header - Menu dropdown
          headerLeft: () => <MenuDropdown navigation={navigation} />,
          
          // Right header - Settings button
          headerRight: () => (
            <TouchableOpacity
              onPress={() => alert("Settings clicked")}
              style={{ marginRight: 12 }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 22 }}>⚙️</Text>
            </TouchableOpacity>
          ),
        })}
      >
        {/* ==================== PUBLIC SCREENS ==================== */}
        
        {/* Home Screen - Initial landing page */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Home" }}
        />

        {/* About Screen - Application information */}
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ title: "About" }}
        />
        
        {/* ==================== AUTHENTICATION FLOW ==================== */}
        
        {/* Login Screen - User authentication */}
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ title: "Login" }}
        />

        {/* Patient Registration Screen - New patient signup */}
        <Stack.Screen
          name="PatientRegistrationScreen"
          component={PatientRegistrationScreen}
          options={{ title: "Patient Registration" }}
        />
        
        {/* ==================== PROTECTED SCREENS ==================== */}
        
        {/* 
         * Patient Profile Screen - Main dashboard after login
         * Receives user data from LoginScreen via navigation params
         * Accessed via: navigation.replace('PatientProfile', { user })
         */}
        <Stack.Screen
          name="PatientProfile"
          component={PatientProfileScreen}
          options={{ title: "Patient Profile" }}
        />

        {/* 
         * Book Appointment Screen - Allows patients to book new appointments
         * Accessed via: navigation.navigate('BookAppointment', { user })
         */}
        <Stack.Screen
          name="BookAppointment"
          component={BookAppointmentScreen}
          options={{ title: "Book Appointment" }}
        />

        <Stack.Screen
          name="ChangeAppointmentTime"
          component={ChangeAppointmentTimeScreen}
          options={{ title: "Change Appointment Time" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  // ==================== MENU WRAPPER ====================
  
  // Container for hamburger menu button
  menuWrapper: {
    position: "relative",
    marginLeft: 12,
  },

  // Hamburger menu button styling
  menuButton: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  // Hamburger menu icon (☰)
  menuIcon: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
  },

  // ==================== DROPDOWN MENU ====================

  // Dropdown container - positioned below hamburger menu
  dropdown: {
    position: "absolute",
    top: 42, // Position below menu button
    left: 0,
    width: 220,
    backgroundColor: "#111111", // Dark background
    borderRadius: 10,
    paddingVertical: 8,
    
    // Shadow styling for depth
    elevation: 8, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 1000, // Ensure dropdown appears on top
  },

  // Individual menu item styling
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A", // Subtle divider
  },

  // Menu item text styling
  dropdownText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
});
