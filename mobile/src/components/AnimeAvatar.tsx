import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnimeAvatarProps {
  user?: any;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showName?: boolean;
  seed?: string;
}

export default function AnimeAvatar({
  user,
  size = 'medium',
  onPress,
  showName = false,
  seed,
}: AnimeAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const getSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 80;
      default:
        return 48;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 32;
      default:
        return 18;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarSize = getSize();
  const fontSize = getFontSize();
  
  // Use custom avatar if available, otherwise use DiceBear API for cute anime avatars
  const avatarSeed = seed || user?.animeAvatarSeed || user?.id || "default";
  const avatarUrl = user?.customAvatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(avatarSeed)}&size=${avatarSize}&backgroundColor=transparent`;
  
  // Fallback avatar URL in case of error
  const fallbackAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(avatarSeed)}&size=${avatarSize}&backgroundColor=f3f4f6`;

  const AvatarContent = () => (
    <View style={[styles.avatar, { width: avatarSize, height: avatarSize }]}>
      {!imageError && (user?.customAvatarUrl || avatarUrl) ? (
        <Image
          source={{ uri: imageError ? fallbackAvatarUrl : avatarUrl }}
          style={[styles.avatarImage, { width: avatarSize, height: avatarSize }]}
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[
          styles.avatarPlaceholder,
          { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }
        ]}>
          <Text style={[styles.avatarText, { fontSize }]}>
            {user?.firstName ? getInitials(user.firstName + ' ' + (user.lastName || '')) : 
             user?.name ? getInitials(user.name) : '?'}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.container}>
        <AvatarContent />
        {showName && user?.name && (
          <Text style={styles.userName} numberOfLines={1}>
            {user.name}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <AvatarContent />
      {showName && user?.name && (
        <Text style={styles.userName} numberOfLines={1}>
          {user.name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
  },
  userName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});
