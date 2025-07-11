import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Users, Calendar, MapPin, Clock, DollarSign, Send, ArrowLeft, LogOut, X } from "lucide-react";
import { EventWithOrganizer, ChatMessageWithUser } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useNotifications } from "@/hooks/useNotifications";
import { apiRequest } from "@/lib/queryClient";
import { getEventImageUrl } from "@/lib/eventImages";
import { motion, AnimatePresence } from "framer-motion";
import AnimeAvatar from "./AnimeAvatar";

interface EventContentCardProps {
  event: EventWithOrganizer;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isActive: boolean;
  similarEvents?: EventWithOrganizer[];
  onSimilarEventClick?: (event: EventWithOrganizer) => void;
  initialTab?: 'chat' | 'similar';
  onTabChange?: (tab: 'chat' | 'similar') => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showKeepExploring?: boolean;
}

export default function EventContentCard({ 
  event, 
  onSwipeLeft, 
  onSwipeRight, 
  isActive, 
  similarEvents: propSimilarEvents = [],
  onSimilarEventClick,
  initialTab = 'chat',
  onTabChange,
  showBackButton = false,
  onBackClick,
  showKeepExploring = false
}: EventContentCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { markEventAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState<'chat' | 'similar'>(initialTab);
  const [newMessage, setNewMessage] = useState('');
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [messages, setMessagesState] = useState<ChatMessageWithUser[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Allow all users to access chat
  const hasChatAccess = user !== null;

  // Fetch event attendees for members modal
  const { data: attendees = [] } = useQuery({
    queryKey: ['/api/events', event.id, 'attendees'],
    queryFn: async () => {
      const response = await apiRequest(`/api/events/${event.id}/attendees`);
      return response.json();
    },
    enabled: hasChatAccess,
  });

  // Fetch similar events with same category and sub-category (recent events only)
  const { data: fetchedSimilarEvents = [] } = useQuery({
    queryKey: ['/api/events', 'similar', event.category, event.subCategory, event.id],
    queryFn: async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      
      const response = await apiRequest(`/api/events?category=${encodeURIComponent(event.category)}&timeFilter=upcoming&limit=50`);
      const events = await response.json() as EventWithOrganizer[];
      
      // Filter for same sub-category, exclude current event, and only show future events
      const filtered = events.filter(e => 
        e.subCategory === event.subCategory && 
        e.id !== event.id &&
        e.date >= todayStr
      );
      
      console.log('Similar events query:', {
        currentEvent: { id: event.id, category: event.category, subCategory: event.subCategory },
        totalEvents: events.length,
        filtered: filtered.length,
        filteredEvents: filtered.map(e => ({ id: e.id, title: e.title, subCategory: e.subCategory }))
      });
      
      return filtered;
    },
    enabled: !!event.category && !!event.subCategory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getSubCategoryColor = (subCategory: string) => {
    const colors = [
      'bg-pink-500', 'bg-indigo-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
      'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500',
      'bg-teal-500', 'bg-lime-500', 'bg-fuchsia-500', 'bg-sky-500', 'bg-slate-500',
      'bg-orange-400', 'bg-purple-400', 'bg-blue-400', 'bg-green-400', 'bg-red-400'
    ];
    
    // Create a simple hash from the subcategory string to ensure consistent colors
    let hash = 0;
    for (let i = 0; i < subCategory.length; i++) {
      hash = ((hash << 5) - hash) + subCategory.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Fetch chat messages - always fetch when chat is accessed
  const { data: chatMessages = [], isLoading: isLoadingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['/api/events', event.id, 'messages', 'v2'], // Added v2 to force cache invalidation
    queryFn: async () => {
      console.log('Fetching messages for event:', event.id);
      const response = await apiRequest(`/api/events/${event.id}/messages?limit=1000`);
      console.log('Messages fetch response:', response.status);
      const messages = await response.json() as ChatMessageWithUser[];
      console.log('Received messages for event', event.id, ':', messages.length, 'messages');
      return messages;
    },
    enabled: hasChatAccess,
    staleTime: 0, // Always refetch when needed
    refetchOnWindowFocus: false,
    refetchInterval: false, // Disable auto-refresh, rely on WebSocket for real-time updates
  });

  // WebSocket connection for real-time chat - always connect when component is active
  const { isConnected, messages: wsMessages, sendMessage, setMessages: setWsMessages } = useWebSocket(
    hasChatAccess && isActive ? event.id : null
  );

  // Exit group chat mutation (leave chat but keep RSVP)
  const exitGroupChatMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/events/${event.id}/leave-chat`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to leave group chat');
      }
      return response;
    },
    onSuccess: () => {
      // Force remove cache to ensure fresh data
      queryClient.removeQueries({ queryKey: ['/api/users', user?.id, 'events'] });
      queryClient.removeQueries({ queryKey: ['/api/users', user?.id, 'group-chats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
      // Navigate back since user no longer has chat access
      if (onBackClick) {
        onBackClick();
      }
    },
    onError: (error) => {
      console.error('Failed to leave group chat:', error);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      console.log('Sending message:', message, 'to event:', event.id);
      // Always use HTTP API for reliability
      const response = await apiRequest(`/api/events/${event.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      console.log('Message sent response:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      // Check if response has content before parsing
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text) {
          return JSON.parse(text) as ChatMessageWithUser;
        }
      }
      
      // If no JSON response, return null and trigger refetch
      return null;
    },
    onSuccess: (data) => {
      console.log('Message sent successfully:', data);
      // Only invalidate notifications to update unread counts
      // WebSocket will handle real-time message updates
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });

  // Use messages from React Query directly to avoid state management issues
  const allMessages = useMemo(() => {
    // Combine API messages with WebSocket messages
    const combined = [...(chatMessages || []), ...wsMessages];
    
    // Remove duplicates by message ID
    const uniqueMessages = combined.filter((msg, index, array) => 
      array.findIndex(m => m.id === msg.id) === index
    );
    
    // Sort by creation time
    return uniqueMessages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [chatMessages, wsMessages]);

  // Use fetched similar events if available, otherwise fall back to prop
  const similarEvents = fetchedSimilarEvents.length > 0 ? fetchedSimilarEvents : propSimilarEvents;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesContainer = document.getElementById(`messages-${event.id}`);
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages.length, event.id]); // Use messages.length instead of allMessages to prevent infinite loop

  // Reset tab and clear state when event changes
  useEffect(() => {
    console.log('EventContentCard: Event changed to', event.id);
    setActiveTab(initialTab);
    setNewMessage(''); // Clear any pending message
  }, [event.id, initialTab]);

  // Mark event as read when entering the component
  useEffect(() => {
    if (isActive && hasChatAccess) {
      markEventAsRead(event.id);
    }
  }, [isActive, event.id, hasChatAccess]); // Remove markEventAsRead from dependencies to prevent infinite loop



  // Notify parent when tab changes
  const handleTabChange = (tab: 'chat' | 'similar') => {
    setActiveTab(tab);
    onTabChange?.(tab);
    
    // Refetch messages and mark as read when switching to chat tab
    if (tab === 'chat' && hasChatAccess) {
      refetchMessages();
      // Mark event as read when actively opening chat
      markEventAsRead(event.id);
    }
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    // Parse the date string as local time to avoid timezone issues
    const [year, month, day] = dateStr.split('-');
    const [hours, minutes] = timeStr.split(':');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(newMessage);
      setNewMessage('');
    }
  };

  const handleKeepExploring = () => {
    setIsButtonClicked(true);
    setTimeout(() => {
      onSwipeRight();
      setIsButtonClicked(false);
    }, 800);
  };

  const handleExitGroupChat = () => {
    if (confirm('Are you sure you want to leave this group chat? You will no longer receive messages from this event.')) {
      exitGroupChatMutation.mutate();
    }
  };

  return (
    <div className="relative w-full h-full">
      <div
        className={`bg-white overflow-hidden transform transition-all duration-300 ${
          isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-50'
        }`}
        style={{
          height: 'calc(100% - 80px)',
          zIndex: isActive ? 10 : 1
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showBackButton && (
                <button
                  onClick={onBackClick}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              )}
              <AnimeAvatar 
                seed={event.organizer.animeAvatarSeed} 
                size="sm"
                customAvatarUrl={event.organizer.customAvatarUrl}
              />
              <div>
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowMembersModal(true)}
                    className="text-sm opacity-90 hover:opacity-100 hover:underline cursor-pointer transition-opacity"
                  >
                    {event.rsvpCount + 1} members
                  </button>
                  {event.subCategory && (
                    <>
                      <span className="text-xs opacity-70">•</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getSubCategoryColor(event.subCategory)} text-white font-medium`}>
                        {event.subCategory}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Exit Group Chat Button */}
            {hasChatAccess && (
              <button
                onClick={handleExitGroupChat}
                disabled={exitGroupChatMutation.isPending}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors border border-red-300/50 text-white"
                title="Leave group chat"
              >
                <div className="flex items-center space-x-1">
                  {exitGroupChatMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span className="text-xs font-medium">Exit</span>
                    </>
                  )}
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('chat')}
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
            onClick={() => handleTabChange('similar')}
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
                <div 
                  id={`messages-${event.id}`}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {isLoadingMessages ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                      <p className="text-gray-500 text-sm mt-2">Loading messages...</p>
                    </div>
                  ) : allMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    allMessages.map((msg) => (
                      <div key={msg.id} className="flex space-x-3">
                        <AnimeAvatar 
                          seed={msg.user.animeAvatarSeed} 
                          size="xs"
                          customAvatarUrl={msg.user.customAvatarUrl}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm text-gray-800">
                              {msg.user.firstName} {msg.user.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.createdAt).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  )}
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
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="px-4 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendMessageMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
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
                      <button
                        key={similarEvent.id}
                        onClick={() => {
                          onSimilarEventClick?.(similarEvent);
                        }}
                        className="w-full border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                      >
                        <div className="flex space-x-3">
                          <img
                            src={getEventImageUrl(similarEvent)}
                            alt={similarEvent.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-sm hover:text-purple-600 transition-colors">{similarEvent.title}</h4>
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
                                <span>{similarEvent.rsvpCount + 1} attending</span>
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
                      </button>
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
        {showKeepExploring && (
          <div className="absolute bottom-32 right-4 z-30">
            <button
              onClick={handleKeepExploring}
              className={`bg-blue-500 text-white px-10 py-5 rounded-full text-lg font-semibold shadow-lg hover:bg-blue-600 transition-all duration-700 ${
                isButtonClicked ? 'scale-125 rotate-12 bg-green-500' : 'hover:scale-105'
              }`}
            >
              {isButtonClicked ? '🚀' : 'Keep Exploring'}
            </button>
          </div>
        )}
      </div>

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Event Members</h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Show organizer first */}
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <AnimeAvatar 
                  seed={event.organizer.animeAvatarSeed} 
                  size="sm"
                  customAvatarUrl={event.organizer.customAvatarUrl}
                  behavior="profile"
                  user={event.organizer}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {event.organizer.firstName} {event.organizer.lastName}
                  </p>
                  <p className="text-sm text-blue-600">Organizer</p>
                </div>
              </div>

              {/* Show attendees */}
              {attendees.filter(attendee => attendee.id !== event.organizerId).map((attendee) => (
                <div key={attendee.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <AnimeAvatar 
                    seed={attendee.animeAvatarSeed} 
                    size="sm"
                    customAvatarUrl={attendee.customAvatarUrl}
                    behavior="profile"
                    user={attendee}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {attendee.firstName} {attendee.lastName}
                    </p>
                    <p className="text-sm text-gray-500">Member</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                {event.rsvpCount + 1} total members
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}