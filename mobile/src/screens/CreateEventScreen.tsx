import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

const categories = [
  'arts', 'music', 'sports', 'tech', 'food', 
  'entertainment', 'education', 'health', 'business', 'community'
];

export default function CreateEventScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    price: '',
    isFree: true,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please sign in to create events.');
      return;
    }

    // Basic validation
    if (!formData.title || !formData.description || !formData.date || 
        !formData.time || !formData.location || !formData.category) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
              const response = await fetch('https://LocalEventConnect.jamesnikess.repl.co/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Success!', 
          'Your event has been created successfully.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to create event.');
      }
    } catch (error) {
      console.error('Create event error:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authContainer}>
          <Ionicons name="lock-closed" size={80} color="#666" />
          <Text style={styles.authTitle}>Authentication Required</Text>
          <Text style={styles.authSubtitle}>
            Please sign in to create events
          </Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.authButtonText}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Event</Text>
        <Text style={styles.subtitle}>Share your event with the community</Text>
      </View>

      <View style={styles.form}>
        {/* Event Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="Enter event title"
            maxLength={100}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  formData.category === category && styles.categoryButtonActive,
                ]}
                onPress={() => handleInputChange('category', category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  formData.category === category && styles.categoryButtonTextActive,
                ]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date and Time */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(value) => handleInputChange('date', value)}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Time *</Text>
            <TextInput
              style={styles.input}
              value={formData.time}
              onChangeText={(value) => handleInputChange('time', value)}
              placeholder="HH:MM"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
            placeholder="Enter event location"
          />
        </View>

        {/* Price */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Price</Text>
          <View style={styles.priceContainer}>
            <TouchableOpacity
              style={[
                styles.priceToggle,
                formData.isFree && styles.priceToggleActive,
              ]}
              onPress={() => handleInputChange('isFree', true)}
            >
              <Text style={[
                styles.priceToggleText,
                formData.isFree && styles.priceToggleTextActive,
              ]}>
                Free
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.priceToggle,
                !formData.isFree && styles.priceToggleActive,
              ]}
              onPress={() => handleInputChange('isFree', false)}
            >
              <Text style={[
                styles.priceToggleText,
                !formData.isFree && styles.priceToggleTextActive,
              ]}>
                Paid
              </Text>
            </TouchableOpacity>
          </View>
          {!formData.isFree && (
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(value) => handleInputChange('price', value)}
              placeholder="Enter price"
              keyboardType="numeric"
            />
          )}
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Describe your event..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Create Event</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  authButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
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
  priceContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  priceToggle: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  priceToggleActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priceToggleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  priceToggleTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
}); 