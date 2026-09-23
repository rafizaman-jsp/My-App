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
  Modal,
  Pressable,
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
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import DoctorDashboardScreen from "./screens/DoctorDashboardScreen";
import AdminDashboardScreen from "./screens/AdminDashboardScreen";
import AdminOverviewScreen from "./screens/AdminOverviewScreen";
import AdminDoctorsScreen from "./screens/AdminDoctorsScreen";
import AdminAddDoctorScreen from "./screens/AdminAddDoctorScreen";
import AdminEditDoctorScreen from "./screens/AdminEditDoctorScreen";
import AdminAddAdminScreen from "./screens/AdminAddAdminScreen";
import AdminRecordsScreen from "./screens/AdminRecordsScreen";
import { useFeedback } from "../context/FeedbackContext";
import { useAuth } from "../context/AuthContext";

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
  { title: "Patient Profile", screen: "PatientProfile" }, // After login redirect goes here
  { title: "Patient Registration", screen: "PatientRegistrationScreen" },
  { title: "Book Appointment", screen: "BookAppointment" },
  { title: "Change Password", screen: "ChangePassword" },
  { title: "Doctor Dashboard", screen: "DoctorDashboard" },
  { title: "Admin Dashboard", screen: "AdminDashboard" },
  { title: "Manage Doctors", screen: "AdminDoctors" },
  { title: "Add Administrator", screen: "AdminAddAdmin" },
  { title: "Patients", screen: "AdminPatients" },
  { title: "Appointments", screen: "AdminAppointments" },
  { title: "Feedback", screen: "AdminFeedback" },
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

  const { user, setUser } = useAuth();

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

  // ==================== Logout Handler ====================
  const handleLogout = async () => {
    setMenuOpen(false);

    await setUser(null);

    navigation.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  };

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.screen === "PatientProfile" || item.screen === "BookAppointment") {
      return user?.role === "patient";
    }
    if (item.screen === "DoctorDashboard") return user?.role === "doctor";
    if (item.screen === "AdminDashboard") return user?.role === "admin";
    if (item.screen === "AdminDoctors" || item.screen === "AdminAddAdmin" || item.screen.startsWith("Admin")) return user?.role === "admin";
    if (item.screen === "ChangePassword") return Boolean(user);
    return item.screen !== "LoginScreen" || !user;
  });

  // ==================== RENDER ====================

  return (
    <View style={styles.menuWrapper}>
      {/* Hamburger Menu Button */}
      <TouchableOpacity
        onPress={() => setMenuOpen((prev) => !prev)}
        style={styles.menuButton}
        accessibilityLabel="Open navigation menu"
        accessibilityRole="button"
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      {/* Dropdown Menu - Shows when menuOpen is true */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuOpen(false)}
        >
          <View style={styles.dropdown}>
            {visibleMenuItems.map((item) => (
              <TouchableOpacity
                key={item.screen}
                style={styles.dropdownItem}
                onPress={() => handleNavigate(item.screen)}
              >
                <Text style={styles.dropdownText}>{item.title}</Text>
              </TouchableOpacity>
            ))}

            {user ? (
              <TouchableOpacity
                style={styles.logoutMenuItem}
                onPress={handleLogout}
              >
                <Text style={styles.logoutMenuText}>Log out</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function BackButton({ navigation }: { navigation: any }) {
  if (!navigation.canGoBack()) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={styles.backButton}
      accessibilityLabel="Go back"
      accessibilityRole="button"
    >
      <Text style={styles.backIcon}>‹</Text>
    </TouchableOpacity>
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
  const { user, isAuthLoading } = useAuth();

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
        initialRouteName={!user ? "Home" : user.role === "patient" ? "PatientProfile" : user.role === "doctor" ? "DoctorDashboard" : "AdminDashboard"}
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

          // Left header - Back navigation
          headerLeft: () => <BackButton navigation={navigation} />,

          // Right header - Menu dropdown
          headerRight: () => <MenuDropdown navigation={navigation} />,

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

        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{ title: "Change Password" }}
        />

        <Stack.Screen
          name="DoctorDashboard"
          component={DoctorDashboardScreen}
          options={{ title: "Doctor Dashboard" }}
        />

        <Stack.Screen
          name="AdminDashboard"
          component={AdminOverviewScreen}
          options={{ title: "Admin Dashboard" }}
        />
        <Stack.Screen name="AdminDoctors" component={AdminDoctorsScreen} options={{ title: "Manage Doctors" }} />
        <Stack.Screen name="AdminAddDoctor" component={AdminAddDoctorScreen} options={{ title: "Add Doctor" }} />
        <Stack.Screen name="AdminEditDoctor" component={AdminEditDoctorScreen} options={{ title: "Edit Doctor" }} />
        <Stack.Screen name="AdminAddAdmin" component={AdminAddAdminScreen} options={{ title: "Add Administrator" }} />
        <Stack.Screen name="AdminRecords" component={AdminRecordsScreen} initialParams={{ type: 'patients' }} options={{ title: "Admin Records" }} />
        <Stack.Screen name="AdminPatients" component={AdminRecordsScreen} initialParams={{ type: 'patients' }} options={{ title: "Patients" }} />
        <Stack.Screen name="AdminAppointments" component={AdminRecordsScreen} initialParams={{ type: 'appointments' }} options={{ title: "Appointments" }} />
        <Stack.Screen name="AdminFeedback" component={AdminRecordsScreen} initialParams={{ type: 'feedback' }} options={{ title: "Feedback" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  // ==================== MENU WRAPPER ====================

  // Container for hamburger menu button
  menuWrapper: {
    marginRight: 12,
  },

  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },

  backIcon: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "300",
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

  menuOverlay: {
    flex: 1,
    paddingTop: 48,
    paddingRight: 12,
    alignItems: "flex-end",
    backgroundColor: "transparent",
  },

  // Dropdown container - positioned below hamburger menu
  dropdown: {
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
  
  // Logout menu item styling
  logoutMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#444444",
  },

  logoutMenuText: {
    color: "#FF5252",
    fontSize: 15,
    fontWeight: "bold",
  },
});
