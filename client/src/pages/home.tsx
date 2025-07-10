import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Bell, Music, Activity, Palette, UtensilsCrossed, Laptop, X, Heart, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import SwipeCard from "@/components/SwipeCard";
import EventDetailCard from "@/components/EventDetailCard";
import EventContentCard from "@/components/EventContentCard";
import CelebrationAnimation from "@/components/CelebrationAnimation";
import SkipAnimation from "@/components/SkipAnimation";
import CreateEvent from "@/components/CreateEvent";
import EventDetail from "@/components/EventDetail";
import BottomNav from "@/components/BottomNav";
import AnimeAvatar from "@/components/AnimeAvatar";
import { EventWithOrganizer } from "@shared/schema";

// Helper functions for state persistence
const saveHomeState = (state: any) => {
  try {
    localStorage.setItem('homePageState', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save home state:', error);
  }
};

const loadHomeState = () => {
  try {
    const saved = localStorage.getItem('homePageState');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load home state:', error);
    return null;
  }
};

const clearHomeState = () => {
  try {
    localStorage.removeItem('homePageState');
  } catch (error) {
    console.error('Failed to clear home state:', error);
  }
};

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { totalUnread } = useNotifications();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Initialize state - always start with Event Card page when refreshed
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithOrganizer | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(() => {
    // Check if coming from other pages with specific event
    const eventContentId = localStorage.getItem('eventContentId');
    if (eventContentId) {
      const saved = loadHomeState();
      return saved?.currentEventIndex || 0;
    }
    // Always start at 0 for fresh page loads
    return 0;
  });
  const [swipedEvents, setSwipedEvents] = useState<Set<number>>(() => {
    // Check if coming from other pages with specific event
    const eventContentId = localStorage.getItem('eventContentId');
    if (eventContentId) {
      const saved = loadHomeState();
      return saved?.swipedEvents ? new Set(saved.swipedEvents) : new Set();
    }
    // Always start fresh for page refreshes
    return new Set();
  });
  // Remove skipped events and counter from localStorage state - now handled by database
  const [showDetailCard, setShowDetailCard] = useState(false); // Always start with Event Card
  const [showContentCard, setShowContentCard] = useState(false); // Always start with Event Card
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSkipAnimation, setShowSkipAnimation] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastActiveTab, setLastActiveTab] = useState<'chat' | 'similar'>(() => {
    const saved = loadHomeState();
    return saved?.lastActiveTab || 'chat';
  });
  const [isFromMyEvents, setIsFromMyEvents] = useState(false);
  const [isFromBrowse, setIsFromBrowse] = useState(false);
  const [isFromMessagesTab, setIsFromMessagesTab] = useState(false);
  const [eventFromMyEvents, setEventFromMyEvents] = useState<EventWithOrganizer | null>(null);

  const availableInterests = [
    { id: 'music', name: 'Music', icon: Music },
    { id: 'sports', name: 'Sports', icon: Activity },
    { id: 'arts', name: 'Arts', icon: Palette },
    { id: 'food', name: 'Food', icon: UtensilsCrossed },
    { id: 'tech', name: 'Tech', icon: Laptop },
    { id: 'photography', name: 'Photography', icon: Activity },
    { id: 'travel', name: 'Travel', icon: Activity },
    { id: 'fitness', name: 'Fitness', icon: Activity },
    { id: 'gaming', name: 'Gaming', icon: Activity },
    { id: 'reading', name: 'Reading', icon: Activity },
  ];

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      // For home page swipe interface, show all events for broader discovery
      const response = await fetch("/api/events?limit=50");
      return response.json() as Promise<EventWithOrganizer[]>;
    },
  });

  // Reset to Event Card view when page is refreshed (unless coming from other pages)
  useEffect(() => {
    const eventContentId = localStorage.getItem('eventContentId');
    
    // If no specific event navigation, ensure we start with Event Card view
    if (!eventContentId) {
      setShowDetailCard(false);
      setShowContentCard(false);
      setSelectedEvent(null);
      setCurrentEventIndex(0);
      setSwipedEvents(new Set());
      clearHomeState();
    }
  }, []);  // Only run once on mount

  // Check for event ID from localStorage (when navigating from other pages)
  useEffect(() => {
    const eventContentId = localStorage.getItem('eventContentId');
    const fromMyEvents = localStorage.getItem('fromMyEvents');
    const fromBrowse = localStorage.getItem('fromBrowse');
    const fromMessagesTab = localStorage.getItem('fromMessagesTab');
    const preferredTab = localStorage.getItem('preferredTab');
    
    if (eventContentId && events) {
      const eventId = parseInt(eventContentId);
      const eventIndex = events.findIndex(e => e.id === eventId);
      
      if (eventIndex !== -1) {
        const event = events[eventIndex];
        
        // Remove from swipedEvents to ensure it's available
        setSwipedEvents(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
        
        // Calculate the correct index in availableEvents after removing from swipedEvents
        const updatedAvailableEvents = events.filter(e => 
          (!swipedEvents.has(e.id) || e.id === eventId) && 
          e.organizerId !== user?.id && 
          e.userRsvpStatus !== 'going' && 
          e.userRsvpStatus !== 'attending'
        );
        const availableEventIndex = updatedAvailableEvents.findIndex(e => e.id === eventId);
        
        // Set up the interface to show EventContent for this event
        setCurrentEventIndex(availableEventIndex >= 0 ? availableEventIndex : 0);
        setShowContentCard(true);
        setShowDetailCard(false);
        
        // Set the preferred tab if specified
        if (preferredTab === 'chat' || preferredTab === 'similar') {
          setLastActiveTab(preferredTab);
        }
        
        // Check if coming from My Events
        if (fromMyEvents === 'true') {
          setIsFromMyEvents(true);
          setEventFromMyEvents(event); // Store the event for back navigation
        }
        
        // Check if coming from Browse page
        if (fromBrowse === 'true') {
          setIsFromBrowse(true);
        }
        
        // Check if coming from Messages tab specifically
        if (fromMessagesTab === 'true') {
          setIsFromMessagesTab(true);
        }
        
        // Clear the localStorage
        localStorage.removeItem('eventContentId');
        localStorage.removeItem('fromMyEvents');
        localStorage.removeItem('fromBrowse');
        localStorage.removeItem('fromMessagesTab');
        localStorage.removeItem('preferredTab');
      }
    }
  }, [events]);

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number; status: string }) => {
      await apiRequest(`/api/events/${eventId}/rsvp`, { 
        method: 'POST',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events", "attending"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please Sign In",
          description: "You need to sign in to RSVP to events.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save state whenever key state changes (removed skipped events - now handled by database)
  useEffect(() => {
    const stateToSave = {
      currentEventIndex,
      swipedEvents: Array.from(swipedEvents),
      showDetailCard,
      showContentCard,
      lastActiveTab,
    };
    saveHomeState(stateToSave);
  }, [currentEventIndex, swipedEvents, showDetailCard, showContentCard, lastActiveTab]);

  const availableEvents = events?.filter(event => 
    !swipedEvents.has(event.id) && 
    event.organizerId !== user?.id && 
    event.userRsvpStatus !== 'going' && 
    event.userRsvpStatus !== 'attending'
  ) || [];
  const currentEvent = availableEvents[currentEventIndex];

  // Reset local state when events data changes due to RSVPs/skips from other pages
  useEffect(() => {
    if (!events) return;
    
    // Check if any previously swiped events now have RSVP status or should be excluded
    const shouldResetState = Array.from(swipedEvents).some(eventId => {
      const event = events.find(e => e.id === eventId);
      return event && (
        event.userRsvpStatus === 'going' || 
        event.userRsvpStatus === 'attending' ||
        event.organizerId === user?.id
      );
    });
    
    if (shouldResetState) {
      console.log('Resetting Home page state due to RSVP changes from other pages');
      setSwipedEvents(new Set());
      setCurrentEventIndex(0);
      setShowDetailCard(false);
      setShowContentCard(false);
      clearHomeState();
    }
  }, [events, user?.id]);

  // Clear state when user has swiped through all events
  useEffect(() => {
    if (events && events.length > 0 && availableEvents.length === 0 && swipedEvents.size > 0) {
      // User has swiped through all events, reset state
      setCurrentEventIndex(0);
      setSwipedEvents(new Set());
      setShowDetailCard(false);
      setShowContentCard(false);
      clearHomeState();
    }
  }, [events, availableEvents.length, swipedEvents.size]);

  const handleSwipeLeft = async () => {
    if (!currentEvent || isTransitioning) return;
    if (showContentCard) {
      // From content card, go back to main and move to next event
      setSwipedEvents(prev => new Set(prev).add(currentEvent.id));
      setCurrentEventIndex(prev => prev + 1);
      
      // Increment events shown counter in database
      if (user) {
        try {
          await apiRequest('/api/events/increment-shown', { method: 'POST' });
        } catch (error) {
          console.error('Error incrementing events shown:', error);
        }
      }
      
      setShowContentCard(false);
      setIsFromMyEvents(false); // Reset flag
      setEventFromMyEvents(null); // Clear stored event
    } else if (showDetailCard) {
      // From detail card, skip to next event
      setShowSkipAnimation(true);
      setShowDetailCard(false);
    } else {
      // From main card, skip this event with animation
      setShowSkipAnimation(true);
    }
  };

  const handleBackToEventDetail = () => {
    if (eventFromMyEvents) {
      setSelectedEvent(eventFromMyEvents);
      setShowContentCard(false);
      // Don't reset isFromMyEvents here - keep it true to show Group Chat button
      setEventFromMyEvents(null);
    }
  };

  const handleSkipAnimationComplete = async () => {
    setShowSkipAnimation(false);
    
    // Add event to skipped events in database
    if (user && currentEvent) {
      try {
        await apiRequest(`/api/events/${currentEvent.id}/skip`, { method: 'POST' });
        // Invalidate the events query to refetch with updated skipped events
        queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      } catch (error) {
        console.error('Error skipping event:', error);
      }
    }
    
    setCurrentEventIndex(prev => prev + 1);
  };

  const handleContentSwipeRight = async () => {
    // From content card, move to next event
    setSwipedEvents(prev => new Set(prev).add(currentEvent.id));
    setCurrentEventIndex(prev => prev + 1);
    
    // Increment events shown counter in database
    if (user) {
      try {
        await apiRequest('/api/events/increment-shown', { method: 'POST' });
      } catch (error) {
        console.error('Error incrementing events shown:', error);
      }
    }
    
    setShowContentCard(false);
  };

  const handleSwipeRight = async () => {
    if (!currentEvent || isTransitioning) return;
    if (showDetailCard) {
      // From detail card, RSVP and show celebration
      if (user) {
        try {
          await rsvpMutation.mutateAsync({ eventId: currentEvent.id, status: 'attending' });
          setShowCelebration(true);
          setShowDetailCard(false);
        } catch (error) {
          console.error('Error during RSVP:', error);
        }
      }
    } else {
      // From main card, show detail card
      setIsTransitioning(true);
      setTimeout(() => {
        setShowDetailCard(true);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleCelebrationComplete = async () => {
    setShowCelebration(false);
    setShowContentCard(true);
    
    // Increment events shown counter in database
    if (user) {
      try {
        await apiRequest('/api/events/increment-shown', { method: 'POST' });
        // Force cache invalidation to ensure RSVP'd event is removed from future queries
        queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      } catch (error) {
        console.error('Error incrementing events shown:', error);
      }
    }
  };

  const handleUndo = () => {
    if (isTransitioning) return;
    if (showDetailCard) {
      // If in detail view, go back to main card
      setIsTransitioning(true);
      setTimeout(() => {
        setShowDetailCard(false);
        setIsTransitioning(false);
      }, 150);
      return;
    }
    if (swipedEvents.size === 0) return;
    const lastSwipedEvent = Array.from(swipedEvents).pop();
    if (lastSwipedEvent) {
      setSwipedEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(lastSwipedEvent);
        return newSet;
      });
      setCurrentEventIndex(prev => Math.max(0, prev - 1));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* User Avatar */}
          <div className="flex items-center space-x-3">
            <AnimeAvatar seed={user?.animeAvatarSeed || user?.id || "default"} size="sm" />
            
            {/* User Signature */}
            <div className="flex items-center space-x-1">
              {user?.aiSignature ? (
                <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-[10px] italic leading-tight">
                  "{user.aiSignature}"
                </div>
              ) : (
                <span className="text-xs text-gray-500">Set signature</span>
              )}
            </div>
          </div>
          
          {/* Location and Notifications */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-gray-600">
                {user?.location || "San Francisco, CA"}
              </span>
            </div>
            <button 
              onClick={() => setLocation('/my-events?tab=messages')}
              className="relative p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {totalUnread > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Swipe Area */}
      <div className="flex-1 relative bg-gray-50 overflow-hidden">
        {availableEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">All caught up!</h3>
              <p className="text-gray-600">No more events to discover right now.</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Main Event Card */}
            <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${
              showDetailCard ? 'transform -translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'
            }`}>
              <div className="relative w-full h-full">
                {/* Render current and next event cards */}
                {availableEvents.slice(currentEventIndex, currentEventIndex + 2).map((event, index) => (
                  <SwipeCard
                    key={event.id}
                    event={event}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onInfoClick={() => setSelectedEvent(event)}
                    isActive={index === 0}
                  />
                ))}
              </div>
            </div>

            {/* Detail Card */}
            <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${
              showDetailCard ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'
            }`}>
              <div className="flex items-center justify-center h-full">
                <EventDetailCard
                  event={currentEvent}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  isActive={showDetailCard}
                />
              </div>
            </div>

            {/* Content Card */}
            <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${
              showContentCard ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'
            }`}>
              <div className="w-full h-full">
                <EventContentCard
                  event={currentEvent}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleContentSwipeRight}
                  isActive={showContentCard}
                  similarEvents={availableEvents.filter(e => e.id !== currentEvent?.id && e.category === currentEvent?.category).slice(0, 3)}
                  onSimilarEventClick={(event) => setSelectedEvent(event)}
                  initialTab={lastActiveTab}
                  onTabChange={setLastActiveTab}
                  showBackButton={isFromMyEvents || isFromBrowse || isFromMessagesTab}
                  onBackClick={() => {
                    if (isFromMessagesTab) {
                      // Go back to My Events page with Messages tab active
                      setLocation('/my-events');
                    } else if (isFromMyEvents) {
                      // Go back to EventDetail for this event (came from EventDetail in My Events)
                      setSelectedEvent(currentEvent);
                      setShowContentCard(false);
                    } else if (isFromBrowse) {
                      // Go back to Browse page
                      setLocation('/browse');
                    } else {
                      // Default: just close the content card and return to main swipe interface
                      setShowContentCard(false);
                      setShowDetailCard(false);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Hidden when EventContent is active */}
      {!showContentCard && (
        <div className="absolute bottom-24 left-0 right-0 px-4 py-4 flex-shrink-0 z-20">
          <div className="flex justify-center space-x-16">
            <button
              onClick={handleSwipeLeft}
              disabled={!currentEvent || isTransitioning}
              className="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
            
            <button
              onClick={handleSwipeRight}
              disabled={!currentEvent || isTransitioning}
              className={`w-14 h-14 ${showDetailCard ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
            >
              {showDetailCard ? (
                <Heart className="w-6 h-6" />
              ) : (
                <ArrowRight className="w-6 h-6" />
              )}
            </button>
          </div>
          
          {/* Action Labels */}
          <div className="flex justify-center space-x-16 mt-2">
            <span className="text-xs text-gray-600 w-14 text-center">
              Skip
            </span>
            <span className="text-xs text-gray-600 w-14 text-center">
              {showDetailCard ? 'RSVP' : 'Details'}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav 
        currentPage="home" 
        onCreateEvent={() => setShowCreateEvent(true)}
      />

      {/* Celebration Animation */}
      <CelebrationAnimation 
        isVisible={showCelebration} 
        onComplete={handleCelebrationComplete}
      />

      {/* Skip Animation */}
      <SkipAnimation 
        isVisible={showSkipAnimation} 
        onComplete={handleSkipAnimationComplete}
      />

      {/* Modals */}
      {showCreateEvent && (
        <CreateEvent onClose={() => setShowCreateEvent(false)} />
      )}
      
      {selectedEvent && (
        <EventDetail 
          event={selectedEvent} 
          onClose={() => {
            setSelectedEvent(null);
            setIsFromMyEvents(false);
            setEventFromMyEvents(null);
          }} 
          onSkip={() => {
            // Skip to next event when not from My Events
            if (!isFromMyEvents) {
              handleSwipeLeft();
            }
            setSelectedEvent(null);
            setIsFromMyEvents(false);
            setEventFromMyEvents(null);
          }}
          showGroupChatButton={isFromMyEvents}
          onNavigateToContent={() => {
            // Store the selected event in localStorage and navigate
            localStorage.setItem('eventContentId', selectedEvent.id.toString());
            localStorage.setItem('preferredTab', 'chat');
            if (isFromMyEvents) {
              localStorage.setItem('fromMyEvents', 'true');
            }
            
            // Close the modal and let the useEffect handle the navigation
            setSelectedEvent(null);
            setIsFromMyEvents(false);
            setEventFromMyEvents(null);
          }}
        />
      )}
    </div>
  );
}