/**
 * HomeScreen Component
 * 
 * Main landing page displaying:
 * - Hospital hero section with key messages
 * - About the hospital information
 * - List of available doctors with details
 * - Contact and footer information
 * 
 * Mirrors the JSP Home.jsp implementation
 * 
 * @component
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Linking,
  ActivityIndicator,
  Platform,
} from "react-native";

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
  contact?: string;
  email?: string;
  startTime?: string;
  finishTime?: string;
}

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
}

// ==================== COMPONENT ====================

export default function HomeScreen({ navigation }: { navigation: any }) {
  // ==================== STATE MANAGEMENT ====================

  /** List of doctors fetched from backend */
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  /** Loading state */
  const [loading, setLoading] = useState(true);

  /** Current hero slide index */
  const [currentSlide, setCurrentSlide] = useState(0);

  // ==================== HERO SLIDES DATA ====================

  const heroSlides: HeroSlide[] = [
    {
      id: 1,
      title: "Compassionate Care, Every Day",
      subtitle: "Trusted by patients for quality treatment and modern medical support.",
    },
    {
      id: 2,
      title: "Experienced Doctors",
      subtitle: "Book appointments with specialists and receive timely care.",
    },
    {
      id: 3,
      title: "Advanced Facilities",
      subtitle: "Enjoy a seamless experience from booking to recovery.",
    },
  ];

  // ==================== EFFECTS ====================

  /**
   * Fetch doctors when component mounts
   */
  useEffect(() => {
    fetchDoctors();
  }, []);

  /**
   * Auto-rotate hero slides every 5 seconds
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

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
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== EVENT HANDLERS ====================

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  // ==================== SUB-COMPONENTS ====================

  /**
   * Doctor Card Component
   */
  const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
    <View style={styles.doctorCard}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderIcon}>👨‍⚕️</Text>
        <Text style={styles.doctorName}>{doctor.name}</Text>
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        {/* Specialization */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🔬 Specialization:</Text>
          <Text style={styles.infoValue}>{doctor.specialization}</Text>
        </View>

        {/* Contact */}
        {doctor.contact && (
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => handlePhonePress(doctor.contact || '')}
          >
            <Text style={styles.infoLabel}>📞 Phone:</Text>
            <Text style={[styles.infoValue, styles.linkText]}>{doctor.contact}</Text>
          </TouchableOpacity>
        )}

        {/* Email */}
        {doctor.email && (
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => handleEmailPress(doctor.email || '')}
          >
            <Text style={styles.infoLabel}>✉️ Email:</Text>
            <Text style={[styles.infoValue, styles.linkText]}>{doctor.email}</Text>
          </TouchableOpacity>
        )}

        {/* Schedule */}
        {(doctor.startTime || doctor.finishTime) && (
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleLabel}>🕐 Schedule:</Text>
            <Text style={styles.scheduleValue}>
              {doctor.startTime} - {doctor.finishTime}
            </Text>
          </View>
        )}
      </View>

      {/* Card Footer - Book Appointment Button */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() =>
          navigation.navigate('BookAppointment', { selectedDoctorId: doctor.id })
        }
      >
        <Text style={styles.bookButtonText}>📅 Book Appointment</Text>
      </TouchableOpacity>
    </View>
  );

  // ==================== RENDER ====================

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ===== HERO SECTION ===== */}
      <View style={styles.heroSection}>
        {/* Hero Slide */}
        <View style={styles.heroSlide}>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{heroSlides[currentSlide].title}</Text>
            <Text style={styles.heroSubtitle}>{heroSlides[currentSlide].subtitle}</Text>
          </View>
        </View>

        {/* Slide Navigation Buttons */}
        <View style={styles.sliderNavigation}>
          <TouchableOpacity style={styles.sliderButton} onPress={prevSlide}>
            <Text style={styles.sliderButtonText}>◀ Prev</Text>
          </TouchableOpacity>

          {/* Slide Indicators */}
          <View style={styles.sliderDots}>
            {heroSlides.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dot,
                  index === currentSlide && styles.dotActive,
                ]}
                onPress={() => setCurrentSlide(index)}
              >
                <Text style={styles.dotText}>{index === currentSlide ? '●' : '○'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.sliderButton} onPress={nextSlide}>
            <Text style={styles.sliderButtonText}>Next ▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== ABOUT SECTION ===== */}
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>About Our Hospital</Text>
        <Text style={styles.aboutText}>
          CityCare General Hospital provides modern, reliable and compassionate healthcare
          services. Our expert doctors and advanced facilities ensure quality treatment and
          patient safety.
        </Text>
      </View>

      {/* ===== DOCTORS SECTION ===== */}
      <View style={styles.doctorsSection}>
        <Text style={styles.sectionTitle}>Available Doctors</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1565C0" />
            <Text style={styles.loadingText}>Loading doctors...</Text>
          </View>
        ) : doctors.length > 0 ? (
          <FlatList
            data={doctors}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <DoctorCard doctor={item} />}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.noDoctorsContainer}>
            <Text style={styles.noDoctorsText}>No doctors available</Text>
          </View>
        )}
      </View>

      {/* ===== CONTACT & FOOTER SECTION ===== */}
      <View style={styles.footerSection}>
        <Text style={styles.sectionTitle}>Contact Us</Text>

        {/* Address */}
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>📍 Location:</Text>
          <Text style={styles.footerText}>Narayanganj, Dhaka, Bangladesh</Text>
        </View>

        {/* Email */}
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => handleEmailPress('info@pmsystem.com')}
        >
          <Text style={styles.footerLabel}>📧 Email:</Text>
          <Text style={[styles.footerText, styles.linkText]}>info@pmsystem.com</Text>
        </TouchableOpacity>

        {/* Phone */}
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => handlePhonePress('+880-1234-567890')}
        >
          <Text style={styles.footerLabel}>☎️ Phone:</Text>
          <Text style={[styles.footerText, styles.linkText]}>+880-1234-567890</Text>
        </TouchableOpacity>

        {/* Hours */}
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>🕐 Service Hours:</Text>
          <Text style={styles.footerText}>Saturday – Thursday</Text>
          <Text style={styles.footerText}>8:00 AM – 10:00 PM</Text>
          <Text style={styles.footerText}>Emergency Support 24/7</Text>
        </View>

        {/* Social Links */}
        <View style={styles.socialLinks}>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://facebook.com')}
            style={styles.socialButton}
          >
            <Text style={styles.socialButtonText}>f Facebook</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://instagram.com')}
            style={styles.socialButton}
          >
            <Text style={styles.socialButtonText}>📷 Instagram</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://linkedin.com')}
            style={styles.socialButton}
          >
            <Text style={styles.socialButtonText}>in LinkedIn</Text>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © 2025 CityCare Hospital - Patient Management System
        </Text>
      </View>
    </ScrollView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // ===== HERO SECTION =====

  heroSection: {
    marginBottom: 20,
  },

  heroSlide: {
    height: 220,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroOverlay: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },

  heroSubtitle: {
    fontSize: 16,
    color: '#e3f2fd',
    textAlign: 'center',
  },

  sliderNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  sliderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1565C0',
    borderRadius: 6,
  },

  sliderButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  sliderDots: {
    flexDirection: 'row',
    gap: 12,
  },

  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },

  dotActive: {
    backgroundColor: '#1565C0',
  },

  dotText: {
    fontSize: 16,
    color: '#1565C0',
  },

  // ===== ABOUT SECTION =====

  aboutSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 15,
  },

  aboutText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },

  // ===== DOCTORS SECTION =====

  doctorsSection: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  doctorCard: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#1565C0',
  },

  cardHeaderIcon: {
    fontSize: 28,
    marginRight: 12,
  },

  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1565C0',
    flex: 1,
  },

  cardBody: {
    padding: 15,
  },

  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },

  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
    minWidth: 120,
  },

  infoValue: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },

  linkText: {
    color: '#1565C0',
    textDecorationLine: 'underline',
  },

  scheduleInfo: {
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },

  scheduleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },

  scheduleValue: {
    fontSize: 12,
    color: '#666',
  },

  bookButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
    alignItems: 'center',
  },

  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },

  noDoctorsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },

  noDoctorsText: {
    fontSize: 14,
    color: '#999',
  },

  // ===== FOOTER SECTION =====

  footerSection: {
    backgroundColor: '#1565C0',
    paddingHorizontal: 20,
    paddingVertical: 25,
    marginTop: 20,
  },

  footerItem: {
    marginBottom: 20,
  },

  footerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E3F2FD',
    marginBottom: 5,
  },

  footerText: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 3,
  },

  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    marginHorizontal: -20,
    marginBottom: 20,
  },

  socialButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },

  socialButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  copyright: {
    textAlign: 'center',
    fontSize: 12,
    color: '#B3E5FC',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
});
