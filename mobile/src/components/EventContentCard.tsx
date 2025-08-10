import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface EventContentCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    date: string;
    time: string;
    location: string;
    category: string;
    subCategory?: string;
    attendees: number;
    maxAttendees: number;
    price?: number;
    isFree?: boolean;
    organizer: {
      name: string;
      avatar?: string;
    };
    tags?: string[];
  };
  onPress: () => void;
  onJoin?: () => void;
  showJoinButton?: boolean;
}

const EventContentCard: React.FC<EventContentCardProps> = ({
  event,
  onPress,
  onJoin,
  showJoinButton = false,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'arts': '🎨',
      'music': '🎵',
      'sports': '⚽',
      'tech': '💻',
      'food': '🍕',
      'entertainment': '🎭',
      'education': '📚',
      'health': '💪',
      'business': '💼',
      'community': '🤝',
    };
    return icons[category.toLowerCase()] || '📅';
  };

  const handleJoinPress = (e: any) => {
    e.stopPropagation();
    if (onJoin) {
      onJoin();
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      {/* Event Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.imageUrl }} style={styles.image} />
        <View style={styles.imageOverlay}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(event.category)}
            </Text>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
          
          {/* Price Badge */}
          {event.isFree ? (
            <View style={styles.freeBadge}>
              <Text style={styles.freeText}>Free</Text>
            </View>
          ) : event.price ? (
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>${event.price}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Event Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>

        {/* Event Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>
                {formatDate(event.date)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>
                {formatTime(event.time)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>
                {event.attendees}/{event.maxAttendees}
              </Text>
            </View>
          </View>
        </View>

        {/* Organizer and Action */}
        <View style={styles.bottomSection}>
          <View style={styles.organizerInfo}>
            {event.organizer.avatar ? (
              <Image
                source={{ uri: event.organizer.avatar }}
                style={styles.organizerAvatar}
              />
            ) : (
              <View style={styles.organizerAvatarPlaceholder}>
                <Text style={styles.organizerInitial}>
                  {event.organizer.name.charAt(0)}
                </Text>
              </View>
            )}
            <Text style={styles.organizerName}>
              {event.organizer.name}
            </Text>
          </View>

          {showJoinButton && (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={handleJoinPress}
            >
              <Ionicons name="add" size={16} color="white" />
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {event.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {event.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{event.tags.length - 3} more</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  freeBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  freeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  priceBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  organizerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  organizerAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerInitial: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  organizerName: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
});

export default EventContentCard;
