import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import EventDetailCard from '../components/EventDetailCard';
import EventContentCard from '../components/EventContentCard';
import EventDetail from '../components/EventDetail';
import CreateEvent from '../components/CreateEvent';
import { apiRequest } from '../config/api';
import AnimeAvatar from '../components/AnimeAvatar';
import SwipeCard from '../components/SwipeCard';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
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
      const response = await apiRequest('/api/events', { method: 'GET' });
      if (response && Array.isArray(response)) {
        setEvents(response);
      } else {
        console.log('API response format unexpected, setting empty events');
        setEvents([]);
      }
    } catch (error) {
      console.log('API request failed:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // User is interested - show event detail modal
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
    // Handle event join logic here
    setShowEventDetail(false);
    moveToNextEvent();
  };

  const handleShareEvent = () => {
    // Handle event share logic here
  };

  const handleBackToSwipe = () => {
    setShowEventDetail(false);
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
                size="large"
              />
              <View style={styles.userText}>
                <Text style={styles.greeting}>Hello, {user?.firstName || 'there'}!</Text>
                {user?.location && (
                  <Text style={styles.location}>{user.location}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No events available</Text>
          <Text style={styles.emptyDescription}>
            Check back later for new events!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentEvent = events[currentEventIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <AnimeAvatar
              seed={user?.animeAvatarSeed || 'default'}
              size="medium"
            />
            <View style={styles.userText}>
              <Text style={styles.greeting}>Hello, {user?.firstName || 'there'}!</Text>
              {user?.location && (
                <Text style={styles.location}>{user.location}</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Swipe Card Area */}
      <View style={styles.swipeArea}>
        {currentEvent && (
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
                name: currentEvent.organizer?.name || 'Unknown',
                avatar: currentEvent.organizer?.avatar,
              },
            }}
            onSwipe={handleSwipe}
            onPress={handleEventPress}
          />
        )}
        
        {/* Event Counter */}
        <View style={styles.eventCounter}>
          <Text style={styles.counterText}>
            {currentEventIndex + 1} of {events.length} events
          </Text>
        </View>
      </View>

      {/* Event Detail Modal */}
      <Modal
        visible={showEventDetail}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseEventDetail}
      >
        <SafeAreaView style={styles.modalContainer}>
          {currentEvent && (
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
                attendees: currentEvent.attendees,
                maxAttendees: currentEvent.maxAttendees,
                price: currentEvent.price,
                organizer: {
                  name: currentEvent.organizer?.name || 'Unknown',
                  avatar: currentEvent.organizer?.avatar,
                },
              }}
              onClose={handleCloseEventDetail}
              onJoin={handleJoinEvent}
              onShare={handleShareEvent}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Create Event Modal */}
      <Modal
        visible={showCreateEvent}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCreateEvent(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <CreateEvent 
            isVisible={showCreateEvent}
            onClose={() => setShowCreateEvent(false)}
            onEventCreated={(event) => {
              console.log('Event created:', event);
              setShowCreateEvent(false);
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  swipeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  eventCounter: {
    marginTop: 20,
    alignItems: 'center',
  },
  counterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
