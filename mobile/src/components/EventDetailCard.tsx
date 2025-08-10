import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface EventDetailCardProps {
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
      location?: string;
    };
    tags?: string[];
  };
  onClose: () => void;
  onJoin: () => void;
  onShare: () => void;
}

const EventDetailCard: React.FC<EventDetailCardProps> = ({
  event,
  onClose,
  onJoin,
  onShare,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with close button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Event Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.imageUrl }} style={styles.image} />
          <View style={styles.imageOverlay}>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryIcon}>
                {getCategoryIcon(event.category)}
              </Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{event.category}</Text>
              </View>
              {event.subCategory && (
                <View style={styles.subCategoryBadge}>
                  <Text style={styles.subCategoryText}>{event.subCategory}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Event Content */}
        <View style={styles.content}>
          {/* Title and Price */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.priceContainer}>
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

          {/* Event Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar-outline" size={20} color="#6366f1" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="time-outline" size={20} color="#10b981" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{formatTime(event.time)}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="location-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {event.location}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="people-outline" size={20} color="#ef4444" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Attendees</Text>
                <Text style={styles.detailValue}>
                  {event.attendees}/{event.maxAttendees}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionLabel}>About this event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsLabel}>Tags</Text>
              <View style={styles.tagsContainer}>
                {event.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Organizer Info */}
          <View style={styles.organizerSection}>
            <Text style={styles.organizerLabel}>Organized by</Text>
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
              <View style={styles.organizerDetails}>
                <Text style={styles.organizerName}>{event.organizer.name}</Text>
                {event.organizer.location && (
                  <Text style={styles.organizerLocation}>
                    {event.organizer.location}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.shareButton} onPress={onShare}>
          <Ionicons name="share-outline" size={20} color="#6366f1" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.joinButton} onPress={onJoin}>
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.joinButtonText}>Join Event</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 20,
    justifyContent: 'flex-end',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 24,
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
  subCategoryBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  subCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    lineHeight: 32,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  freeBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  freeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  priceBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    marginTop: 2,
  },
  descriptionSection: {
    gap: 12,
  },
  descriptionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  tagsSection: {
    gap: 12,
  },
  tagsLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  organizerSection: {
    gap: 12,
  },
  organizerLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  organizerAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  organizerDetails: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  organizerLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
    backgroundColor: 'white',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  joinButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default EventDetailCard; 