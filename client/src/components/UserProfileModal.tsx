import { X, MapPin, Calendar, Star, Heart, MessageCircle } from 'lucide-react';
import { User } from '@shared/schema';
import AnimeAvatar from './AnimeAvatar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

// Available interests data for displaying icons
const availableInterests = [
  { id: 'fitness', name: 'Fitness', icon: '🏃‍♂️' },
  { id: 'cooking', name: 'Cooking', icon: '🍳' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'reading', name: 'Reading', icon: '📚' },
  { id: 'photography', name: 'Photography', icon: '📸' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'art', name: 'Art', icon: '🎨' },
  { id: 'gaming', name: 'Gaming', icon: '🎮' },
  { id: 'dancing', name: 'Dancing', icon: '💃' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'hiking', name: 'Hiking', icon: '🥾' },
  { id: 'yoga', name: 'Yoga', icon: '🧘' },
  { id: 'meditation', name: 'Meditation', icon: '🧘‍♀️' },
  { id: 'gardening', name: 'Gardening', icon: '🌱' },
  { id: 'writing', name: 'Writing', icon: '✍️' },
  { id: 'learning', name: 'Learning', icon: '🎓' },
  { id: 'volunteering', name: 'Volunteering', icon: '🤝' },
  { id: 'networking', name: 'Networking', icon: '🤝' },
  { id: 'crafts', name: 'Crafts', icon: '🎭' },
  { id: 'movies', name: 'Movies', icon: '🎬' },
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'entrepreneurship', name: 'Entrepreneurship', icon: '🚀' },
  { id: 'sustainability', name: 'Sustainability', icon: '🌍' },
  { id: 'food', name: 'Food', icon: '🍕' },
  { id: 'wine', name: 'Wine', icon: '🍷' },
  { id: 'coffee', name: 'Coffee', icon: '☕' },
  { id: 'board_games', name: 'Board Games', icon: '🎲' },
  { id: 'cycling', name: 'Cycling', icon: '🚴' },
  { id: 'swimming', name: 'Swimming', icon: '🏊' },
  { id: 'climbing', name: 'Climbing', icon: '🧗' },
  { id: 'skiing', name: 'Skiing', icon: '⛷️' },
  { id: 'surfing', name: 'Surfing', icon: '🏄' },
  { id: 'running', name: 'Running', icon: '🏃' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'golf', name: 'Golf', icon: '⛳' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'soccer', name: 'Soccer', icon: '⚽' },
  { id: 'baseball', name: 'Baseball', icon: '⚾' },
  { id: 'football', name: 'Football', icon: '🏈' },
  { id: 'fishing', name: 'Fishing', icon: '🎣' },
  { id: 'camping', name: 'Camping', icon: '🏕️' },
  { id: 'investing', name: 'Investing', icon: '📈' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'design', name: 'Design', icon: '🎨' },
  { id: 'architecture', name: 'Architecture', icon: '🏛️' },
  { id: 'history', name: 'History', icon: '📜' },
  { id: 'science', name: 'Science', icon: '🔬' },
  { id: 'nature', name: 'Nature', icon: '🌿' },
  { id: 'animals', name: 'Animals', icon: '🐕' },
  { id: 'pets', name: 'Pets', icon: '🐱' },
  { id: 'languages', name: 'Languages', icon: '🗣️' },
  { id: 'culture', name: 'Culture', icon: '🎭' },
  { id: 'spirituality', name: 'Spirituality', icon: '🕯️' },
  { id: 'mindfulness', name: 'Mindfulness', icon: '🧘‍♂️' },
  { id: 'wellness', name: 'Wellness', icon: '🌸' },
  { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
  { id: 'beauty', name: 'Beauty', icon: '💄' },
  { id: 'parenting', name: 'Parenting', icon: '👶' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'podcasts', name: 'Podcasts', icon: '🎧' },
  { id: 'comedy', name: 'Comedy', icon: '😂' },
  { id: 'theater', name: 'Theater', icon: '🎭' },
  { id: 'concerts', name: 'Concerts', icon: '🎤' }
];

