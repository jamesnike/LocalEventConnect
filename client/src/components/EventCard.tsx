import { MapPin, Heart, Clock, DollarSign, Music, Activity, Palette, UtensilsCrossed, Laptop, Trash2, X } from "lucide-react";
import { EventWithOrganizer } from "@shared/schema";
import AnimeAvatar from "./AnimeAvatar";
import { getEventImageUrl } from "@/lib/eventImages";

interface EventCardProps {
  event: EventWithOrganizer;
  onEventClick: () => void;
  showStatus?: 'hosting' | 'attending';
  onRemoveClick?: () => void;
}

export default function EventCard({ event, onEventClick, showStatus, onRemoveClick }: EventCardProps) {
  const formatDate = (dateString: string) => {
    // Parse the date string as local time to avoid timezone issues
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      music: 'bg-accent',
      sports: 'bg-success',
      arts: 'bg-purple-500',
      food: 'bg-orange-500',
      tech: 'bg-blue-500',
    };
    return colors[category.toLowerCase() as keyof typeof colors] || 'bg-gray-500';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      music: '🎵',
      sports: '🏃',
      arts: '🎨',
      food: '🍽️',
      tech: '💻',
    };
    return icons[category.toLowerCase() as keyof typeof icons] || '📅';
  };

  const availableInterests = [
    { id: 'music', name: 'Music', icon: Music },
    { id: 'sports', name: 'Sports', icon: Activity },
    { id: 'arts', name: 'Arts', icon: Palette },
    { id: 'food', name: 'Food', icon: UtensilsCrossed },
    { id: 'tech', name: 'Tech', icon: Laptop },
    { id: 'photography', name: 'Photography', icon: Activity },
    { id: 'travel', name: 'Travel', icon: Activity },
    { id: 'fitness', name: 'Fitness', icon: Activity },
    { id: 'gaming', name: 'Gaming', icon: Activity },
    { id: 'reading', name: 'Reading', icon: Activity },
  ];

  return (
    <div className="bg-white shadow-sm cursor-pointer" onClick={onEventClick}>
      <div className="relative">
        <img 
          src={getEventImageUrl(event)}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md">
          {showStatus === 'hosting' && onRemoveClick ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemoveClick();
              }}
              className="text-red-500 hover:text-red-700"
              title="Cancel Event"
            >
              <X className="w-4 h-4" />
            </button>
          ) : showStatus === 'attending' && onRemoveClick ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemoveClick();
              }}
              className="text-red-500 hover:text-red-700"
              title="Remove RSVP"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <Heart className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <span className={`inline-block ${getCategoryColor(event.category)} text-white text-xs px-2 py-1 rounded-full mb-2`}>
            {getCategoryIcon(event.category)} {event.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-lg">{event.title}</h3>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <Clock className="w-3 h-3 mr-1" />
              <span>{formatDate(event.date)} • {formatTime(event.time)}</span>
            </div>
          </div>
          <div className="flex items-center ml-4">
            {event.isFree ? (
              <span className="text-success text-sm font-medium">Free</span>
            ) : (
              <div className="flex items-center text-warning text-sm font-medium">
                <DollarSign className="w-3 h-3 mr-1" />
                <span>{event.price}</span>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {event.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <div className="flex -space-x-2">
              <AnimeAvatar seed={event.organizer.animeAvatarSeed} size="xs" />
              {event.rsvpCount > 0 && (
                <>
                  <AnimeAvatar seed={`attendee_1_${event.id}`} size="xs" />
                  <AnimeAvatar seed={`attendee_2_${event.id}`} size="xs" />
                </>
              )}
            </div>
            <span className="text-sm text-gray-600">
              {event.rsvpCount > 0 ? `+${event.rsvpCount}` : '0'}
            </span>
          </div>
        </div>
        
        {event.organizer.interests && event.organizer.interests.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {event.organizer.interests.slice(0, 2).map((interest) => {
              const interestData = availableInterests.find(i => i.id === interest);
              const Icon = interestData?.icon || Activity;
              
              return (
                <div key={interest} className="flex items-center space-x-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  <Icon className="w-3 h-3" />
                  <span>{interestData?.name || interest}</span>
                </div>
              );
            })}
          </div>
        )}
        
        {showStatus && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              showStatus === 'hosting' 
                ? 'bg-primary/10 text-primary' 
                : 'bg-success/10 text-success'
            }`}>
              {showStatus === 'hosting' ? 'Hosting' : 'Attending'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
