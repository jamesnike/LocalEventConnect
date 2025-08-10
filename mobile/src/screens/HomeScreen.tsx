import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import EventDetailCard from '../components/EventDetailCard';
import EventContentCard from '../components/EventContentCard';
import EventDetail from '../components/EventDetail';
import CreateEvent from '../components/CreateEvent';
import { apiRequest, API_CONFIG } from '../config/api';
import AnimeAvatar from '../components/AnimeAvatar';
import BottomNav from '../components/BottomNav';
import SwipeCard from '../components/SwipeCard';

const { width: screenWidth } = Dimensions.get('window');

// Mock event data for development
const mockEvents = [
  {
    id: '1',
    title: 'Tech Meetup 2024',
    description: 'Join us for an exciting evening of networking and tech talks. Learn about the latest trends in AI, machine learning, and web development.',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    date: '2024-02-15',
    time: '18:00',
    location: 'San Francisco, CA',
    category: 'tech',
    subCategory: 'AI & ML',
    attendees: 45,
    maxAttendees: 100,
    price: 25,
    isFree: false,
    organizer: {
      name: 'Tech Community SF',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      location: 'San Francisco, CA',
    },
    tags: ['AI', 'Machine Learning', 'Networking', 'Tech Talks'],
  },
  {
    id: '2',
    title: 'Art Gallery Opening',
    description: 'Experience the vibrant world of contemporary art at our exclusive gallery opening. Meet local artists and enjoy live music.',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    date: '2024-02-20',
    time: '19:00',
    location: 'Los Angeles, CA',
    category: 'arts',
    subCategory: 'Contemporary',
    attendees: 78,
    maxAttendees: 150,
    price: 0,
    isFree: true,
    organizer: {
      name: 'LA Art Collective',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      location: 'Los Angeles, CA',
    },
    tags: ['Art', 'Gallery', 'Contemporary', 'Live Music'],
  },
  {
    id: '3',
    title: 'Food Festival',
    description: 'Taste the best local cuisine from top chefs and food trucks. Live cooking demonstrations and food competitions.',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    date: '2024-02-25',
    time: '12:00',
    location: 'Austin, TX',
    category: 'food',
    subCategory: 'Street Food',
    attendees: 120,
    maxAttendees: 200,
    price: 15,
    isFree: false,
    organizer: {
      name: 'Austin Food Network',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      location: 'Austin, TX',
    },
    tags: ['Food', 'Festival', 'Local Cuisine', 'Cooking'],
  },
];

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [events, setEvents] = useState(mockEvents);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load events from API when component mounts
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/events');
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.log('Using mock events for development');
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // User is interested - show event detail
      setShowEventDetail(true);
    } else {
      // User is not interested - move to next event
      moveToNextEvent();
    }
  };

  const moveToNextEvent = () => {
    setCurrentEventIndex((prev) => (prev + 1) % events.length);
  };

  const handleEventPress = () => {
    setShowEventDetail(true);
  };

  const handleCloseEventDetail = () => {
    setShowEventDetail(false);
  };

  const handleJoinEvent = () => {
    Alert.alert('Success', 'You have joined the event!');
    setShowEventDetail(false);
    moveToNextEvent();
  };

  const handleShareEvent = () => {
    Alert.alert('Share', 'Sharing event...');
  };

  const handleCreateEvent = () => {
    setShowCreateEvent(true);
  };

  const handleCloseCreateEvent = () => {
    setShowCreateEvent(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </SafeAreaView>
    );
  }

  if (events.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <AnimeAvatar
                seed={user?.animeAvatarSeed || 'default'}
                size={50}
                customUrl={user?.customAvatarUrl}
              />
              <View style={styles.userText}>
                <Text style={styles.greeting}>Hello, {user?.firstName || 'there'}!</Text>
                {user?.aiSignature && (
                  <Text style={styles.aiSignature}>{user.aiSignature}</Text>
                )}
                {user?.location && (
                  <Text style={styles.location}>{user.location}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No events available</Text>
          <Text style={styles.emptyDescription}>
            Check back later for new events or create your own!
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.createButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>

        <BottomNav navigation={navigation} activeTab="home" />
      </SafeAreaView>
    );
  }

  const currentEvent = events[currentEventIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <AnimeAvatar
              seed={user?.animeAvatarSeed || 'default'}
              size={50}
              customUrl={user?.customAvatarUrl}
            />
            <View style={styles.userText}>
              <Text style={styles.greeting}>Hello, {user?.firstName || 'there'}!</Text>
              {user?.aiSignature && (
                <Text style={styles.aiSignature}>{user.aiSignature}</Text>
              )}
              {user?.location && (
                <Text style={styles.location}>{user.location}</Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Swipe Card */}
        <View style={styles.swipeContainer}>
          <SwipeCard
            event={{
              id: currentEvent.id,
              title: currentEvent.title,
              description: currentEvent.description,
              imageUrl: currentEvent.imageUrl,
              date: currentEvent.date,
              time: currentEvent.time,
              location: currentEvent.location,
              category: currentEvent.category,
              attendees: currentEvent.attendees,
              maxAttendees: currentEvent.maxAttendees,
              price: currentEvent.price,
              organizer: {
                name: currentEvent.organizer.name,
                avatar: currentEvent.organizer.avatar,
              },
            }}
            onSwipe={handleSwipe}
            onPress={handleEventPress}
          />
        </View>

        {/* Event Counter */}
        <View style={styles.eventCounter}>
          <Text style={styles.counterText}>
            {currentEventIndex + 1} of {events.length} events
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleSwipe('left')}>
            <Ionicons name="close" size={24} color="#ef4444" />
            <Text style={styles.actionText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => handleSwipe('right')}>
            <Ionicons name="heart" size={24} color="#10b981" />
            <Text style={styles.actionText}>Interested</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Event Detail Modal */}
      {showEventDetail && (
        <EventDetailCard
          event={{
            id: currentEvent.id,
            title: currentEvent.title,
            description: currentEvent.description,
            imageUrl: currentEvent.imageUrl,
            date: currentEvent.date,
            time: currentEvent.time,
            location: currentEvent.location,
            category: currentEvent.category,
            subCategory: currentEvent.subCategory,
            attendees: currentEvent.attendees,
            maxAttendees: currentEvent.maxAttendees,
            price: currentEvent.price,
            isFree: currentEvent.isFree,
            organizer: {
              name: currentEvent.organizer.name,
              avatar: currentEvent.organizer.avatar,
              location: currentEvent.organizer.location,
            },
            tags: currentEvent.tags,
          }}
          onClose={handleCloseEventDetail}
          onJoin={handleJoinEvent}
          onShare={handleShareEvent}
        />
      )}

      {/* Create Event Modal */}
      {showCreateEvent && (
        <CreateEvent onClose={handleCloseCreateEvent} />
      )}

      <BottomNav navigation={navigation} activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  userText: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  aiSignature: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: '#9ca3af',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  swipeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  eventCounter: {
    marginTop: 20,
    marginBottom: 16,
  },
  counterText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
});
