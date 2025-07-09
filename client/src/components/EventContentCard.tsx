import { useState, useRef } from "react";
import { MessageCircle, Users, Calendar, MapPin, Clock, DollarSign, ArrowLeft, Send } from "lucide-react";
import { EventWithOrganizer } from "@shared/schema";
import { getEventImageUrl } from "@/lib/eventImages";
import { motion, AnimatePresence } from "framer-motion";
import AnimeAvatar from "./AnimeAvatar";

interface EventContentCardProps {
  event: EventWithOrganizer;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isActive: boolean;
  similarEvents?: EventWithOrganizer[];
}

export default function EventContentCard({ 
  event, 
  onSwipeLeft, 
  onSwipeRight, 
  isActive, 
  similarEvents = [] 
}: EventContentCardProps) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'chat' | 'similar'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: { name: "Sarah", avatarSeed: "sarah_123" },
      message: "Hey everyone! Really excited for this event 🎉",
      timestamp: "2 min ago"
    },
    {
      id: 2,
      user: { name: "Mike", avatarSeed: "mike_456" },
      message: "Same here! Should we meet at the main entrance?",
      timestamp: "1 min ago"
    },
    {
      id: 3,
      user: { name: event.organizer.name, avatarSeed: event.organizer.animeAvatarSeed },
      message: "Great! I'll be there 15 minutes early to set up. Looking forward to meeting everyone!",
      timestamp: "30 sec ago"
    }
  ]);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    setStartTime(Date.now());
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    setStartTime(Date.now());
    startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isActive) return;
    e.preventDefault();
    updatePosition(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isActive) return;
    e.preventDefault();
    updatePosition(e.touches[0].clientX, e.touches[0].clientY);
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
      return;
    }
    
    const threshold = 120;
    if (dragOffset.x > threshold) {
      onSwipeRight();
    } else if (dragOffset.x < -threshold) {
      onSwipeLeft();
    } else {
      setDragOffset({ x: 0, y: 0 });
      setRotation(0);
    }
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

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        user: { name: "You", avatarSeed: "user_current" },
        message: newMessage.trim(),
        timestamp: "now"
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    }
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={cardRef}
        className={`bg-white overflow-hidden transform transition-all duration-300 ${
          isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-50'
        }`}
        style={{
          height: 'calc(100% - 80px)',
          transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
          zIndex: isActive ? 10 : 1
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
          <div className="flex items-center space-x-3">
            <AnimeAvatar seed={event.organizer.animeAvatarSeed} size="sm" />
            <div>
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-sm opacity-90">{event.rsvpCount} members</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === 'chat' 
                ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Group Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('similar')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === 'similar' 
                ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Similar Events</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'chat' ? (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex space-x-3">
                      <AnimeAvatar seed={msg.user.avatarSeed} size="xs" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm text-gray-800">{msg.user.name}</span>
                          <span className="text-xs text-gray-500">{msg.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="similar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full overflow-y-auto p-4"
              >
                <div className="space-y-4">
                  {similarEvents.length > 0 ? (
                    similarEvents.slice(0, 3).map((similarEvent) => (
                      <div key={similarEvent.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex space-x-3">
                          <img
                            src={getEventImageUrl(similarEvent)}
                            alt={similarEvent.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-sm">{similarEvent.title}</h4>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDateTime(similarEvent.date, similarEvent.time)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{similarEvent.location}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Users className="w-3 h-3" />
                                <span>{similarEvent.rsvpCount} attending</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <DollarSign className="w-3 h-3" />
                                <span>
                                  {similarEvent.isFree || parseFloat(similarEvent.price) === 0 
                                    ? 'Free' 
                                    : `$${parseFloat(similarEvent.price).toFixed(2)}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">No similar events found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Keep Exploring Button - Bottom right with spacing */}
        <div className="absolute bottom-32 right-4 z-30">
          <button
            onClick={onSwipeRight}
            className="bg-blue-500 text-white px-10 py-5 rounded-full text-lg font-semibold shadow-lg hover:bg-blue-600 transition-colors"
          >
            Keep Exploring
          </button>
        </div>
      </div>
    </div>
  );
}