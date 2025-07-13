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
  
  // Determine access method based on URL params and referrer
  const urlParams = new URLSearchParams(window.location.search);
  const isFromEventDetail = urlParams.get('tab') === 'chat'; // Group Chat/Rejoin Chat buttons use ?tab=chat
  const isFromMessages = !isFromEventDetail; // Messages tab navigation doesn't use ?tab=chat
  
  // Check if we're in Home page context (has home header and bottom nav)
  // Home page context: accessed from EventDetail modal (Group Chat/Rejoin Chat buttons)
  const hasHomeLayout = isFromEventDetail;
  
  // Check if we came from EventDetail modal (by checking localStorage flag)
  const isFromEventDetailModal = localStorage.getItem('fromHomeEventDetail') === 'true';
  
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
    isFromEventDetail,
    isFromMessages,
    hasStoredEvent: !!storedEvent,
    storedEventId: storedEvent?.id,
    storedEventTitle: storedEvent?.title,
    fetchedEventId: fetchedEvent?.id,
    fetchedEventTitle: fetchedEvent?.title,
    rsvpedEventData: rsvpedEventData,
    isFromEventDetailModal
  });

  // Clean up stored event data when component unmounts (only if not navigating to another event page)
  useEffect(() => {
    return () => {
      // Only clean up if we're not navigating to another event page
      setTimeout(() => {
        if (!window.location.pathname.includes('/event/')) {
          localStorage.removeItem('rsvpedEvent');
          localStorage.removeItem('fromHomeEventDetail');
          localStorage.removeItem('forceEventId');
          localStorage.removeItem('preventHomeAdvancement');
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
    
    // Clean up home layout flag if not from home layout
    if (!hasHomeLayout) {
      localStorage.removeItem('fromHomeEventDetail');
    }
  }, [hasHomeLayout]);

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

  // Different layouts based on access context
  if (hasHomeLayout) {
    // Home page context: shorter height, no top padding, input above nav
    return (
      <div className="max-w-sm mx-auto bg-white">
        {/* Event Content - shorter for home page with header and bottom nav */}
        <div className="h-[calc(100vh-160px)]"> {/* Adjusted height for header + bottom nav */}
          <EventContentCard
            event={event}
            eventId={parseInt(actualEventId || '0')}
            onSwipeLeft={() => {}}
            onSwipeRight={() => {}}
            isActive={true}
            initialTab={activeTab}
            onTabChange={setActiveTab}
            showBackButton={true} // Always show back button
            showKeepExploring={false}
            onBackClick={() => {
              console.log('🔙 EventContent back button clicked');
              console.log('🔙 EventContent - isFromEventDetailModal:', isFromEventDetailModal);
              console.log('🔙 EventContent - actualEventId:', actualEventId);
              console.log('🔙 EventContent - fromHomeEventDetail flag:', localStorage.getItem('fromHomeEventDetail'));
              
              // Clear the localStorage flag
              localStorage.removeItem('fromHomeEventDetail');
              if (isFromEventDetailModal) {
                // We came from EventDetail modal, so navigate back to home page
                // but store the event ID to reopen the EventDetail modal
                console.log('🔙 EventContent - navigating back to Home with EventDetail modal');
                localStorage.setItem('reopenEventDetailId', actualEventId!);
                setLocation('/');
              } else {
                // Default back navigation
                console.log('🔙 EventContent - using default back navigation');
                window.history.back();
              }
            }}
            onSimilarEventClick={() => {}}
            hasHomeLayout={true} // Pass context to EventContentCard
          />
        </div>
      </div>
    );
  }

  // Messages tab context: full screen standalone
  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {/* Event Content - full screen */}
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
          onBackClick={() => window.history.back()}
          onSimilarEventClick={() => {}}
          hasHomeLayout={false} // Pass context to EventContentCard
        />
      </div>
    </div>
  );
}