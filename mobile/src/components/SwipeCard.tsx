import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SwipeCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    date: string;
    time: string;
    location: string;
    category: string;
    attendees: number;
    maxAttendees: number;
    price?: number;
    organizer: {
      name: string;
      avatar?: string;
    };
  };
  onSwipe: (direction: 'left' | 'right') => void;
  onPress: () => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ event, onSwipe, onPress }) => {
  const handleSwipe = (direction: 'left' | 'right') => {
    onSwipe(direction);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: event.imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        {/* Gradient overlay */}
        <View style={styles.overlay}>
          {/* Top section with category and price */}
          <View style={styles.topSection}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
            {event.price !== undefined && event.price > 0 && (
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>${event.price}</Text>
              </View>
            )}
          </View>

          {/* Bottom section with event details */}
          <View style={styles.bottomSection}>
            <View style={styles.eventInfo}>
              <Text style={styles.title} numberOfLines={2}>
                {event.title}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {event.description}
              </Text>
              
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={16} color="white" />
                  <Text style={styles.detailText}>
                    {formatDate(event.date)}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={16} color="white" />
                  <Text style={styles.detailText}>
                    {formatTime(event.time)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={16} color="white" />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {event.location}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="people-outline" size={16} color="white" />
                  <Text style={styles.detailText}>
                    {event.attendees}/{event.maxAttendees}
                  </Text>
                </View>
              </View>

              <View style={styles.organizerRow}>
                {event.organizer.avatar && (
                  <Image
                    source={{ uri: event.organizer.avatar }}
                    style={styles.organizerAvatar}
                  />
                )}
                <Text style={styles.organizerName}>
                  {event.organizer.name}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Swipe buttons */}
      <View style={styles.swipeButtons}>
        <TouchableOpacity
          style={[styles.swipeButton, styles.rejectButton]}
          onPress={() => handleSwipe('left')}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.swipeButton, styles.acceptButton]}
          onPress={() => handleSwipe('right')}
        >
          <Ionicons name="heart" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginHorizontal: screenWidth * 0.05,
  },
  imageBackground: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    borderRadius: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  priceBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  bottomSection: {
    padding: 16,
  },
  eventInfo: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  organizerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  organizerName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  swipeButtons: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  swipeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  rejectButton: {
    backgroundColor: '#ff4757',
  },
  acceptButton: {
    backgroundColor: '#2ed573',
  },
});

export default SwipeCard; 