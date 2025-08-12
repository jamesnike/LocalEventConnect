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



export default function BrowseScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('tomorrow-am');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, selectedCategory, selectedTimeSlot]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest(API_CONFIG.ENDPOINTS.EVENTS);
      setEvents(data);
      console.log('Fetched events from API:', data.length);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      Alert.alert('Error', 'Failed to fetch events. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    // Filter by time slot (simplified for now)
    if (selectedTimeSlot) {
      // This is a placeholder - you can implement actual time filtering logic
      filtered = filtered.slice(0, 10); // Show first 10 events for demo
    }
    
    setFilteredEvents(filtered);
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
    } catch (error) {
      console.error('Failed to update RSVP:', error);
      Alert.alert('Error', 'Failed to update RSVP status');
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTimeSlots = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return [
      { id: 'today-am', label: 'Today', time: 'AM', date: today },
      { id: 'today-pm', label: 'Today', time: 'PM', date: today },
      { id: 'today-night', label: 'Today', time: 'Night', date: today },
      { id: 'tomorrow-am', label: 'Tomorrow', time: 'AM', date: tomorrow },
      { id: 'tomorrow-pm', label: 'Tomorrow', time: 'PM', date: tomorrow },
      { id: 'tomorrow-night', label: 'Tomorrow', time: 'Night', date: tomorrow },
      { id: 'aug12-am', label: '8/12', time: 'AM', date: new Date('2025-08-12') },
      { id: 'aug12-pm', label: '8/12', time: 'PM', date: new Date('2025-08-12') },
      { id: 'aug12-night', label: '8/12', time: 'Night', date: new Date('2025-08-12') },
      { id: 'aug13-am', label: '8/13', time: 'AM', date: new Date('2025-08-13') },
      { id: 'aug13-pm', label: '8/13', time: 'PM', date: new Date('2025-08-13') },
      { id: 'aug13-night', label: '8/13', time: 'Night', date: new Date('2025-08-13') },
      { id: 'aug14-am', label: '8/14', time: 'AM', date: new Date('2025-08-14') },
      { id: 'aug14-pm', label: '8/14', time: 'PM', date: new Date('2025-08-14') },
      { id: 'aug14-night', label: '8/14', time: 'Night', date: new Date('2025-08-14') },
    ];
  };

  const renderTimeFilterGrid = () => {
    const timeSlots = getTimeSlots();
    
    return (
      <View style={styles.timeFilterContainer}>
        <Text style={styles.timeFilterTitle}>Browse Events in One Week</Text>
        <View style={styles.timeFilterGrid}>
          {timeSlots.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.timeSlotButton,
                selectedTimeSlot === slot.id && styles.timeSlotButtonActive
              ]}
              onPress={() => handleTimeSlotSelect(slot.id)}
            >
              <Text style={[
                styles.timeSlotText,
                selectedTimeSlot === slot.id && styles.timeSlotTextActive
              ]}>
                {slot.label}
              </Text>
              <Text style={[
                styles.timeSlotTime,
                selectedTimeSlot === slot.id && styles.timeSlotTextActive
              ]}>
                {slot.time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderEventItem = ({ item }: { item: any }) => {
    if (!item) return null;
    
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item)}
      >
        <View style={styles.eventImageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.eventImage} />
          ) : (
            <View style={styles.eventImagePlaceholder}>
              <Ionicons name="image" size={40} color="#ccc" />
            </View>
          )}
          
          {/* Category Tag Overlay */}
          <View style={styles.categoryTagOverlay}>
            <Ionicons name="calendar" size={12} color="white" />
            <Text style={styles.categoryTagText}>
              {item.category || 'Event'}
            </Text>
          </View>
          
          {/* Favorite Button */}
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.eventInfo}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {item.title || 'Untitled Event'}
            </Text>
            <Text style={styles.eventPrice}>
              $ {item.price || '0.00'}
            </Text>
          </View>
          
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="time" size={14} color="#666" />
              <Text style={styles.detailText}>
                {item.date ? `${formatDate(item.date)} • ${formatTime(item.date)}` : 'TBD'}
              </Text>
            </View>
            
            {item.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location" size={14} color="#666" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.eventFooter}>
            <View style={styles.attendeesInfo}>
              <View style={styles.attendeeAvatars}>
                <View style={styles.attendeeAvatar}>
                  <Ionicons name="person" size={16} color="#666" />
                </View>
              </View>
              <Text style={styles.attendeesText}>0</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Time Filter Grid */}
      {renderTimeFilterGrid()}

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No events found</Text>
          <Text style={styles.emptyText}>
            {selectedCategory === 'All' 
              ? 'No events available at the moment'
              : `No events in the ${selectedCategory} category`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
          numColumns={1}
        />
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
  },
  timeFilterContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  timeFilterTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  timeFilterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlotButton: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeSlotButtonActive: {
    backgroundColor: '#FF0000',
    borderColor: '#FF0000',
  },
  timeSlotText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  timeSlotTime: {
    fontSize: 8,
    color: '#666',
    fontWeight: '400',
  },
  timeSlotTextActive: {
    color: '#fff',
  },
  eventsList: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  eventImageContainer: {
    position: 'relative',
    height: 200,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTagOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  eventPrice: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendeesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeAvatars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  attendeeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendeesText: {
    fontSize: 14,
    color: '#666',
  },
});
