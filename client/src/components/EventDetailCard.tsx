import { MapPin, DollarSign, Clock, Calendar, Users } from "lucide-react";
import { EventWithOrganizer } from "@shared/schema";
import AnimeAvatar from "./AnimeAvatar";
import { getEventImageUrl } from "@/lib/eventImages";
import { useRef } from "react";
import { format } from "date-fns";

interface EventDetailCardProps {
  event: EventWithOrganizer;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isActive: boolean;
}

const getCategoryColor = (category: string) => {
  const colors = {
    'Music': 'bg-purple-100 text-purple-800',
    'Sports': 'bg-blue-100 text-blue-800',
    'Arts': 'bg-pink-100 text-pink-800',
    'Food': 'bg-orange-100 text-orange-800',
    'Tech': 'bg-green-100 text-green-800',
    'Business': 'bg-gray-100 text-gray-800',
    'Education': 'bg-yellow-100 text-yellow-800',
    'Health & Wellness': 'bg-emerald-100 text-emerald-800',
    'Entertainment': 'bg-red-100 text-red-800',
    'Community': 'bg-indigo-100 text-indigo-800',
    'Outdoor': 'bg-teal-100 text-teal-800',
    'Family': 'bg-rose-100 text-rose-800',
    'Lifestyle': 'bg-violet-100 text-violet-800'
  };
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getSubCategoryColor = (subCategory: string) => {
  const colors = [
    'bg-pink-100 text-pink-700', 'bg-indigo-100 text-indigo-700', 'bg-green-100 text-green-700',
    'bg-yellow-100 text-yellow-700', 'bg-red-100 text-red-700', 'bg-cyan-100 text-cyan-700',
    'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700',
    'bg-violet-100 text-violet-700', 'bg-teal-100 text-teal-700', 'bg-lime-100 text-lime-700',
    'bg-fuchsia-100 text-fuchsia-700', 'bg-sky-100 text-sky-700', 'bg-slate-100 text-slate-700',
    'bg-orange-100 text-orange-700', 'bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700'
  ];
  
  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < subCategory.length; i++) {
    hash = subCategory.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function EventDetailCard({ event, onSwipeLeft, onSwipeRight, isActive }: EventDetailCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    // Parse the date string as local time to avoid timezone issues
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-full">
      <div
        ref={cardRef}
        className={`bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 flex flex-col ${
          isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-50'
        }`}
        style={{
          height: '100%',
          zIndex: isActive ? 10 : 1,
          maxHeight: '100vh',
        }}
      >
        {/* Header with image */}
        <div className="relative h-48 flex-shrink-0">
          <img 
            src={getEventImageUrl(event)}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                {event.category}
              </span>
              {event.subCategory && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSubCategoryColor(event.subCategory)}`}>
                  {event.subCategory}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Event Details Content - Made scrollable with text selection */}
        <div 
          className="flex-1 p-6 space-y-6 overflow-y-auto"
          style={{
            userSelect: 'text',
            WebkitUserSelect: 'text',
            msUserSelect: 'text',
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="space-y-4">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 break-words whitespace-pre-wrap">
              {event.title}
            </h2>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="break-words min-w-0">{formatDate(event.date)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="break-words min-w-0">{formatTime(event.time)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="break-words min-w-0">{event.location}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4 flex-shrink-0" />
                <span className="break-words min-w-0">
                  {event.isFree ? 'Free' : formatPrice(event.price)}
                </span>
              </div>
            </div>

            {/* Organizer */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <AnimeAvatar seed={event.organizer.email} size="sm" clickable={false} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 break-words">
                  {event.organizer.name}
                </p>
                <p className="text-xs text-gray-600 break-words">
                  Organizer
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed break-words whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Member Count */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="break-words min-w-0">
                {event.rsvpCount + 1} members
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}