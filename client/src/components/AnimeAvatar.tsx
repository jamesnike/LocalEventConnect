import { useLocation } from 'wouter';

interface AnimeAvatarProps {
  seed: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export default function AnimeAvatar({ seed, size = 'md' }: AnimeAvatarProps) {
  const [, setLocation] = useLocation();
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

  // Use DiceBear API for cute anime avatars
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&size=${pixelSizes[size]}&backgroundColor=transparent`;

  return (
    <button 
      onClick={() => setLocation('/profile')}
      className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white shadow-sm bg-gradient-to-br from-pink-100 to-purple-100 hover:scale-105 transition-transform duration-200 cursor-pointer`}
    >
      <img
        src={avatarUrl}
        alt="Anime avatar"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </button>
  );
}