// Available personality traits
const availablePersonalityTraits = [
  { id: 'adventurous', name: 'Adventurous', icon: '🌟' },
  { id: 'creative', name: 'Creative', icon: '🎨' },
  { id: 'analytical', name: 'Analytical', icon: '🔍' },
  { id: 'empathetic', name: 'Empathetic', icon: '💗' },
  { id: 'optimistic', name: 'Optimistic', icon: '🌈' },
  { id: 'organized', name: 'Organized', icon: '📋' },
  { id: 'spontaneous', name: 'Spontaneous', icon: '🎲' },
  { id: 'introverted', name: 'Introverted', icon: '🤔' },
  { id: 'extroverted', name: 'Extroverted', icon: '🎉' },
  { id: 'curious', name: 'Curious', icon: '❓' },
  { id: 'ambitious', name: 'Ambitious', icon: '🎯' },
  { id: 'relaxed', name: 'Relaxed', icon: '😌' },
  { id: 'energetic', name: 'Energetic', icon: '⚡' },
  { id: 'thoughtful', name: 'Thoughtful', icon: '💭' },
  { id: 'humorous', name: 'Humorous', icon: '😄' },
  { id: 'loyal', name: 'Loyal', icon: '🤝' },
  { id: 'independent', name: 'Independent', icon: '🦅' },
  { id: 'collaborative', name: 'Collaborative', icon: '👥' },
  { id: 'patient', name: 'Patient', icon: '⏳' },
  { id: 'driven', name: 'Driven', icon: '🚀' },
  { id: 'compassionate', name: 'Compassionate', icon: '💙' },
  { id: 'practical', name: 'Practical', icon: '🔧' },
  { id: 'innovative', name: 'Innovative', icon: '💡' },
  { id: 'reliable', name: 'Reliable', icon: '✅' },
  { id: 'flexible', name: 'Flexible', icon: '🌊' },
  { id: 'confident', name: 'Confident', icon: '💪' },
  { id: 'genuine', name: 'Genuine', icon: '🌟' },
  { id: 'supportive', name: 'Supportive', icon: '🤗' },
  { id: 'focused', name: 'Focused', icon: '🎯' },
  { id: 'open_minded', name: 'Open-minded', icon: '🌍' },
  { id: 'detail_oriented', name: 'Detail-oriented', icon: '🔍' },
  { id: 'resilient', name: 'Resilient', icon: '🛡️' },
  { id: 'passionate', name: 'Passionate', icon: '🔥' },
  { id: 'strategic', name: 'Strategic', icon: '♟️' },
  { id: 'intuitive', name: 'Intuitive', icon: '🔮' },
  { id: 'diplomatic', name: 'Diplomatic', icon: '🤝' },
  { id: 'competitive', name: 'Competitive', icon: '🏆' },
  { id: 'nurturing', name: 'Nurturing', icon: '🌱' },
  { id: 'logical', name: 'Logical', icon: '🧠' },
  { id: 'artistic', name: 'Artistic', icon: '🎨' },
  { id: 'leadership', name: 'Leadership', icon: '👑' },
  { id: 'minimalist', name: 'Minimalist', icon: '⚪' },
  { id: 'maximalist', name: 'Maximalist', icon: '🌈' },
  { id: 'systematic', name: 'Systematic', icon: '📊' },
  { id: 'spontaneous_creative', name: 'Spontaneous Creative', icon: '🎭' },
  { id: 'perfectionist', name: 'Perfectionist', icon: '✨' },
  { id: 'easy_going', name: 'Easy-going', icon: '😊' },
  { id: 'goal_oriented', name: 'Goal-oriented', icon: '🎯' },
  { id: 'people_person', name: 'People Person', icon: '👥' },
  { id: 'nature_lover', name: 'Nature Lover', icon: '🌿' },
  { id: 'tech_savvy', name: 'Tech Savvy', icon: '💻' },
  { id: 'traditional', name: 'Traditional', icon: '🏛️' },
  { id: 'modern', name: 'Modern', icon: '🔮' },
  { id: 'intellectual', name: 'Intellectual', icon: '🤓' },
  { id: 'practical_hands_on', name: 'Practical Hands-on', icon: '🔨' },
  { id: 'visionary', name: 'Visionary', icon: '🔭' },
  { id: 'down_to_earth', name: 'Down-to-earth', icon: '🌍' },
  { id: 'adventurous_spirit', name: 'Adventurous Spirit', icon: '🗺️' },
  { id: 'homebody', name: 'Homebody', icon: '🏠' },
  { id: 'social_butterfly', name: 'Social Butterfly', icon: '🦋' },
  { id: 'quiet_observer', name: 'Quiet Observer', icon: '👁️' }
];

export default function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPrivateChatMutation = useMutation({
    mutationFn: async (otherUserId: string) => {
      return apiRequest('/api/private-chats', {
        method: 'POST',
        body: JSON.stringify({ otherUserId }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: (privateChat) => {
      // Navigate to the private chat using the EventContent interface
      setLocation(`/event-content/${privateChat.id}?tab=chat&from=profile`);
      onClose();
    },
    onError: (error) => {
      console.error('Error creating private chat:', error);
      toast({
        title: "Error",
        description: "Failed to create private chat. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMessage = () => {
    createPrivateChatMutation.mutate(user.id);
  };

  if (!isOpen) return null;

  // Get user's interests with icons
  const userInterests = user.interests ? user.interests.map(interestId => {
    const interest = availableInterests.find(i => i.id === interestId);
    return interest || { id: interestId, name: interestId, icon: '🔸' };
  }) : [];

  // Get user's personality traits with icons
  const userPersonalityTraits = user.personalityTraits ? user.personalityTraits.map(traitId => {
    const trait = availablePersonalityTraits.find(t => t.id === traitId);
    return trait || { id: traitId, name: traitId, icon: '🔸' };
  }) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 text-center border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="mb-4">
            <AnimeAvatar
              seed={user.animeAvatarSeed}
              size="lg"
              customAvatarUrl={user.customAvatarUrl}
              clickable={false}
            />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {user.firstName || user.lastName 
              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
              : 'Anonymous User'}
          </h2>
          
          {user.location && (
            <div className="flex items-center justify-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{user.location}</span>
            </div>
          )}
          
          {user.aiSignature && (
            <p className="text-sm text-gray-600 italic px-4">
              "{user.aiSignature}"
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Interests */}
          {userInterests.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Heart className="w-4 h-4 mr-2 text-red-500" />
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {userInterests.map((interest) => (
                  <span
                    key={interest.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <span className="mr-1">{interest.icon}</span>
                    {interest.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Personality Traits */}
          {userPersonalityTraits.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Personality
              </h3>
              <div className="flex flex-wrap gap-2">
                {userPersonalityTraits.map((trait) => (
                  <span
                    key={trait.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    <span className="mr-1">{trait.icon}</span>
                    {trait.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Member Since */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-green-500" />
              Member Since
            </h3>
            <p className="text-gray-600 text-sm">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
              }) : 'Recently joined'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button 
              onClick={handleMessage}
              disabled={createPrivateChatMutation.isPending}
              className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {createPrivateChatMutation.isPending ? 'Creating...' : 'Message'}
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
              <Heart className="w-4 h-4 mr-2" />
              Follow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}