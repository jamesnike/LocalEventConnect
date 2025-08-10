import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Users, Calendar, MapPin, Clock, DollarSign, Send, ArrowLeft, LogOut, X, Quote, Star, Heart } from "lucide-react";
import { EventWithOrganizer, ChatMessageWithUser } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useNotifications } from "@/hooks/useNotifications";
import { apiRequest } from "../../shared/queryClient";
import { getEventImageUrl } from "../../shared/eventImages";
import { motion, AnimatePresence } from "framer-motion";
import AnimeAvatar from "./AnimeAvatar";
import EventDetail from "./EventDetail";

interface EventContentCardProps {
  event: EventWithOrganizer;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isActive: boolean;
  similarEvents?: EventWithOrganizer[];
  onSimilarEventClick?: (event: EventWithOrganizer) => void;
  initialTab?: 'chat' | 'similar' | 'favorites';
  onTabChange?: (tab: 'chat' | 'similar' | 'favorites') => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showKeepExploring?: boolean;
  hasHomeLayout?: boolean;
}

/** Type for quote message handler */
type HandleQuoteMessage = (msg: ChatMessageWithUser | null) => void;

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
  showKeepExploring = false,
  hasHomeLayout = false
}: EventContentCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { markEventAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState<'chat' | 'similar' | 'favorites'>(initialTab);
  const [newMessage, setNewMessage] = useState('');
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [messages, setMessagesState] = useState<ChatMessageWithUser[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedSimilarEvent, setSelectedSimilarEvent] = useState<EventWithOrganizer | null>(null);
  const [quotedMessage, setQuotedMessage] = useState<ChatMessageWithUser | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Detect if Home page header and bottom nav are present using MutationObserver for better performance
  const [isHomeLayoutActive, setIsHomeLayoutActive] = useState(false);
  
  useEffect(() => {
    const detectHomeLayout = () => {
      const homeHeader = document.querySelector('[data-testid="home-header"]');
      const bottomNav = document.querySelector('[data-testid="bottom-nav"]');
      const hasHomeLayout = !!(homeHeader && bottomNav);
      
      setIsHomeLayoutActive(prev => {
        if (prev !== hasHomeLayout) {
          console.log('Home layout detection changed:', { 
            homeHeader: !!homeHeader, 
            bottomNav: !!bottomNav, 
            hasHomeLayout,
            previous: prev
          });
          return hasHomeLayout;
        }
        return prev;
      });
    };

    // Initial check
    detectHomeLayout();
    
    // Use MutationObserver to detect DOM changes
    const observer = new MutationObserver(() => {
      detectHomeLayout();
    });
    
    // Observe the body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }, []); // Empty dependency array since we only need to detect DOM changes

  // Auto-scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

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

  // Fetch similar events with matching category or sub-category (recent events only)
  const { data: fetchedSimilarEvents = [], error: similarEventsError, isLoading: isLoadingSimilarEvents } = useQuery({
    queryKey: ['/api/events', 'similar', event.category, event.subCategory, event.id],
    queryFn: async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      
      const response = await apiRequest(`/api/events?timeFilter=upcoming&limit=100`);
      const events = await response.json() as EventWithOrganizer[];
      
      // Filter for same category OR same sub-category, exclude current event, and only show future events
      const filtered = events.filter(e => 
        (e.category === event.category || e.subCategory === event.subCategory) && 
        e.id !== event.id &&
        e.date >= todayStr
      );
      
      // Sort by priority: exact sub-category matches first, then category matches
      const sorted = filtered.sort((a, b) => {
        const aSubCategoryMatch = a.subCategory === event.subCategory;
        const bSubCategoryMatch = b.subCategory === event.subCategory;
        
        if (aSubCategoryMatch && !bSubCategoryMatch) return -1;
        if (!aSubCategoryMatch && bSubCategoryMatch) return 1;
        
        // If both have same match type, sort by date
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      
      return sorted;
    },
    enabled: (!!event.category || !!event.subCategory) && activeTab === 'similar',
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

  // Fetch favorite messages
  const { data: favoriteMessages = [], isLoading: isLoadingFavorites, refetch: refetchFavorites } = useQuery({
    queryKey: ['/api/events', event.id, 'favorites'],
    queryFn: async () => {
      const response = await apiRequest(`/api/events/${event.id}/favorites`);
      const messages = await response.json() as ChatMessageWithUser[];
      return messages;
    },
    enabled: hasChatAccess,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });



  // Add favorite message mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest(`/api/events/${event.id}/messages/${messageId}/favorite`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to favorite message');
      }
      return response.json();
    },
    onSuccess: (_, messageId) => {
      // Invalidate messages cache to update favorites display
      queryClient.invalidateQueries({ queryKey: ['/api/events', event.id, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', event.id, 'favorites'] });
      refetchFavorites();
    },
    onError: (error) => {
      console.error('Failed to favorite message:', error);
    },
  });

  // Remove favorite message mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest(`/api/events/${event.id}/messages/${messageId}/favorite`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to remove favorite message');
      }
    },
    onSuccess: (_, messageId) => {
      // Invalidate messages cache to update favorites display
      queryClient.invalidateQueries({ queryKey: ['/api/events', event.id, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', event.id, 'favorites'] });
      refetchFavorites();
    },
    onError: (error) => {
      console.error('Failed to remove favorite message:', error);
    },
  });

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

  // Quote message handler
  const handleQuoteMessage: HandleQuoteMessage = (message: ChatMessageWithUser | null) => {
    setQuotedMessage(message);
    // Focus on the input field after setting quote
    setTimeout(() => {
      const input = document.querySelector('input[placeholder="Type a message..."]') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 100);
  };

  // Clear quote handler
  const clearQuote = () => {
    setQuotedMessage(null);
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; quotedMessageId?: number }) => {
      console.log('Sending message:', messageData, 'to event:', event.id);
      // Always use HTTP API for reliability
      const response = await apiRequest(`/api/events/${event.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
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
      // Clear quote after sending
      setQuotedMessage(null);
      // Invalidate notifications to update unread counts
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
      // Invalidate group chats to refresh activity-based sorting when user sends a message
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'group-chats'] });
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
  


  // Scroll to bottom when new messages arrive or when entering chat
  useEffect(() => {
    if (activeTab === 'chat' && allMessages.length > 0) {
      // Use a small delay to ensure messages are rendered first
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [allMessages.length, activeTab, scrollToBottom]);

  // Reset tab and clear state when event changes
  useEffect(() => {
    console.log('EventContentCard: Event changed to', event.id);
    setActiveTab(initialTab);
    setNewMessage(''); // Clear any pending message
    // Don't reset favorited messages set - let the favorites query handle it
  }, [event.id, initialTab]);

  // Mark event as read when entering the component
  useEffect(() => {
    if (isActive && hasChatAccess) {
      markEventAsRead(event.id);
    }
  }, [isActive, event.id, hasChatAccess]); // Remove markEventAsRead from dependencies to prevent infinite loop



  // Notify parent when tab changes
  const handleTabChange = (tab: 'chat' | 'similar' | 'favorites') => {
    console.log('Tab changed to:', tab, 'for event:', event.id);
    setActiveTab(tab);
    onTabChange?.(tab);
    
    // Refetch messages and mark as read when switching to chat tab
    if (tab === 'chat' && hasChatAccess) {
      refetchMessages();
      // Mark event as read when actively opening chat
      markEventAsRead(event.id);
      // Scroll to bottom when entering chat - use longer delay to account for animation
      setTimeout(() => {
        scrollToBottom();
      }, 400);
    }
    
    // Refetch favorites when switching to favorites tab
    if (tab === 'favorites' && hasChatAccess) {
      refetchFavorites();
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
      const messageData = {
        message: newMessage,
        quotedMessageId: quotedMessage?.id
      };
      // Clear quote immediately when sending
      setQuotedMessage(null);
      sendMessageMutation.mutate(messageData);
      setNewMessage('');
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 100);
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
    <div className="relative w-full h-full p-2">
      <div
        className={`bg-white overflow-hidden transform transition-all duration-300 rounded-2xl shadow-xl ${
          isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-50'
        }`}
        style={{
          height: '100%', // Full height for better screen utilization
          zIndex: isActive ? 10 : 1
        }}
      >
        {/* Top padding for better spacing */}
        <div className="h-6"></div>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-6 text-white mx-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBackClick}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h3 className="font-semibold text-lg">
                  {event.isPrivateChat ? 'Private Chat' : event.title}
                </h3>
                <div className="flex items-center space-x-2">
                  {!event.isPrivateChat && (
                    <button 
                      onClick={() => setShowMembersModal(true)}
                      className="text-sm opacity-90 hover:opacity-100 hover:underline cursor-pointer transition-opacity"
                    >
                      {event.rsvpCount + 1} members
                    </button>
                  )}
                  {event.isPrivateChat && (
                    <span className="text-sm opacity-90">1-on-1 chat</span>
                  )}
                  {event.subCategory && !event.isPrivateChat && (
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
            
            {/* Exit Chat Button - For all chats (group and private) */}
            {hasChatAccess && (
              <button
                onClick={handleExitGroupChat}
                disabled={exitGroupChatMutation.isPending}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors border border-red-300/50 text-white"
                title={event.isPrivateChat ? "Leave private chat" : "Leave group chat"}
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
        <div className="flex border-b border-gray-200 mx-4 mt-6">
          <button
            onClick={() => handleTabChange('chat')}
            className={`${event.isPrivateChat ? 'w-1/2' : 'flex-1'} py-3 px-4 text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === 'chat' 
                ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{event.isPrivateChat ? 'Private Chat' : 'Group Chat'}</span>
          </button>
          <button
            onClick={() => handleTabChange('favorites')}
            className={`${event.isPrivateChat ? 'w-1/2' : 'flex-1'} py-3 px-4 text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === 'favorites' 
                ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Favorites</span>
          </button>
          {!event.isPrivateChat && (
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
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden mx-4" style={{ 
          height: 'calc(100vh - 220px)' // Optimized height for better screen utilization
        }}>
          <AnimatePresence mode="wait">
            {activeTab === 'chat' ? (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
                onAnimationComplete={() => {
                  // Ensure scroll happens after animation completes
                  setTimeout(() => {
                    scrollToBottom();
                  }, 50);
                }}
              >
                {/* Messages */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto px-8 py-6 space-y-4"
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
                    allMessages.map((msg, index) => {
                      const isOwnMessage = msg.user.id === user?.id;
                      const currentTime = new Date(msg.createdAt);
                      const previousTime = index > 0 ? new Date(allMessages[index - 1].createdAt) : null;
                      
                      // Check if we should show timestamp (30+ minutes gap or first message)
                      const shouldShowTime = !previousTime || 
                        (currentTime.getTime() - previousTime.getTime()) >= 30 * 60 * 1000;
                      
                      return (
                        <div key={msg.id}>
                          {/* Timestamp separator */}
                          {shouldShowTime && (
                            <div className="flex justify-center mb-4">
                              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                                {currentTime.toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </span>
                            </div>
                          )}
                          
                          {/* Message */}
                          <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex flex-col max-w-[80%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                              {/* User name */}
                              <div className={`flex items-center mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                <span className="font-normal text-xs text-gray-500">
                                  {msg.user.firstName} {msg.user.lastName}
                                </span>
                              </div>
                              
                              {/* Avatar and message bubble */}
                              <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                                <AnimeAvatar 
                                  seed={msg.user.animeAvatarSeed} 
                                  size="sm"
                                  customAvatarUrl={msg.user.customAvatarUrl}
                                  clickable={msg.user.id !== user?.id}
                                  behavior="profile"
                                  user={msg.user}
                                />
                                <div className={`${isOwnMessage ? 'text-right' : 'text-left'} group relative min-w-0`}>
                                  <div className={`text-sm px-3 py-2 rounded-lg inline-block text-left min-w-0 ${
                                    isOwnMessage 
                                      ? 'bg-purple-500 text-white rounded-br-none' 
                                      : 'bg-gray-100 text-gray-700 rounded-bl-none'
                                  }`}>
                                    {/* Quoted message display */}
                                    {msg.quotedMessage && (
                                      <div className={"quoted-message"}>
                                        {/* Quoted message content here, or remove if not needed */}
                                      </div>
                                    )}
                                    {msg.message}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input Area */}
                <div className="bg-gray-100 px-8 py-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuoteMessage(quotedMessage)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                      title="Quote message"
                    >
                      <Quote className="w-5 h-5 text-gray-500" />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="p-2 hover:bg-purple-600 rounded-full transition-colors"
                      title="Send message"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'similar' ? (
              <motion.div
                key="similar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="bg-white px-8 py-6 rounded-t-2xl shadow-lg">
                  <h3 className="font-semibold text-lg mb-4">Similar Events</h3>
                  {isLoadingSimilarEvents ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                      <p className="text-gray-500 text-sm mt-2">Loading similar events...</p>
                    </div>
                  ) : similarEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">No similar events found.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {similarEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => onSimilarEventClick?.(event)}
                          className="bg-gray-50 p-4 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={getEventImageUrl({ eventImageUrl: event.eventImageUrl, category: event.category })}
                              alt={event.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h4 className="font-semibold text-base">{event.title}</h4>
                              <p className="text-sm text-gray-600">{event.description}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDateTime(event.date, event.time)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="bg-white px-8 py-6 rounded-t-2xl shadow-lg">
                  <h3 className="font-semibold text-lg mb-4">Favorites</h3>
                  {isLoadingFavorites ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                      <p className="text-gray-500 text-sm mt-2">Loading favorites...</p>
                    </div>
                  ) : favoriteMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">No favorite messages yet.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {favoriteMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className="bg-gray-50 p-4 rounded-xl shadow-sm"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <AnimeAvatar 
                              seed={msg.user.animeAvatarSeed} 
                              size="sm"
                              customAvatarUrl={msg.user.customAvatarUrl}
                              clickable={false}
                              behavior="profile"
                              user={msg.user}
                            />
                            <span className="font-semibold text-sm text-gray-700">
                              {msg.user.firstName} {msg.user.lastName}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.createdAt).toLocaleDateString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            {msg.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Members Modal */}
      {showMembersModal && (
        <EventDetail
          event={event}
          onClose={() => setShowMembersModal(false)}
        />
      )}
    </div>
  );
}