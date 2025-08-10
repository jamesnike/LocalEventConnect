import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const faqData = [
  {
    question: 'How do I create an event?',
    answer: 'Tap the + button on the Home screen to create a new event. Fill in the event details and tap "Create Event" to publish it.',
    category: 'Events',
  },
  {
    question: 'How do I RSVP to an event?',
    answer: 'Open an event detail and tap "I\'m Going!" or "Maybe" to RSVP. You can change your RSVP status at any time.',
    category: 'Events',
  },
  {
    question: 'How do I join event chats?',
    answer: 'When viewing an event detail, tap "Join Chat" to participate in the event conversation with other attendees.',
    category: 'Chat',
  },
  {
    question: 'How do I search for events?',
    answer: 'Use the Search tab to find events by title, description, location, or category. You can also filter by category.',
    category: 'Search',
  },
  {
    question: 'How do I manage notifications?',
    answer: 'Go to Profile > Notifications to customize your notification preferences for different types of updates.',
    category: 'Notifications',
  },
  {
    question: 'How do I update my profile?',
    answer: 'Go to Profile > Edit Profile to update your personal information and preferences.',
    category: 'Profile',
  },
  {
    question: 'What if I can\'t connect to the server?',
    answer: 'Check your internet connection and try again. You can also use the Network Test tab to diagnose connection issues.',
    category: 'Technical',
  },
  {
    question: 'How do I report an issue?',
    answer: 'Go to Profile > Contact Support to send us an email with details about the issue you\'re experiencing.',
    category: 'Support',
  },
];

const categories = ['All', 'Events', 'Chat', 'Search', 'Notifications', 'Profile', 'Technical', 'Support'];

export default function HelpScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItem, setExpandedItem] = useState(null);

  const filteredFAQ = selectedCategory === 'All' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleExpanded = (index) => {
    setExpandedItem(expandedItem === index ? null : index);
  };

  const contactSupport = () => {
    Linking.openURL('mailto:support@eventconnect.com?subject=Help Request');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://eventconnect.com/privacy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://eventconnect.com/terms');
  };

  const renderFAQItem = ({ item, index }) => (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => toggleExpanded(index)}
      >
        <Text style={styles.faqQuestionText}>{item.question}</Text>
        <Ionicons 
          name={expandedItem === index ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#007AFF" 
        />
      </TouchableOpacity>
      {expandedItem === index && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </View>
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
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Help & FAQ</Text>
        <Text style={styles.subtitle}>Find answers to common questions</Text>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive,
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* FAQ List */}
      <View style={styles.faqContainer}>
        {filteredFAQ.length > 0 ? (
          filteredFAQ.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleExpanded(index)}
              >
                <Text style={styles.faqQuestionText}>{item.question}</Text>
                <Ionicons 
                  name={expandedItem === index ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#007AFF" 
                />
              </TouchableOpacity>
              {expandedItem === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="help-circle-outline" size={60} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No FAQ Found</Text>
            <Text style={styles.emptyStateText}>
              No FAQ items found for this category.
            </Text>
          </View>
        )}
      </View>

      {/* Support Options */}
      <View style={styles.supportSection}>
        <Text style={styles.sectionTitle}>Still Need Help?</Text>
        
        <TouchableOpacity style={styles.supportOption} onPress={contactSupport}>
          <Ionicons name="mail-outline" size={24} color="#007AFF" />
          <View style={styles.supportOptionContent}>
            <Text style={styles.supportOptionTitle}>Contact Support</Text>
            <Text style={styles.supportOptionDescription}>
              Send us an email for personalized help
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportOption} onPress={openPrivacyPolicy}>
          <Ionicons name="shield-outline" size={24} color="#007AFF" />
          <View style={styles.supportOptionContent}>
            <Text style={styles.supportOptionTitle}>Privacy Policy</Text>
            <Text style={styles.supportOptionDescription}>
              Learn how we protect your data
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportOption} onPress={openTermsOfService}>
          <Ionicons name="document-text-outline" size={24} color="#007AFF" />
          <View style={styles.supportOptionContent}>
            <Text style={styles.supportOptionTitle}>Terms of Service</Text>
            <Text style={styles.supportOptionDescription}>
              Read our terms and conditions
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
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
  faqContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 15,
  },
  faqAnswer: {
    paddingBottom: 20,
  },
  faqAnswerText: {
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
  supportSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 15,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  supportOptionContent: {
    flex: 1,
    marginLeft: 15,
  },
  supportOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  supportOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
}); 