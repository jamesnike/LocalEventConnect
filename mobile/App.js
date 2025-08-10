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
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack Navigator
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="EventContent" component={EventContentScreen} />
    </Stack.Navigator>
  );
}

// Browse Stack Navigator
function BrowseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrowseMain" component={BrowseScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="EventContent" component={EventContentScreen} />
    </Stack.Navigator>
  );
}

// My Events Stack Navigator
function MyEventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyEventsMain" component={MyEventsScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="EventContent" component={EventContentScreen} />
    </Stack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Browse') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'MyEvents') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8e8e93',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          paddingBottom: 20,
          paddingTop: 10,
          height: 90,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
      screenListeners={{
        tabPress: (e) => {
          const routeName = e.target?.split('-')[0];
          setActiveTab(routeName?.toLowerCase() || 'home');
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Browse" component={BrowseStack} />
      <Tab.Screen name="MyEvents" component={MyEventsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// HomeScreen is now imported from './src/screens/HomeScreen'

// BrowseScreen is now imported from './src/screens/BrowseScreen'

// MyEventsScreen is now imported from './src/screens/MyEventsScreen'

function ProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      
      <View style={styles.profileContent}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileInitial}>U</Text>
        </View>
        <Text style={styles.profileName}>User Name</Text>
        <Text style={styles.profileEmail}>user@example.com</Text>
        
        <View style={styles.profileActions}>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="settings" size={20} color="#007AFF" />
            <Text style={styles.profileButtonText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="help-circle" size={20} color="#007AFF" />
            <Text style={styles.profileButtonText}>Help</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRsvp = async (status) => {
    setLoading(true);
    try {
      const response = await fetch(`https://LocalEventConnect.jamesnikess.repl.co/api/events/${event.id}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setRsvpStatus(status);
        Alert.alert('Success', `You ${status === 'going' ? 'are going' : 'declined'} this event!`);
      } else {
        Alert.alert('Error', 'Failed to RSVP to event');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <EventDetailCard
      event={event}
      onRsvp={handleRsvp}
      onBack={() => navigation.goBack()}
      rsvpStatus={rsvpStatus}
      loading={loading}
    />
  );
}

function CreateEventScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.title}>Create Event</Text>
      </View>
      
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>➕</Text>
        <Text style={styles.emptyStateTitle}>Create Event</Text>
        <Text style={styles.emptyStateText}>
          Event creation coming soon!
        </Text>
      </View>
    </SafeAreaView>
  );
}

function SettingsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>⚙️</Text>
        <Text style={styles.emptyStateTitle}>Settings</Text>
        <Text style={styles.emptyStateText}>
          Settings coming soon!
        </Text>
      </View>
    </SafeAreaView>
  );
}

function HelpScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.title}>Help</Text>
      </View>
      
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>❓</Text>
        <Text style={styles.emptyStateTitle}>Help</Text>
        <Text style={styles.emptyStateText}>
          Help content coming soon!
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
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  swipeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  eventsList: {
    flex: 1,
    padding: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventImageText: {
    fontSize: 24,
    color: '#999',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  eventCategory: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
  profileContent: {
    flex: 1,
    alignItems: 'center',
    padding: 40,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  profileActions: {
    width: '100%',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
  },
  profileButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 12,
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}
