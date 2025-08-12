import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  const handleLogin = () => {
    login('testuser@example.com', 'testpassword');
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

  const handleGenerateAISignature = () => {
    Alert.alert('AI Signature', 'Generate new AI signature feature coming soon!');
  };

  const handleEditProfile = () => {
    // TODO: Implement edit profile functionality
    Alert.alert('Edit Profile', 'Edit profile feature coming soon!');
  };

  const handleEditInterests = () => {
    // TODO: Implement edit interests functionality
    Alert.alert('Edit Interests', 'Edit interests feature coming soon!');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#666" />
          <Text style={styles.authTitle}>Welcome to EventConnect</Text>
          <Text style={styles.authSubtitle}>
            Sign in to access your profile and manage your events
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const eventHistory = [
    { id: 1, name: 'Sustainable Living W...', icon: 'musical-notes' as const, type: 'Hosted' },
    { id: 2, name: 'Mindful Parenting Wo...', icon: 'musical-notes' as const, type: 'Hosted' },
    { id: 3, name: 'Basketball Skills Clinic', icon: 'heart' as const, type: 'Hosted' },
    { id: 4, name: 'Farmers Market & Co...', icon: 'leaf' as const, type: 'Hosted' },
    { id: 5, name: 'Tech Talk: AI and the ...', icon: 'desktop' as const, type: 'Hosted' },
    { id: 6, name: 'Live Jazz Performanc...', icon: 'musical-notes' as const, type: 'Hosted' },
  ];

  const interests = ['sports', 'arts', 'boardgames'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <Text style={styles.pageTitle}>Profile</Text>

        {/* Profile Card - Pink Background */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user?.profileImageUrl ? (
                <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#fff" />
                </View>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
                  <Ionicons name="pencil" size={16} color="#FF69B4" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.locationRow}>
                <Text style={styles.location}>
                  Redwood City, California
                </Text>
                <Ionicons name="paper-plane" size={16} color="#FF69B4" />
              </View>
            </View>
          </View>

          {/* AI Signature */}
          <View style={styles.aiSignatureContainer}>
            <Text style={styles.aiSignatureText}>
              "Pogo-stick Picasso, rolling dice with curious kangaroos."
            </Text>
          </View>

          {/* Generate New AI Signature Button */}
          <TouchableOpacity style={styles.generateSignatureButton} onPress={handleGenerateAISignature}>
            <Ionicons name="star" size={16} color="#FF69B4" />
            <Text style={styles.generateSignatureText}>Generate New AI Signature</Text>
          </TouchableOpacity>
        </View>

        {/* Event History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event History</Text>
          <View style={styles.eventHistoryGrid}>
            {eventHistory.map((event) => (
              <TouchableOpacity key={event.id} style={styles.eventHistoryItem}>
                <View style={styles.eventIconContainer}>
                  <Ionicons name={event.icon} size={20} color="#8B5CF6" />
                </View>
                <View style={styles.eventHistoryInfo}>
                  <Text style={styles.eventHistoryName}>{event.name}</Text>
                  <Text style={styles.eventHistoryType}>{event.type}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <View style={styles.interestsHeader}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <TouchableOpacity onPress={handleEditInterests}>
              <Text style={styles.editInterestsButton}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.interestsContainer}>
            {interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ff4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#FF69B4',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  aiSignatureContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  aiSignatureText: {
    fontSize: 14,
    color: '#fff',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  generateSignatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  generateSignatureText: {
    color: '#FF69B4',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  interestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editInterestsButton: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: '600',
  },
  eventHistoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventHistoryItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventHistoryInfo: {
    flex: 1,
  },
  eventHistoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventHistoryType: {
    fontSize: 12,
    color: '#666',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
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