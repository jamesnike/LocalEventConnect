import { MapPin, DollarSign, Clock, Calendar, Users } from "lucide-react";
import { EventWithOrganizer } from "@shared/schema";
import AnimeAvatar from "./AnimeAvatar";
import { getEventImageUrl } from "@/lib/eventImages";
import { useState, useRef, useEffect } from "react";
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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    setStartTime(Date.now());
    setIsHorizontalSwipe(false);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    setStartTime(Date.now());
    setIsHorizontalSwipe(false);
    startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isActive) return;
    
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    // Determine if this is a horizontal swipe
    if (!isHorizontalSwipe && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setIsHorizontalSwipe(true);
    }
    
    // Only prevent default and update position for horizontal swipes
    if (isHorizontalSwipe) {
      e.preventDefault();
      updatePosition(e.clientX, e.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isActive) return;
    
    const deltaX = e.touches[0].clientX - startPos.current.x;
    const deltaY = e.touches[0].clientY - startPos.current.y;
    
    // Determine if this is a horizontal swipe
    if (!isHorizontalSwipe && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setIsHorizontalSwipe(true);
    }
    
    // Only prevent default and update position for horizontal swipes
    if (isHorizontalSwipe) {
      e.preventDefault(); // Prevent scroll only for horizontal swipes
      updatePosition(e.touches[0].clientX, e.touches[0].clientY);
    }
    // Allow vertical scrolling by not preventing default for vertical movements
  };

  const updatePosition = (clientX: number, clientY: number) => {
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > 5) {
      const newRotation = deltaX * 0.1;
      setDragOffset({ x: deltaX, y: deltaY });
      setRotation(newRotation);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || !isActive) return;
    handleDragEnd();
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isActive) return;
    handleDragEnd();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    const timeDiff = Date.now() - startTime;
    const distance = Math.sqrt(dragOffset.x * dragOffset.x + dragOffset.y * dragOffset.y);
    
    if (timeDiff < 200 && distance < 10) {
      setDragOffset({ x: 0, y: 0 });
      setRotation(0);
      setIsHorizontalSwipe(false);
      return;
    }
    
    // Only trigger swipe if it was a horizontal swipe
    if (isHorizontalSwipe) {
      const threshold = 120;
      if (dragOffset.x > threshold) {
        onSwipeRight();
      } else if (dragOffset.x < -threshold) {
        onSwipeLeft();
      } else {
        setDragOffset({ x: 0, y: 0 });
        setRotation(0);
      }
    }
    
    setIsHorizontalSwipe(false);
  };

  useEffect(() => {
    if (!isDragging) {
      setDragOffset({ x: 0, y: 0 });
      setRotation(0);
    }
  }, [isDragging]);

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

  const getOverlayColor = () => {
    if (dragOffset.x > 60) return 'bg-green-500/20';
    if (dragOffset.x < -60) return 'bg-red-500/20';
    return 'bg-transparent';
  };

  const getOverlayIcon = () => {
    if (dragOffset.x > 60) return (
      <div className="text-center">
        <div className="text-4xl font-bold text-green-500 mb-2">RSVP</div>
      </div>
    );
    if (dragOffset.x < -60) return (
      <div className="text-center">
        <div className="text-4xl font-bold text-red-500 mb-2">Skip</div>
      </div>
    );
    return null;
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
          transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
          zIndex: isActive ? 10 : 1,
          maxHeight: '100vh',
        }}

      >
        {/* Overlay for swipe indication */}
        <div className={`absolute inset-0 ${getOverlayColor()} flex items-center justify-center transition-all duration-200 z-10`}>
          {getOverlayIcon()}
        </div>

        {/* Temporarily disabled swipe zones for testing */}

        {/* Header with image */}
        <div className="relative h-48 flex-shrink-0">
          <img 
            src={getEventImageUrl(event)}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-white font-bold text-2xl mb-2 break-words">{event.title}</h2>
            <div className="flex items-center text-white/90 text-base">
              <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="break-words">{event.location}</span>
            </div>
          </div>
        </div>

        {/* Event Details Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Date and Time */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center text-gray-600 mb-2">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="text-base">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-2" />
                <span className="text-base">{formatTime(event.time)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-gray-600 mb-2">
                <DollarSign className="w-4 h-4 mr-0.5" />
                <span className="text-base">
                  {event.isFree || parseFloat(event.price) === 0 ? 'Free' : `${parseFloat(event.price).toFixed(2)}`}
                </span>
              </div>
              <div className="text-base text-gray-600">
                {event.rsvpCount} attending
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-3">About this event</h3>
            <p className="text-gray-700 text-base leading-relaxed break-words whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {/* Organizer */}
          <div className="flex items-center space-x-3">
            <AnimeAvatar 
              seed={event.organizer.animeAvatarSeed} 
              size="md"
              customAvatarUrl={event.organizer.customAvatarUrl}
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-800 break-words">
                {event.organizer.firstName || event.organizer.lastName 
                  ? `${event.organizer.firstName || ''} ${event.organizer.lastName || ''}`.trim()
                  : 'Anonymous Organizer'}
              </p>
              <p className="text-sm text-gray-600">Event Organizer</p>
              {event.organizer.aiSignature && (
                <p className="text-[10px] text-gray-500 italic mt-1 break-words">
                  "{event.organizer.aiSignature}"
                </p>
              )}
            </div>
          </div>

          {/* Event Details Section */}
          <div className="bg-gray-50 rounded-lg p-5 space-y-5 overflow-hidden">
            <h4 className="font-semibold text-gray-800 text-lg">Event Details</h4>
            
            {/* Capacity and Duration */}
            <div className="grid grid-cols-2 gap-4 text-base">
              {event.capacity && (
                <div className="min-w-0">
                  <span className="text-gray-600 block">Capacity</span>
                  <span className="font-medium text-gray-800 break-words">{event.capacity} people</span>
                </div>
              )}
              {event.duration && (
                <div className="min-w-0">
                  <span className="text-gray-600 block">Duration</span>
                  <span className="font-medium text-gray-800 break-words">{event.duration}</span>
                </div>
              )}
            </div>
            
            {/* Meeting Point */}
            {event.meetingPoint && (
              <div className="text-base">
                <span className="text-gray-600 block">Meeting Point</span>
                <span className="font-medium text-gray-800 break-words whitespace-pre-wrap">{event.meetingPoint}</span>
              </div>
            )}
            
            {/* Parking Information */}
            {event.parkingInfo && (
              <div className="text-base">
                <span className="text-gray-600 block">Parking</span>
                <span className="font-medium text-gray-800 break-words whitespace-pre-wrap">{event.parkingInfo}</span>
              </div>
            )}
            
            {/* What to Bring */}
            {event.whatToBring && (
              <div className="text-base">
                <span className="text-gray-600 block">What to Bring</span>
                <span className="font-medium text-gray-800 break-words whitespace-pre-wrap">{event.whatToBring}</span>
              </div>
            )}
            
            {/* Requirements */}
            {event.requirements && (
              <div className="text-base">
                <span className="text-gray-600 block">Requirements</span>
                <span className="font-medium text-gray-800 break-words whitespace-pre-wrap">{event.requirements}</span>
              </div>
            )}
            
            {/* Special Notes */}
            {event.specialNotes && (
              <div className="text-base">
                <span className="text-gray-600 block">Special Notes</span>
                <span className="font-medium text-gray-800 break-words whitespace-pre-wrap">{event.specialNotes}</span>
              </div>
            )}
            
            {/* Contact Information */}
            {event.contactInfo && (
              <div className="text-base">
                <span className="text-gray-600 block">Contact Info</span>
                <span className="font-medium text-gray-800 break-words whitespace-pre-wrap">{event.contactInfo}</span>
              </div>
            )}
            
            {/* Cancellation Policy */}
            {event.cancellationPolicy && (
              <div className="text-base">
                <span className="text-gray-600 block">Cancellation Policy</span>
                <span className="font-medium text-gray-800 break-words whitespace-pre-wrap">{event.cancellationPolicy}</span>
              </div>
            )}
          </div>

          {/* Action Instructions */}
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-2">
              Swipe right to RSVP • Swipe left to go back
            </p>
            <div className="flex justify-center items-center space-x-6">
              <div className="flex items-center space-x-2 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs">Go back</span>
              </div>
              <div className="flex items-center space-x-2 text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs">RSVP</span>
              </div>
            </div>
          </div>
          
          {/* Event Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">
                  {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">{event.time}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 break-words">{event.location}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">{event.rsvpCount} attending</span>
            </div>
            
            {event.price && (
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">{event.price}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                {event.category}
              </span>
              {event.subCategory && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubCategoryColor(event.subCategory)}`}>
                  {event.subCategory}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">About this event</h3>
            <p className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {/* Organizer */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Organizer</h3>
            <div className="flex items-center space-x-3">
              <AnimeAvatar 
                seed={event.organizer.id} 
                size="sm" 
                customAvatarUrl={event.organizer.customAvatarUrl}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 break-words">
                  {event.organizer.name}
                </p>
                <p className="text-sm text-gray-500 break-words">
                  {event.organizer.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}