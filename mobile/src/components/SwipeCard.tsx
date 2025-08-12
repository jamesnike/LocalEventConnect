import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';

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
  const [pan] = useState(new Animated.ValueXY());
  const [rotation] = useState(new Animated.Value(0));

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

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: pan.x, translationY: pan.y } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      const swipeThreshold = 120;

      if (translationX > swipeThreshold) {
        // Swipe right - interested
        Animated.timing(pan, {
          toValue: { x: screenWidth, y: 0 },
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          onSwipe('right');
          pan.setValue({ x: 0, y: 0 });
        });
      } else if (translationX < -swipeThreshold) {
        // Swipe left - skip
        Animated.timing(pan, {
          toValue: { x: -screenWidth, y: 0 },
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          onSwipe('left');
          pan.setValue({ x: 0, y: 0 });
        });
      } else {
        // Snap back to center
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const cardStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      {
        rotate: pan.x.interpolate({
          inputRange: [-screenWidth / 2, 0, screenWidth / 2],
          outputRange: ['-10deg', '0deg', '10deg'],
        }) as any,
      },
    ],
  };

  // Get overlay color and icon based on swipe direction
  const getOverlayColor = () => {
    // Use a simple approach without accessing internal values
    return 'transparent';
  };

  const getOverlayIcon = () => {
    // Use a simple approach without accessing internal values
    return null;
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View style={[styles.card, cardStyle as any]}>
          <TouchableOpacity
            style={styles.cardContent}
            onPress={onPress}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={{ uri: event.imageUrl }}
              style={styles.imageBackground}
              imageStyle={styles.image}
            >
              {/* Swipe overlay for visual feedback */}
              <View style={[styles.swipeOverlay, { backgroundColor: getOverlayColor() }]}>
                {getOverlayIcon()}
              </View>

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

            {/* Swipe Instructions */}
            <View style={styles.swipeInstructions}>
              <View style={styles.instructionItem}>
                <Ionicons name="close" size={20} color="#ef4444" />
                <Text style={styles.instructionText}>Swipe left to skip</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="heart" size={20} color="#10b981" />
                <Text style={styles.instructionText}>Swipe right to interest</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
  },
  card: {
    width: '100%',
    height: '100%',
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
  },
  cardContent: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageBackground: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    borderRadius: 20,
  },
  swipeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    zIndex: 1,
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
  swipeInstructions: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  instructionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
});

export default SwipeCard; 