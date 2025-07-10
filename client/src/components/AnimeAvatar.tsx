import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import AvatarUpdateModal from './AvatarUpdateModal';

interface AnimeAvatarProps {
  seed: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  customAvatarUrl?: string | null;
  clickable?: boolean;
}

export default function AnimeAvatar({ seed, size = 'md', customAvatarUrl, clickable = true }: AnimeAvatarProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  const handleClick = () => {
    if (!clickable) return;
    
    // If this is the user's own avatar (check if user exists and seed matches), show modal
    if (user && seed === user.animeAvatarSeed) {
      setIsModalOpen(true);
    } else {
      // Otherwise navigate to profile
      setLocation('/profile');
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
          src={avatarUrl}
          alt="Anime avatar"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </button>
      
      {user && (
        <AvatarUpdateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentAvatarUrl={avatarUrl}
        />
      )}
    </>
  );
}
