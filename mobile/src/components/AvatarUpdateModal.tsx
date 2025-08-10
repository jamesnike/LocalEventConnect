import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';

interface AvatarUpdateModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAvatarUpdated: (avatarUrl: string) => void;
}

export default function AvatarUpdateModal({
  isVisible,
  onClose,
  onAvatarUpdated,
}: AvatarUpdateModalProps) {
  const { user, refetch } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take a photo');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call for image upload
      const formData = new FormData();
      formData.append('avatar', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const result = await response.json();
      onAvatarUpdated(result.avatar_url);
      await refetch(); // Refresh auth context
      onClose();
      Alert.alert('Success', 'Avatar updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload avatar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
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
          <Text style={styles.headerTitle}>Update Avatar</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || !selectedImage}
            style={[
              styles.saveButton,
              (!selectedImage || isLoading) && styles.saveButtonDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={[
                styles.saveButtonText,
                (!selectedImage || isLoading) && styles.saveButtonTextDisabled,
              ]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Current Avatar */}
          <View style={styles.currentAvatarSection}>
            <Text style={styles.sectionTitle}>Current Avatar</Text>
            <View style={styles.currentAvatarContainer}>
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.currentAvatar} />
              ) : (
                <View style={styles.currentAvatarPlaceholder}>
                  <Ionicons name="person" size={48} color="#ccc" />
                </View>
              )}
            </View>
          </View>

          {/* New Avatar Preview */}
          {selectedImage && (
            <View style={styles.newAvatarSection}>
              <Text style={styles.sectionTitle}>New Avatar</Text>
              <View style={styles.newAvatarContainer}>
                <Image source={{ uri: selectedImage }} style={styles.newAvatar} />
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={takePhoto} style={styles.actionButton}>
              <Ionicons name="camera" size={24} color="#007AFF" />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage} style={styles.actionButton}>
              <Ionicons name="images" size={24} color="#007AFF" />
              <Text style={styles.actionButtonText}>Choose from Library</Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>
              Choose a clear, well-lit photo for the best results. Your avatar will be visible to other users.
            </Text>
          </View>
        </View>
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
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  currentAvatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  currentAvatarContainer: {
    alignItems: 'center',
  },
  currentAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  currentAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newAvatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  newAvatarContainer: {
    alignItems: 'center',
  },
  newAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  actionButtons: {
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 12,
    fontWeight: '500',
  },
  instructions: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
});
