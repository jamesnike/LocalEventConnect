interface AnimeAvatarProps {
  seed: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export default function AnimeAvatar({ seed, size = 'md' }: AnimeAvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-24 h-24',
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  };

  // Generate a consistent color based on the seed
  const colors = [
    'from-pink-400 to-purple-500',
    'from-blue-400 to-purple-500',
    'from-green-400 to-teal-500',
    'from-yellow-400 to-orange-500',
    'from-red-400 to-pink-500',
    'from-indigo-400 to-purple-500',
    'from-cyan-400 to-blue-500',
    'from-orange-400 to-red-500',
    'from-purple-400 to-pink-500',
    'from-teal-400 to-green-500',
  ];

  // Simple hash function to get consistent color
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  const colorIndex = hashCode(seed) % colors.length;
  const gradientColor = colors[colorIndex];

  // Generate initials from seed
  const getInitials = (seed: string) => {
    // For anime avatars, we'll use cute single letters or symbols
    const animeChars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    return animeChars[hashCode(seed) % animeChars.length];
  };

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br ${gradientColor} rounded-full flex items-center justify-center border-2 border-white shadow-sm`}>
      <span className={`text-white font-bold ${textSizeClasses[size]}`}>
        {getInitials(seed)}
      </span>
    </div>
  );
}
