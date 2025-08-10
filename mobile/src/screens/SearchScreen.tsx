import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const categories = [
  'all', 'arts', 'music', 'sports', 'tech', 'food', 
  'entertainment', 'education', 'health', 'business', 'community'
];

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchQuery, selectedCategory, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
              const response = await fetch('https://LocalEventConnect.jamesnikess.repl.co/api/events/browse');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (err) {
      console.error('Search fetch error:', err);
      setError(err.message);
      setLoading(false);
      Alert.alert('Error', `Failed to load events: ${err.message}`);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => 
        event.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query) ||
        event.category?.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
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
    return icons[category?.toLowerCase()] || '📅';
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => navigation.navigate('EventDetail', { event: item })}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
      </View>
      
      <View style={styles.eventMeta}>
        <Text style={styles.eventCategory}>
          {getCategoryIcon(item.category)} {item.category}
        </Text>
        <Text style={styles.eventLocation}>📍 {item.location}</Text>
        <Text style={styles.eventPrice}>
          💰 {item.isFree ? 'Free' : `$${item.price}`}
        </Text>
      </View>
      
      <Text style={styles.eventDescription} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryButton = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === item && styles.categoryButtonTextActive,
      ]}>
        {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryButton}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
        </Text>
        {searchQuery.length > 0 && (
          <Text style={styles.searchQueryText}>
            for "{searchQuery}"
          </Text>
        )}
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={60} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No events found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryList: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  searchQueryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  eventsList: {
    padding: 20,
  },
  eventItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  eventDate: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  eventCategory: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 15,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginRight: 15,
  },
  eventPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    margin: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 