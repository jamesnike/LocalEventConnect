import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

const notificationTypes = [
  {
    id: 'event_reminders',
    title: 'Event Reminders',
    description: 'Get notified before events you\'re attending',
    icon: 'calendar-outline',
  },
  {
    id: 'new_events',
    title: 'New Events',
    description: 'Discover new events in your area',
    icon: 'add-circle-outline',
  },
  {
    id: 'rsvp_updates',
    title: 'RSVP Updates',
    description: 'When friends RSVP to your events',
    icon: 'people-outline',
  },
  {
    id: 'event_changes',
    title: 'Event Changes',
    description: 'When events you\'re attending are updated',
    icon: 'notifications-outline',
  },
  {
    id: 'chat_messages',
    title: 'Chat Messages',
    description: 'New messages in event chats',
    icon: 'chatbubble-outline',
  },
];

export default function NotificationsScreen() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    event_reminders: true,
    new_events: true,
    rsvp_updates: true,
    event_changes: true,
    chat_messages: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
              const response = await fetch('https://LocalEventConnect.jamesnikess.repl.co/api/notifications/unread', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.log('No notifications or not authenticated');
        setNotifications([]);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    
    // In a real app, you would save this to the server
    Alert.alert(
      'Setting Updated',
      `Notification setting for ${notificationTypes.find(t => t.id === key)?.title} has been updated.`
    );
  };

  const markAsRead = async (notificationId) => {
    try {
              const response = await fetch(`https://LocalEventConnect.jamesnikess.repl.co/api/notifications/${notificationId}/mark-read`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationIcon}>
        <Ionicons name="notifications" size={24} color="#007AFF" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.createdAt}</Text>
      </View>
      <TouchableOpacity
        style={styles.markReadButton}
        onPress={() => markAsRead(item.id)}
      >
        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSettingItem = ({ item }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={item.icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingDescription}>{item.description}</Text>
      </View>
      <Switch
        value={settings[item.id]}
        onValueChange={() => handleToggleSetting(item.id)}
        trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
        thumbColor={settings[item.id] ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authContainer}>
          <Ionicons name="notifications-off" size={80} color="#666" />
          <Text style={styles.authTitle}>Sign In Required</Text>
          <Text style={styles.authSubtitle}>
            Please sign in to manage your notifications
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        <FlatList
          data={notificationTypes}
          renderItem={renderSettingItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          {notifications.length > 0 && (
            <TouchableOpacity onPress={() => setNotifications([])}>
              <Text style={styles.clearButton}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
        ) : notifications.length > 0 ? (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={60} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateText}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        )}
      </View>
    </View>
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
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationIcon: {
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  markReadButton: {
    marginLeft: 10,
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
  loading: {
    padding: 20,
  },
}); 