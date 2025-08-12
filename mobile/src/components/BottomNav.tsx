import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface BottomNavProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  onCreateEvent?: () => void;
  unreadCount?: number;
}

export default function BottomNav({
  activeTab,
  onTabPress,
  onCreateEvent,
  unreadCount = 0,
}: BottomNavProps) {
  // Match web app navigation structure exactly
  const leftNavItems = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home' as const,
      activeIcon: 'home' as const,
    },
    {
      id: 'my-events',
      label: 'My Events',
      icon: 'calendar' as const,
      activeIcon: 'calendar' as const,
    },
  ];

  const rightNavItems = [
    {
      id: 'browse',
      label: 'Browse',
      icon: 'search' as const,
      activeIcon: 'search' as const,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person' as const,
      activeIcon: 'person' as const,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Left navigation items */}
      {leftNavItems.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab
          ]}
          onPress={() => onTabPress(tab.id)}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={activeTab === tab.id ? tab.activeIcon : tab.icon}
              size={20}
              color={activeTab === tab.id ? '#FF0000' : '#6b7280'}
            />
            {tab.id === 'my-events' && unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === tab.id && styles.activeTabLabel,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
      
      {/* Create Event Button - Prominent Red Circle (matches web app) */}
      {onCreateEvent && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={onCreateEvent}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
      
      {/* Right navigation items */}
      {rightNavItems.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab
          ]}
          onPress={() => onTabPress(tab.id)}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={activeTab === tab.id ? tab.activeIcon : tab.icon}
              size={20}
              color={activeTab === tab.id ? '#FF0000' : '#6b7280'}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === tab.id && styles.activeTabLabel,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    position: 'relative',
    width: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: '#fef2f2',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#FF0000',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  createButton: {
    position: 'absolute',
    top: -25,
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
}); 