import { useState, useRef, useEffect } from "react";
import { MapPin, Clock, DollarSign, Heart, X, Info } from "lucide-react";
import { EventWithOrganizer } from "@shared/schema";
import AnimeAvatar from "./AnimeAvatar";
import { getEventImageUrl } from "@/lib/eventImages";

interface SwipeCardProps {
  event: EventWithOrganizer;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onInfoClick: () => void;
  isActive: boolean;
}

export default function SwipeCard({ event, onSwipeLeft, onSwipeRight, onInfoClick, isActive }: SwipeCardProps) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isActive) return;
    e.preventDefault(); // Prevent default behavior
    updatePosition(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isActive) return;
    e.preventDefault(); // Prevent default scroll behavior
    updatePosition(e.touches[0].clientX, e.touches[0].clientY);
  };

  const updatePosition = (clientX: number, clientY: number) => {
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    
    console.log('updatePosition:', { deltaX, deltaY, scrollOffset, isScrolling });
    
    // If already expanded, only allow vertical scrolling to close
    if (scrollOffset > 0) {
      if (deltaY < 0) {
        // Allow scrolling up to close
        setIsScrolling(true);
        setScrollOffset(Math.max(0, 200 + deltaY));
      }
      return;
    }
    
    // Determine if this is a horizontal swipe or vertical scroll
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    console.log('Movement detection:', { absX, absY, deltaYCondition: deltaY > 10 });
    
    if (absY > absX && deltaY > 10) {
      // Vertical scroll down - show more details
      console.log('Triggering scroll down');
      setIsScrolling(true);
      setScrollOffset(Math.max(0, Math.min(deltaY - 10, 200))); // Limit scroll to 200px
    } else if (absX > absY && absX > 10) {
      // Horizontal swipe - card movement
      console.log('Triggering horizontal swipe');
      setIsScrolling(false);
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
    
    console.log('handleDragEnd:', { isScrolling, scrollOffset });
    
    if (isScrolling) {
      // Handle scroll end - snap to either closed or expanded state
      if (scrollOffset > 40) {
        console.log('Snapping to expanded');
        setScrollOffset(200); // Snap to expanded details view
      } else {
        console.log('Snapping to closed');
        setScrollOffset(0); // Snap back to closed
      }
      setIsScrolling(false);
    } else {
      // Handle swipe end
      const threshold = 120;
      if (dragOffset.x > threshold) {
        onSwipeRight();
      } else if (dragOffset.x < -threshold) {
        onSwipeLeft();
      } else {
        // Snap back to center
        setDragOffset({ x: 0, y: 0 });
        setRotation(0);
      }
    }
  };

  useEffect(() => {
    if (!isDragging && !isScrolling) {
      setDragOffset({ x: 0, y: 0 });
      setRotation(0);
    }
  }, [isDragging, isScrolling]);

  const closeExpanded = () => {
    setScrollOffset(0);
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getOverlayColor = () => {
    if (dragOffset.x > 60) return 'bg-green-500/20';
    if (dragOffset.x < -60) return 'bg-red-500/20';
    return 'bg-transparent';
  };

  const getOverlayIcon = () => {
    if (dragOffset.x > 60) return <Heart className="w-16 h-16 text-green-500" />;
    if (dragOffset.x < -60) return <X className="w-16 h-16 text-red-500" />;
    return null;
  };

  return (
    <div 
      className="absolute inset-0 p-4 overflow-hidden"
      style={{ zIndex: isActive ? 10 : 1 }}
    >
      <div
        ref={cardRef}
        className="relative w-full bg-white rounded-2xl shadow-xl cursor-grab active:cursor-grabbing"
        style={{
          height: scrollOffset > 0 ? `calc(100% + ${Math.min(scrollOffset, 200)}px)` : '100%',
          transform: isScrolling || scrollOffset > 0
            ? `translateY(${-scrollOffset}px)` 
            : `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          opacity: isActive ? 1 : 0.5,
          overflow: 'visible',
          touchAction: 'none' // Prevent default touch behaviors
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

        {/* Event Image */}
        <div className="h-80 relative overflow-hidden rounded-t-2xl">
          <img 
            src={getEventImageUrl(event)}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          
          {/* Organizer Profile Photo - Top Left */}
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/40 backdrop-blur-sm rounded-full p-2 pr-3">
            <AnimeAvatar seed={event.organizer.animeAvatarSeed} size="xs" />
            <span className="text-white text-xs font-medium">
              {event.organizer.firstName || event.organizer.lastName 
                ? `${event.organizer.firstName || ''} ${event.organizer.lastName || ''}`.trim()
                : 'Anonymous'}
            </span>
          </div>
          
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
            <button onClick={onInfoClick}>
              <Info className="w-4 h-4 text-gray-700" />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>{formatDateTime(event.date, event.time)}</span>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{event.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {event.isFree || parseFloat(event.price) === 0 ? 'Free' : `$${parseFloat(event.price).toFixed(2)}`}
              </span>
            </div>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {event.description}
          </p>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-3">
              <AnimeAvatar seed={event.organizer.animeAvatarSeed} size="md" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {event.organizer.firstName || event.organizer.lastName 
                    ? `${event.organizer.firstName || ''} ${event.organizer.lastName || ''}`.trim()
                    : 'Anonymous Organizer'}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{event.rsvpCount} attending</span>
                  {event.organizer.interests && event.organizer.interests.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{event.organizer.interests.slice(0, 2).join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                event.category === 'music' ? 'bg-purple-100 text-purple-800' :
                event.category === 'sports' ? 'bg-blue-100 text-blue-800' :
                event.category === 'arts' ? 'bg-pink-100 text-pink-800' :
                event.category === 'food' ? 'bg-orange-100 text-orange-800' :
                event.category === 'tech' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {event.category}
              </div>
            </div>
          </div>
          
          {/* Scroll Down Indicator - Only show when not expanded */}
          {scrollOffset === 0 && (
            <div className="text-center pt-2 pb-1">
              <div className="inline-flex items-center space-x-1 text-gray-400 text-xs">
                <span>Scroll down for more details</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Details Section - Revealed on Scroll */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4 rounded-b-2xl">
          <div className="text-center">
            <button 
              onClick={closeExpanded}
              className="inline-block w-12 h-1 bg-gray-300 rounded-full mb-4 hover:bg-gray-400 transition-colors"
            ></button>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Event Details</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">Full Description</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {event.description}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">Event Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">
                    {formatDateTime(event.date, event.time)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{event.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">
                    {event.isFree || parseFloat(event.price) === 0 ? 'Free Event' : `$${parseFloat(event.price).toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">Organizer</h4>
              <div className="flex items-center space-x-3">
                <AnimeAvatar seed={event.organizer.animeAvatarSeed} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {event.organizer.firstName || event.organizer.lastName 
                      ? `${event.organizer.firstName || ''} ${event.organizer.lastName || ''}`.trim()
                      : 'Anonymous Organizer'}
                  </p>
                  {event.organizer.interests && event.organizer.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.organizer.interests.map((interest, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">Attendance</h4>
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">{event.rsvpCount}</span> people are attending this event
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}