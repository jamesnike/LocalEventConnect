import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

interface EventDetailProps {
  event: any;
  onClose: () => void;
  onRsvp: (status: 'going' | 'maybe' | 'not_going') => void;
  rsvpStatus?: string;
  isVisible: boolean;
}

export default function EventDetail({
  event,
  onClose,
  onRsvp,
  rsvpStatus,
  isVisible,
}: EventDetailProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleRsvp = async (status: 'going' | 'maybe' | 'not_going') => {
    setIsLoading(true);
    try {
      await onRsvp(status);
    } catch (error) {
      Alert.alert('Error', 'Failed to update RSVP status');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (!event) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Event Image */}
          {event.image_url && (
            <Image source={{ uri: event.image_url }} style={styles.eventImage} />
          )}

          {/* Event Info */}
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDescription}>{event.description}</Text>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={16} color="#666" />
                <Text style={styles.detailText}>{formatDate(event.date)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.detailText}>{formatTime(event.date)}</Text>
              </View>
              
              {event.location && (
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={16} color="#666" />
                  <Text style={styles.detailText}>{event.location}</Text>
                </View>
              )}

              {event.category && (
                <View style={styles.detailRow}>
                  <Ionicons name="pricetag" size={16} color="#666" />
                  <Text style={styles.detailText}>{event.category}</Text>
                </View>
              )}
            </View>

            {/* Organizer Info */}
            {event.organizer && (
              <View style={styles.organizerSection}>
                <Text style={styles.sectionTitle}>Organizer</Text>
                <View style={styles.organizerInfo}>
                  <Image
                    source={{ uri: event.organizer.avatar_url || 'https://via.placeholder.com/50' }}
                    style={styles.organizerAvatar}
                  />
                  <View style={styles.organizerDetails}>
                    <Text style={styles.organizerName}>{event.organizer.name}</Text>
                    <Text style={styles.organizerEmail}>{event.organizer.email}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* RSVP Section */}
            <View style={styles.rsvpSection}>
              <Text style={styles.sectionTitle}>Are you going?</Text>
              <View style={styles.rsvpButtons}>
                <TouchableOpacity
                  style={[
                    styles.rsvpButton,
                    rsvpStatus === 'going' && styles.rsvpButtonActive,
                  ]}
                  onPress={() => handleRsvp('going')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                  ) : (
                    <Text style={[
                      styles.rsvpButtonText,
                      rsvpStatus === 'going' && styles.rsvpButtonTextActive,
                    ]}>
                      Going
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rsvpButton,
                    rsvpStatus === 'maybe' && styles.rsvpButtonActive,
                  ]}
                  onPress={() => handleRsvp('maybe')}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.rsvpButtonText,
                    rsvpStatus === 'maybe' && styles.rsvpButtonTextActive,
                  ]}>
                    Maybe
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rsvpButton,
                    rsvpStatus === 'not_going' && styles.rsvpButtonActive,
                  ]}
                  onPress={() => handleRsvp('not_going')}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.rsvpButtonText,
                    rsvpStatus === 'not_going' && styles.rsvpButtonTextActive,
                  ]}>
                    Not Going
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Additional Info */}
            {event.max_attendees && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Event Capacity</Text>
                <Text style={styles.infoText}>
                  Maximum {event.max_attendees} attendees
                </Text>
              </View>
            )}

            {event.price && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Price</Text>
                <Text style={styles.infoText}>
                  {event.price === 0 ? 'Free' : `$${event.price}`}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  closeButton: {
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
  content: {
    flex: 1,
  },
  eventImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  eventInfo: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  eventDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 20,
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  organizerSection: {
    marginBottom: 20,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  organizerDetails: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  organizerEmail: {
    fontSize: 14,
    color: '#666',
  },
  rsvpSection: {
    marginBottom: 20,
  },
  rsvpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rsvpButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  rsvpButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  rsvpButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  rsvpButtonTextActive: {
    color: '#fff',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
});
