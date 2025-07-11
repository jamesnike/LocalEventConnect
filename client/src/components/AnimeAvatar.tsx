import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import AvatarUpdateModal from './AvatarUpdateModal';
import UserProfileModal from './UserProfileModal';
import { User } from '@shared/schema';

interface AnimeAvatarProps {
  seed: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  customAvatarUrl?: string | null;
  clickable?: boolean;
  behavior?: 'navigate' | 'modal' | 'profile';
  user?: User; // The user whose avatar this is (for profile modal)
}

export default function AnimeAvatar({ seed, size = 'md', customAvatarUrl, clickable = true, behavior = 'modal', user: avatarUser }: AnimeAvatarProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isAvatarUpdateModalOpen, setIsAvatarUpdateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-24 h-24',
  };

  const pixelSizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 96,
  };

  // Use custom avatar if available, otherwise use DiceBear API for cute anime avatars
  const avatarUrl = customAvatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&size=${pixelSizes[size]}&backgroundColor=transparent`;
  
  // Fallback avatar URL in case of error
  const fallbackAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&size=${pixelSizes[size]}&backgroundColor=f3f4f6`;
  
  // Debug logging
  console.log('Avatar Debug:', { 
    seed, 
    customAvatarUrl, 
    avatarUrl, 
    imageError,
    behavior,
    avatarUser: avatarUser ? { id: avatarUser.id, firstName: avatarUser.firstName } : null,
    currentUser: user ? { id: user.id, firstName: user.firstName } : null
  });

  const handleClick = () => {
    if (!clickable) return;
    
    console.log('Avatar clicked:', { 
      behavior, 
      clickable, 
      avatarUser: avatarUser?.id, 
      currentUser: user?.id,
      seed,
      userSeed: user?.animeAvatarSeed,
      idsMatch: avatarUser && user ? String(avatarUser.id) === String(user.id) : false
    });
    
    if (behavior === 'navigate') {
      // Navigate to profile page
      setLocation('/profile');
    } else if (behavior === 'profile' && avatarUser && user) {
      // Show profile modal for any user
      const isCurrentUser = String(avatarUser.id) === String(user.id);
      console.log('Profile behavior - isCurrentUser:', isCurrentUser);
      
      if (isCurrentUser) {
        // If it's the current user's avatar, show avatar update modal
        console.log('Opening avatar update modal for current user');
        setIsAvatarUpdateModalOpen(true);
      } else {
        // Show profile modal for other users
        console.log('Opening profile modal for other user');
        setIsProfileModalOpen(true);
      }
    } else {
      // Default behavior: show modal for avatar update (only if it's the user's own avatar)
      if (user && seed === user.animeAvatarSeed) {
        console.log('Opening avatar update modal (default behavior)');
        setIsAvatarUpdateModalOpen(true);
      } else {
        console.log('Default behavior - no match:', { seed, userSeed: user?.animeAvatarSeed });
      }
    }
  };

  return (
    <>
      <button 
        onClick={handleClick}
        disabled={!clickable}
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white shadow-sm bg-gradient-to-br from-pink-100 to-purple-100 hover:scale-105 transition-transform duration-200 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <img
          src={imageError ? fallbackAvatarUrl : avatarUrl}
          alt="Anime avatar"
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      </button>
      
      {/* Debug button - only show for current user's avatar */}
      {user && avatarUser && String(avatarUser.id) === String(user.id) && (
        <button 
          onClick={() => setIsAvatarUpdateModalOpen(true)}
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded"
          style={{ fontSize: '8px' }}
        >
          TEST
        </button>
      )}
      
      {user && (
        <AvatarUpdateModal
          isOpen={isAvatarUpdateModalOpen}
          onClose={() => setIsAvatarUpdateModalOpen(false)}
          currentAvatarUrl={avatarUrl}
        />
      )}
      
      {avatarUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={avatarUser}
        />
      )}
    </>
  );
}
