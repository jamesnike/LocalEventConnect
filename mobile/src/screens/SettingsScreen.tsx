import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    locationServices: true,
    darkMode: false,
    autoRefresh: true,
    dataSaver: false,
    soundEffects: true,
    hapticFeedback: true,
  });

  const handleToggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    
    Alert.alert(
      'Setting Updated',
      `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} has been updated.`
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://eventconnect.com/privacy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://eventconnect.com/terms');
  };

  const openSupport = () => {
    Linking.openURL('mailto:support@eventconnect.com');
  };

  const renderSettingItem = ({ title, description, value, onToggle, icon, type = 'switch' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <TouchableOpacity onPress={onToggle}>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Notifications */}
      {renderSection({
        title: 'Notifications',
        children: (
          <>
            {renderSettingItem({
              title: 'Push Notifications',
              description: 'Receive notifications for events and updates',
              value: settings.pushNotifications,
              onToggle: () => handleToggleSetting('pushNotifications'),
              icon: 'notifications-outline',
            })}
            {renderSettingItem({
              title: 'Email Notifications',
              description: 'Receive email updates about events',
              value: settings.emailNotifications,
              onToggle: () => handleToggleSetting('emailNotifications'),
              icon: 'mail-outline',
            })}
          </>
        ),
      })}

      {/* App Preferences */}
      {renderSection({
        title: 'App Preferences',
        children: (
          <>
            {renderSettingItem({
              title: 'Dark Mode',
              description: 'Use dark theme throughout the app',
              value: settings.darkMode,
              onToggle: () => handleToggleSetting('darkMode'),
              icon: 'moon-outline',
            })}
            {renderSettingItem({
              title: 'Auto Refresh',
              description: 'Automatically refresh event data',
              value: settings.autoRefresh,
              onToggle: () => handleToggleSetting('autoRefresh'),
              icon: 'refresh-outline',
            })}
            {renderSettingItem({
              title: 'Data Saver',
              description: 'Reduce data usage and improve performance',
              value: settings.dataSaver,
              onToggle: () => handleToggleSetting('dataSaver'),
              icon: 'cellular-outline',
            })}
          </>
        ),
      })}

      {/* Features */}
      {renderSection({
        title: 'Features',
        children: (
          <>
            {renderSettingItem({
              title: 'Location Services',
              description: 'Use your location to find nearby events',
              value: settings.locationServices,
              onToggle: () => handleToggleSetting('locationServices'),
              icon: 'location-outline',
            })}
            {renderSettingItem({
              title: 'Sound Effects',
              description: 'Play sounds for interactions',
              value: settings.soundEffects,
              onToggle: () => handleToggleSetting('soundEffects'),
              icon: 'volume-high-outline',
            })}
            {renderSettingItem({
              title: 'Haptic Feedback',
              description: 'Vibrate on interactions',
              value: settings.hapticFeedback,
              onToggle: () => handleToggleSetting('hapticFeedback'),
              icon: 'phone-portrait-outline',
            })}
          </>
        ),
      })}

      {/* Support & Legal */}
      {renderSection({
        title: 'Support & Legal',
        children: (
          <>
            {renderSettingItem({
              title: 'Privacy Policy',
              description: 'Read our privacy policy',
              value: false,
              onToggle: openPrivacyPolicy,
              icon: 'shield-outline',
              type: 'link',
            })}
            {renderSettingItem({
              title: 'Terms of Service',
              description: 'Read our terms of service',
              value: false,
              onToggle: openTermsOfService,
              icon: 'document-text-outline',
              type: 'link',
            })}
            {renderSettingItem({
              title: 'Contact Support',
              description: 'Get help from our support team',
              value: false,
              onToggle: openSupport,
              icon: 'help-circle-outline',
              type: 'link',
            })}
          </>
        ),
      })}

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Build</Text>
          <Text style={styles.infoValue}>2024.1.1</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Platform</Text>
          <Text style={styles.infoValue}>React Native</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#ff4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userSection: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: '600',
    marginLeft: 10,
  },
}); 