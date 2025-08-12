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
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import EventDetailCard from '../components/EventDetailCard';
import { apiRequest, API_CONFIG } from '../config/api';



export default function MyEventsScreen() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [rsvpEvents, setRsvpEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'attending' | 'organizing' | 'saved'>('messages');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    setIsLoading(true);
    try {
      // Fetch user's attending events
      const attendingData = await apiRequest('/api/users/me/events/attending');
      setRsvpEvents(attendingData);
      
      // For created events, filter from all events where user is organizer
      const allEvents = await apiRequest(API_CONFIG.ENDPOINTS.EVENTS);
      const createdEvents = allEvents.filter((event: any) => event.organizerId === 'user-1');
      setMyEvents(createdEvents);
      
      console.log('Fetched my events from API - Created:', createdEvents.length, 'RSVP\'d:', attendingData.length);
    } catch (error) {
      console.error('Failed to fetch my events:', error);
      Alert.alert('Error', 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventPress = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const handleRsvp = async (status: 'going' | 'maybe' | 'not_going') => {
    if (!selectedEvent) return;

    try {
      await apiRequest(API_CONFIG.ENDPOINTS.EVENT_RSVP(selectedEvent.id.toString()), {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      Alert.alert('Success', 'RSVP updated successfully!');
      fetchMyEvents(); // Refresh the list
    } catch (error) {
      console.error('Failed to update RSVP:', error);
      Alert.alert('Error', 'Failed to update RSVP status');
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiRequest(`/api/events/${eventId}`, {
                method: 'DELETE',
              });
              setMyEvents(prev => prev.filter(event => event.id !== eventId));
              Alert.alert('Success', 'Event deleted successfully!');
            } catch (error) {
              console.error('Failed to delete event:', error);
              Alert.alert('Error', 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
    } catch (error) {
      return 'Date TBD';
    }
  };

  const getEventStatus = (event: any, isCreated: boolean) => {
    if (isCreated) {
      return { text: 'Organized', color: '#007AFF', bgColor: '#E3F2FD' };
    }
    if (event.rsvp_status === 'going') {
      return { text: 'Attended', color: '#34C759', bgColor: '#E8F5E8' };
    }
    if (event.rsvp_status === 'maybe') {
      return { text: 'Maybe', color: '#FF9500', bgColor: '#FFF3E0' };
    }
    if (event.rsvp_status === 'not_going') {
      return { text: 'Declined', color: '#FF3B30', bgColor: '#FFEBEE' };
    }
    return { text: 'No Response', color: '#666', bgColor: '#F5F5F5' };
  };

  const renderEventItem = ({ item, isCreated = false }: { item: any; isCreated?: boolean }) => {
    if (!item) {
      return null;
    }
    
    const status = getEventStatus(item, isCreated);
    
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item)}
      >
        <View style={styles.eventIconContainer}>
          <Ionicons 
            name={isCreated ? "people" : "chatbubble"} 
            size={24} 
            color="#8B5CF6" 
          />
        </View>
        
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title || 'Untitled Event'}
          </Text>
          
          <View style={styles.membersRow}>
            <View style={styles.memberAvatars}>
              <View style={styles.memberAvatar}>
                <Ionicons name="person" size={16} color="#666" />
              </View>
              <View style={styles.memberAvatar}>
                <Ionicons name="person" size={16} color="#666" />
              </View>
            </View>
            <Text style={styles.membersText}>
              {isCreated ? '2 members' : '3 members'}
            </Text>
          </View>
        </View>
        
        <View style={styles.eventRight}>
          <View style={styles.dateContainer}>
            <Ionicons name="time" size={14} color="#666" />
            <Text style={styles.dateText}>
              {item.date ? formatDate(item.date) : 'TBD'}
            </Text>
          </View>
          
          <View style={[styles.statusTag, { backgroundColor: status.bgColor }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.text}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Loading your events...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Page Title */}
      <Text style={styles.pageTitle}>My Events</Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
          onPress={() => setActiveTab('messages')}
        >
          <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>
            Messages
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'attending' && styles.activeTab]}
          onPress={() => setActiveTab('attending')}
        >
          <Text style={[styles.tabText, activeTab === 'attending' && styles.activeTabText]}>
            Attending
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'organizing' && styles.activeTab]}
          onPress={() => setActiveTab('organizing')}
        >
          <Text style={[styles.tabText, activeTab === 'organizing' && styles.activeTabText]}>
            Organizing
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
            Saved
          </Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      {activeTab === 'messages' && (
        <FlatList
          data={rsvpEvents.slice(0, 6)} // Show first 6 events like in web UI
          renderItem={({ item }) => renderEventItem({ item, isCreated: false })}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {activeTab === 'attending' && (
        <FlatList
          data={rsvpEvents}
          renderItem={({ item }) => renderEventItem({ item, isCreated: false })}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {activeTab === 'organizing' && (
        <FlatList
          data={myEvents}
          renderItem={({ item }) => renderEventItem({ item, isCreated: true })}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {activeTab === 'saved' && (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No saved events</Text>
          <Text style={styles.emptyText}>Save events to see them here</Text>
        </View>
      )}

      {/* Event Detail Modal */}
      {showEventDetail && selectedEvent && (
        <EventDetailCard
          event={selectedEvent}
          onSwipeRight={() => setShowEventDetail(false)}
          onBack={() => setShowEventDetail(false)}
          onRsvp={handleRsvp}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    marginHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF0000',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF0000',
    fontWeight: '600',
  },
  eventsList: {
    padding: 20,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  memberAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -4,
  },
  membersText: {
    fontSize: 12,
    color: '#666',
  },
  eventRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
