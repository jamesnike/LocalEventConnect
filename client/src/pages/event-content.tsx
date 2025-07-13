import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import EventContentCard from "@/components/EventContentCard";
import { EventWithOrganizer } from "@shared/schema";
import { ArrowLeft } from "lucide-react";

export default function EventContentPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'similar'>('chat');
  
  // Determine access method based on URL params and localStorage flags
  const urlParams = new URLSearchParams(window.location.search);
  const hasTabParam = urlParams.get('tab') === 'chat'; // Group Chat/Rejoin Chat buttons use ?tab=chat
  
  // Check navigation context using localStorage flags
  const isFromEventDetailModal = localStorage.getItem('fromEventDetailModal') === 'true';
  const isFromBrowse = localStorage.getItem('fromBrowse') === 'true';
  const isFromMyEvents = localStorage.getItem('fromMyEvents') === 'true';
  const isFromMessages = localStorage.getItem('fromMessagesTab') === 'true';
  
  // Determine navigation source priority:
  // 1. EventDetailCard (Home page swipe interface) - direct navigation to EventContent
  // 2. EventDetail Component (Modal) - shows Group Chat button with ?tab=chat + fromEventDetailModal flag
  // 3. Messages Tab - direct navigation without ?tab=chat
  let navigationSource: 'home-eventdetail' | 'modal-eventdetail' | 'messages' = 'home-eventdetail';
  
  if (isFromMessages) {
    navigationSource = 'messages';
  } else if (isFromEventDetailModal && hasTabParam) {
    navigationSource = 'modal-eventdetail';
  } else if (hasTabParam) {
    navigationSource = 'home-eventdetail';
  }
  
  // Check if we're in Home page context (has home header and bottom nav)
  const hasHomeLayout = navigationSource === 'home-eventdetail';
  
  // Check if we have a stored RSVP'd event from EventDetail modal
  const rsvpedEventData = localStorage.getItem('rsvpedEvent');
  const storedEvent = rsvpedEventData ? JSON.parse(rsvpedEventData) : null;
  
  // Check if we have a forced event ID from EventDetail modal
  const forceEventId = localStorage.getItem('forceEventId');

  // Determine which event ID to use - forced event ID takes highest precedence
  const actualEventId = forceEventId || (storedEvent ? storedEvent.id : eventId);

  // Fetch the specific event (only if we don't have a stored event)
  const { data: fetchedEvent, isLoading: eventLoading, error } = useQuery<EventWithOrganizer>({
    queryKey: [`/api/events/${actualEventId}`],
    enabled: !!actualEventId && !!user && !authLoading && !storedEvent, // Skip fetch if we have stored event
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Use stored event if available, otherwise use fetched event
  const event = storedEvent || fetchedEvent;

  const isLoading = authLoading || eventLoading;

  // Debug logging
  console.log('🔍 EventContentPage debug:', {
    eventId,
    eventIdType: typeof eventId,
    actualEventId,
    forceEventId,
    user: !!user,
    authLoading,
    eventLoading,
    error: error?.message,
    event: !!event,
    eventTitle: event?.title,
    pathname: window.location.pathname,
    search: window.location.search,
    isRendering: 'EventContentPage is rendering',
    navigationSource,
    hasTabParam,
    isFromEventDetailModal,
    isFromBrowse,
    isFromMyEvents,
    isFromMessages,
    hasStoredEvent: !!storedEvent,
    storedEventId: storedEvent?.id,
    storedEventTitle: storedEvent?.title,
    fetchedEventId: fetchedEvent?.id,
    fetchedEventTitle: fetchedEvent?.title,
    rsvpedEventData: rsvpedEventData,
    hasHomeLayout
  });

  // Clean up stored event data when component unmounts (only if not navigating to another event page)
  useEffect(() => {
    return () => {
      // Only clean up if we're not navigating to another event page
      setTimeout(() => {
        if (!window.location.pathname.includes('/event/')) {
          localStorage.removeItem('rsvpedEvent');
          localStorage.removeItem('fromEventDetailModal');
          localStorage.removeItem('forceEventId');
          localStorage.removeItem('preventHomeAdvancement');
          localStorage.removeItem('fromBrowse');
          localStorage.removeItem('fromMyEvents');
          localStorage.removeItem('fromMessagesTab');
        }
      }, 100);
    };
  }, []);

  // Set initial tab based on URL params or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const preferredTab = urlParams.get('tab') || localStorage.getItem('preferredTab');
    if (preferredTab === 'chat' || preferredTab === 'similar') {
      setActiveTab(preferredTab);
    }
    
    // Clear localStorage after reading
    localStorage.removeItem('preferredTab');
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  // Handle authentication errors
  if (!authLoading && !user) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to view this event.</p>
            <button
              onClick={() => setLocation('/auth')}
              className="bg-primary text-white px-4 py-2 rounded-lg"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle query errors
  if (error) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Event</h2>
            <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'Unable to load event data'}</p>
            <button
              onClick={() => setLocation('/my-events')}
              className="bg-primary text-white px-4 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!event || !event.organizer || !event.organizer.animeAvatarSeed) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or is missing data.</p>
            <button
              onClick={() => setLocation('/my-events')}
              className="bg-primary text-white px-4 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Optimized full-screen layout with good padding
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Event Content - full screen with proper padding */}
      <div className="h-screen">
        <EventContentCard
          event={event}
          eventId={parseInt(actualEventId || '0')}
          onSwipeLeft={() => {}}
          onSwipeRight={() => {}}
          isActive={true}
          initialTab={activeTab}
          onTabChange={setActiveTab}
          showBackButton={true}
          showKeepExploring={false}
          onBackClick={() => {
            console.log('🔙 EventContent back button clicked');
            console.log('🔙 EventContent - navigationSource:', navigationSource);
            console.log('🔙 EventContent - actualEventId:', actualEventId);
            
            // Clear all navigation flags to prevent state issues
            localStorage.removeItem('fromEventDetailModal');
            localStorage.removeItem('rsvpedEvent');
            localStorage.removeItem('forceEventId');
            localStorage.removeItem('preventHomeAdvancement');
            localStorage.removeItem('showEventContent');
            localStorage.removeItem('eventContentTab');
            localStorage.removeItem('fromBrowse');
            localStorage.removeItem('fromMyEvents');
            localStorage.removeItem('fromMessagesTab');
            
            // Handle navigation based on source
            switch (navigationSource) {
              case 'home-eventdetail':
                // EventDetailCard --> EventContent, should go back to Home Page EventCard
                console.log('🔙 EventContent - From EventDetailCard, navigating back to Home page');
                setLocation('/');
                break;
                
              case 'modal-eventdetail':
                // EventDetail Component --> EventContent, should go back to EventDetail component
                console.log('🔙 EventContent - From EventDetail modal, navigating back to EventDetail modal');
                if (actualEventId) {
                  localStorage.setItem('reopenEventDetailId', actualEventId);
                }
                setLocation('/');
                break;
                
              case 'messages':
                // Messages Tab --> EventContent, should go back to Messages Tab
                console.log('🔙 EventContent - From Messages tab, navigating back to Messages tab');
                setLocation('/my-events?tab=messages');
                break;
                
              default:
                // Fallback to browser back
                console.log('🔙 EventContent - Using fallback browser back');
                window.history.back();
                break;
            }
          }}
          onSimilarEventClick={() => {}}
        />
      </div>
    </div>
  );
}