import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

// Import our custom components
import SwipeCard from './src/components/SwipeCard';
import EventDetailCard from './src/components/EventDetailCard';
import BottomNav from './src/components/BottomNav';
import CategoryFilter from './src/components/CategoryFilter';
import EventContentCard from './src/components/EventContentCard';
import EventDetail from './src/components/EventDetail';
import CreateEvent from './src/components/CreateEvent';

// Import our screens
import HomeScreen from './src/screens/HomeScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import MyEventsScreen from './src/screens/MyEventsScreen';
import EventContentScreen from './src/screens/EventContentScreen';
import LandingScreen from './src/screens/LandingScreen';
import NotFoundScreen from './src/screens/NotFoundScreen';
import ProfileScreen from './src/screens/ProfileScreen';



// Main App Component with Custom Navigation
function MainApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateEvent = () => {
    setShowCreateEvent(true);
  };

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'browse':
        return (
          <View style={styles.screenContainer}>
            <Text style={styles.screenTitle}>Browse Screen</Text>
            <Text>This is the Browse tab content</Text>
          </View>
        );
      case 'my-events':
        return <MyEventsScreen />;
      case 'profile':
        return (
          <View style={styles.screenContainer}>
            <Text style={styles.screenTitle}>Profile Screen</Text>
            <Text>This is the Profile tab content</Text>
          </View>
        );
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Main Content */}
      <View style={styles.content}>

        {renderCurrentScreen()}
      </View>

      {/* Custom Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onCreateEvent={handleCreateEvent}
      />

      {/* Create Event Modal */}
      {showCreateEvent && (
        <CreateEvent
          onClose={() => setShowCreateEvent(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingBottom: 100, // Add padding to account for bottom navigation
  },

  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
});

export default function App() {
  return <MainApp />;
}
