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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import EventContentCard from '../components/EventContentCard';
import EventCard from '../components/EventCard';

interface EventContentScreenProps {
  navigation: any;
  route: any;
}

export default function EventContentScreen({ navigation, route }: EventContentScreenProps) {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [similarEvents, setSimilarEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'similar' | 'favorites'>('chat');
  const [rsvpStatus, setRsvpStatus] = useState<string>('');

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
        
        // Fetch RSVP status
        const rsvpResponse = await fetch(`/api/events/${eventId}/rsvp/status`);
        if (rsvpResponse.ok) {
          const rsvpData = await rsvpResponse.json();
          setRsvpStatus(rsvpData.status);
        }
        
        // Fetch similar events
        const similarResponse = await fetch(`/api/events/${eventId}/similar`);
        if (similarResponse.ok) {
          const similarData = await similarResponse.json();
          setSimilarEvents(similarData);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch event details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRsvp = async (status: 'going' | 'maybe' | 'not_going') => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setRsvpStatus(status);
        Alert.alert('Success', 'RSVP updated successfully!');
      } else {
        throw new Error('Failed to update RSVP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update RSVP status');
    }
  };

  const handleTabChange = (tab: 'chat' | 'similar' | 'favorites') => {
    setActiveTab(tab);
  };

  const handleEventPress = (event: any) => {
    navigation.push('EventContent', { eventId: event.id });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF3B30" />
        <Text style={styles.errorTitle}>Event Not Found</Text>
        <Text style={styles.errorText}>The event you're looking for doesn't exist or has been removed.</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Event Content */}
      <EventContentCard
        event={event}
        onSwipeRight={() => {
          // Navigate to next event or show success
          Alert.alert('Success', 'You\'re interested in this event!');
        }}
        onBack={handleBack}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onRsvp={handleRsvp}
        rsvpStatus={rsvpStatus}
      />

      {/* Similar Events (shown in similar tab) */}
      {activeTab === 'similar' && similarEvents.length > 0 && (
        <View style={styles.similarEventsSection}>
          <Text style={styles.sectionTitle}>Similar Events</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {similarEvents.map((similarEvent) => (
              <View key={similarEvent.id} style={styles.similarEventCard}>
                <EventCard
                  event={similarEvent}
                  onPress={() => handleEventPress(similarEvent)}
                  variant="compact"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  similarEventsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  similarEventCard: {
    width: 200,
    marginRight: 16,
  },
});
