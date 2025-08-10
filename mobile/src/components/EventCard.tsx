import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EventCardProps {
  event: any;
  onPress?: () => void;
  showOrganizer?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export default function EventCard({
  event,
  onPress,
  showOrganizer = false,
  variant = 'default',
}: EventCardProps) {
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

  const getCardStyle = () => {
    switch (variant) {
      case 'compact':
        return styles.cardCompact;
      case 'featured':
        return styles.cardFeatured;
      default:
        return styles.card;
    }
  };

  const getImageStyle = () => {
    switch (variant) {
      case 'compact':
        return styles.imageCompact;
      case 'featured':
        return styles.imageFeatured;
      default:
        return styles.image;
    }
  };

  const CardContent = () => (
    <View style={getCardStyle()}>
      {/* Event Image */}
      {event.image_url && (
        <Image source={{ uri: event.image_url }} style={getImageStyle()} />
      )}
      
      {/* Event Info */}
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={variant === 'compact' ? 1 : 2}>
          {event.title}
        </Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={14} color="#666" />
            <Text style={styles.detailText}>{formatDate(event.date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time" size={14} color="#666" />
            <Text style={styles.detailText}>{formatTime(event.date)}</Text>
          </View>
          
          {event.location && (
            <View style={styles.detailRow}>
              <Ionicons name="location" size={14} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          )}
        </View>
        
        {/* Organizer Info */}
        {showOrganizer && event.organizer && (
          <View style={styles.organizerInfo}>
            <View style={styles.organizerAvatar}>
              <Ionicons name="person" size={16} color="#666" />
            </View>
            <Text style={styles.organizerName} numberOfLines={1}>
              {event.organizer.name}
            </Text>
          </View>
        )}
        
        {/* Event Footer */}
        <View style={styles.eventFooter}>
          {event.category && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
          )}
          
          {event.price !== undefined && (
            <Text style={styles.priceText}>
              {event.price === 0 ? 'Free' : `$${event.price}`}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.container}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <CardContent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  cardCompact: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  cardFeatured: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  imageCompact: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  imageFeatured: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  eventDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  organizerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  organizerName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
