import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotFoundScreenProps {
  navigation: any;
}

export default function NotFoundScreen({ navigation }: NotFoundScreenProps) {
  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 404 Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle" size={120} color="#FF3B30" />
        </View>

        {/* Error Message */}
        <Text style={styles.errorCode}>404</Text>
        <Text style={styles.errorTitle}>Page Not Found</Text>
        <Text style={styles.errorDescription}>
          Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
            <Ionicons name="home" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Go Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={20} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If you believe this is an error, please contact our support team.
          </Text>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpSection: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  helpButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  helpButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
