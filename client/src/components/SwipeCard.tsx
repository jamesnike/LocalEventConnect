import { useState, useRef, useEffect } from "react";
import { MapPin, Clock, DollarSign, Heart, X, Info } from "lucide-react";
import { EventWithOrganizer } from "@shared/schema";
import AnimeAvatar from "./AnimeAvatar";

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
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

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
    updatePosition(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isActive) return;
    updatePosition(e.touches[0].clientX, e.touches[0].clientY);
  };

  const updatePosition = (clientX: number, clientY: number) => {
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    const newRotation = deltaX * 0.1;
    
    setDragOffset({ x: deltaX, y: deltaY });
    setRotation(newRotation);
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
  };

  useEffect(() => {
    if (!isDragging) {
      setDragOffset({ x: 0, y: 0 });
      setRotation(0);
    }
  }, [isDragging]);

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

  const getCategoryImageUrl = (category: string) => {
    const categoryImages = {
      music: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
      sports: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
      arts: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
      food: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
      tech: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
    };
    return categoryImages[category.toLowerCase() as keyof typeof categoryImages] || 
           'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
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
      className="absolute inset-0 p-3"
      style={{ zIndex: isActive ? 10 : 1 }}
    >
      <div
        ref={cardRef}
        className="relative w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          opacity: isActive ? 1 : 0.5,
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
        <div className="h-96 relative overflow-hidden">
          <img 
            src={event.eventImageUrl || getCategoryImageUrl(event.category)}
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
        </div>
      </div>
    </div>
  );
}