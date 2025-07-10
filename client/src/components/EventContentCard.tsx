import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Users, Calendar, MapPin, Clock, DollarSign, Send, ArrowLeft } from "lucide-react";
import { EventWithOrganizer, ChatMessageWithUser } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
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
  const [activeTab, setActiveTab] = useState<'chat' | 'similar'>(initialTab);
  const [newMessage, setNewMessage] = useState('');
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  // WebSocket connection for real-time chat
  const { isConnected, messages: wsMessages, sendMessage, setMessages } = useWebSocket(
    activeTab === 'chat' ? event.id : null
  );

  // Fetch chat messages
  const { data: chatMessages = [], isLoading: isLoadingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['/api/events', event.id, 'messages'],
    queryFn: async () => {
      console.log('Fetching messages for event:', event.id);
      const response = await apiRequest(`/api/events/${event.id}/messages`);
      console.log('Messages fetch response:', response.status);
      const messages = await response.json() as ChatMessageWithUser[];
      console.log('Received messages:', messages);
      return messages;
    },
    enabled: activeTab === 'chat' && user !== null,
    staleTime: 0, // Always refetch when needed
    refetchOnWindowFocus: false,
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
      // Immediately invalidate and refetch messages to show the new message
      queryClient.invalidateQueries({ queryKey: ['/api/events', event.id, 'messages'] });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });

  // Combine API messages with WebSocket messages
  const allMessages = [...chatMessages, ...wsMessages.filter(wsMsg => 
    !chatMessages.some(apiMsg => apiMsg.id === wsMsg.id)
  )];

  // Set initial messages from API when loaded
  useEffect(() => {
    if (chatMessages.length > 0) {
      setMessages(chatMessages);
    }
  }, [chatMessages, setMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesContainer = document.getElementById(`messages-${event.id}`);
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [allMessages, event.id]);

  // Reset tab when event changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [event.id, initialTab]);

  // Notify parent when tab changes
  const handleTabChange = (tab: 'chat' | 'similar') => {
    setActiveTab(tab);
    onTabChange?.(tab);
    
    // Refetch messages when switching to chat tab
    if (tab === 'chat') {
      refetchMessages();
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