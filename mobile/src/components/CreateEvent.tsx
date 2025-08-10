import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';

interface CreateEventProps {
  isVisible: boolean;
  onClose: () => void;
  onEventCreated: (event: any) => void;
}

export default function CreateEvent({
  isVisible,
  onClose,
  onEventCreated,
}: CreateEventProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    max_attendees: '',
    price: '',
    image_url: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const categories = [
    'Music',
    'Sports',
    'Food & Drink',
    'Technology',
    'Art & Culture',
    'Business',
    'Education',
    'Health & Wellness',
    'Social',
    'Other',
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setFormData(prev => ({ ...prev, image_url: result.assets[0].uri }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter an event description');
      return false;
    }
    if (!formData.date) {
      Alert.alert('Error', 'Please select an event date');
      return false;
    }
    if (!formData.time) {
      Alert.alert('Error', 'Please select an event time');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please enter an event location');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select an event category');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const eventData = {
        ...formData,
        date: `${formData.date}T${formData.time}:00.000Z`,
        max_attendees: parseInt(formData.max_attendees) || null,
        price: parseFloat(formData.price) || 0,
        organizer_id: user?.id,
      };

      // TODO: Replace with actual API call
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const newEvent = await response.json();
      onEventCreated(newEvent);
      onClose();
      Alert.alert('Success', 'Event created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: '',
      max_attendees: '',
      price: '',
      image_url: '',
    });
    setSelectedImage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Event</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.submitButton}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Upload */}
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={pickImage} style={styles.imageUpload}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={48} color="#ccc" />
                  <Text style={styles.imagePlaceholderText}>Add Event Image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Event Title *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholder="Enter event title"
              maxLength={100}
            />

            <Text style={styles.fieldLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Describe your event"
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            <Text style={styles.fieldLabel}>Date *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.date}
              onChangeText={(value) => handleInputChange('date', value)}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.fieldLabel}>Time *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.time}
              onChangeText={(value) => handleInputChange('time', value)}
              placeholder="HH:MM"
            />

            <Text style={styles.fieldLabel}>Location *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              placeholder="Enter event location"
            />

            <Text style={styles.fieldLabel}>Category *</Text>
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
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Max Attendees</Text>
            <TextInput
              style={styles.textInput}
              value={formData.max_attendees}
              onChangeText={(value) => handleInputChange('max_attendees', value)}
              placeholder="Enter maximum attendees"
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Price ($)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.price}
              onChangeText={(value) => handleInputChange('price', value)}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
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
  submitButton: {
    padding: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  imageSection: {
    padding: 20,
  },
  imageUpload: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  formSection: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
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
  },
});
