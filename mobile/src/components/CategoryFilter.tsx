import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onCategorySelect,
}: CategoryFilterProps) {
  const categories = [
    { id: null, name: 'All', icon: 'grid' },
    { id: 'arts', name: 'Arts', icon: 'color-palette' },
    { id: 'music', name: 'Music', icon: 'musical-notes' },
    { id: 'sports', name: 'Sports', icon: 'football' },
    { id: 'tech', name: 'Tech', icon: 'laptop' },
    { id: 'food', name: 'Food', icon: 'restaurant' },
    { id: 'entertainment', name: 'Entertainment', icon: 'film' },
    { id: 'education', name: 'Education', icon: 'school' },
    { id: 'health', name: 'Health', icon: 'fitness' },
    { id: 'business', name: 'Business', icon: 'briefcase' },
    { id: 'community', name: 'Community', icon: 'people' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id || 'all'}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategory,
            ]}
            onPress={() => onCategorySelect(category.id)}
          >
            <Ionicons
              name={category.icon as any}
              size={20}
              color={selectedCategory === category.id ? '#007AFF' : '#666'}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: '600',
  },
}); 