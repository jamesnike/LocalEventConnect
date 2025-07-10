import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Users, Calendar, MapPin, Clock, DollarSign, Send, ArrowLeft, LogOut } from "lucide-react";
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
}

export default function EventContentCard({ 
  event, 
  onSwipeLeft, 
  onSwipeRight, 
  isActive, 
  similarEvents = [],
  onSimilarEventClick,
  initialTab = 'chat',
  onTabChange,
  showBackButton = false,
  onBackClick
}: EventContentCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { markEventAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState<'chat' | 'similar'>(initialTab);
  const [newMessage, setNewMessage] = useState('');
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [messages, setMessagesState] = useState<ChatMessageWithUser[]>([]);

  // Allow all users to access chat
  const hasChatAccess = user !== null;

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
    refetchInterval: activeTab === 'chat' && isActive ? 5000 : false, // Auto-refresh only when chat is active AND component is active
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

  // Use messages from local state which gets updated by both API and WebSocket
  const allMessages = useMemo(() => {
    return messages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  // Set initial messages from API when loaded
  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      console.log('Setting initial messages from API for event:', event.id, chatMessages.length, 'messages');
      setMessagesState(chatMessages);
      if (setWsMessages) {
        setWsMessages(chatMessages);
      }
    } else if (chatMessages && chatMessages.length === 0) {
      console.log('Clearing messages for event:', event.id);
      setMessagesState([]);
      if (setWsMessages) {
        setWsMessages([]);
      }
    }
  }, [chatMessages, event.id, setWsMessages]); // Include setWsMessages but make sure it's stable

  // Merge WebSocket messages with existing messages for real-time updates
  useEffect(() => {
    console.log('WebSocket messages updated for event:', event.id, 'messages:', wsMessages.length);
    
    if (wsMessages.length > 0) {
      setMessagesState(prevMessages => {
        // Start with existing messages
        const existingMessages = [...prevMessages];
        
        // Add new WebSocket messages that don't already exist
        wsMessages.forEach(wsMsg => {
          const exists = existingMessages.some(msg => msg.id === wsMsg.id);
          if (!exists) {
            console.log('Adding new WebSocket message:', wsMsg.id);
            existingMessages.push(wsMsg);
          }
        });
        
        // Sort by creation time
        return existingMessages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    }
  }, [wsMessages, event.id]); // Keep event.id for proper cleanup when event changes

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesContainer = document.getElementById(`messages-${event.id}`);
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [allMessages, event.id]);

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
  }, [isActive, event.id, hasChatAccess]); // Removed markEventAsRead from dependencies to prevent infinite loop



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
              <AnimeAvatar seed={event.organizer.animeAvatarSeed} size="sm" />
              <div>
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-sm opacity-90">{event.rsvpCount} members</p>
              </div>
            </div>
            
            {/* Exit Group Chat Button */}
            {(() => {
              // Check if event is in the past
              const eventDate = new Date(event.date + 'T' + event.time);
              const now = new Date();
              const isPastEvent = eventDate < now;
              
              // For past events, show exit button for all participants (organizers and attendees)
              // For current/future events, show exit button only for non-organizers
              const shouldShow = hasChatAccess && (
                isPastEvent || // Show for all participants in past events
                event.organizer.id !== user?.id // Show for non-organizers in current/future events
              );
              
              return shouldShow;
            })() && (
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
                        <AnimeAvatar seed={msg.user.animeAvatarSeed} size="xs" />
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
        {!showBackButton && (
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
    </div>
  );
}