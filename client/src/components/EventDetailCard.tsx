import { MapPin, DollarSign, Clock, Calendar } from "lucide-react";
import { EventWithOrganizer } from "@shared/schema";
import AnimeAvatar from "./AnimeAvatar";
import { getEventImageUrl } from "@/lib/eventImages";
import { useState, useRef, useEffect } from "react";

interface EventDetailCardProps {
  event: EventWithOrganizer;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isActive: boolean;
}

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
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Overlay for swipe indication */}
        <div className={`absolute inset-0 ${getOverlayColor()} flex items-center justify-center transition-all duration-200 z-10`}>
          {getOverlayIcon()}
        </div>

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
        </div>
      </div>
    </div>
  );
}