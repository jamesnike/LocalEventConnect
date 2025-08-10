import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LandingScreenProps {
  navigation: any;
}

export default function LandingScreen({ navigation }: LandingScreenProps) {
  const handleLogin = () => {
    // TODO: Implement login navigation
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    // TODO: Implement signup navigation
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="calendar" size={48} color="#007AFF" />
          <Text style={styles.logoText}>EventConnect</Text>
        </View>
        <Text style={styles.tagline}>Discover amazing events near you</Text>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroImage}>
          <Ionicons name="people" size={120} color="#007AFF" />
        </View>
        <Text style={styles.heroTitle}>Connect Through Events</Text>
        <Text style={styles.heroDescription}>
          Join exciting events, meet new people, and create unforgettable memories. 
          Whether you're into music, sports, food, or technology, there's something for everyone.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="heart" size={32} color="#34C759" />
          </View>
          <Text style={styles.featureTitle}>Swipe & Discover</Text>
          <Text style={styles.featureDescription}>
            Swipe through events to find what interests you
          </Text>
        </View>

        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="calendar" size={32} color="#FF9500" />
          </View>
          <Text style={styles.featureTitle}>Easy RSVP</Text>
          <Text style={styles.featureDescription}>
            Quickly RSVP to events with just a tap
          </Text>
        </View>

        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="people-circle" size={32} color="#AF52DE" />
          </View>
          <Text style={styles.featureTitle}>Meet People</Text>
          <Text style={styles.featureDescription}>
            Connect with like-minded people at events
          </Text>
        </View>
      </View>

      {/* CTA Buttons */}
      <View style={styles.ctaSection}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleSignup}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
          <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  heroImage: {
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  ctaSection: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
