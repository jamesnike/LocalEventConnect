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
  const hasHomeLayout = window.location.pathname === '/' || localStorage.getItem('fromHomeEventDetail') === 'true';
  
  // Determine back navigation context based on localStorage flags
  const fromMyEvents = localStorage.getItem('fromMyEvents') === 'true';
  const fromBrowse = localStorage.getItem('fromBrowse') === 'true';
  const fromMessagesTab = localStorage.getItem('fromMessagesTab') === 'true';

  // Fetch the specific event
  const { data: event, isLoading: eventLoading, error } = useQuery<EventWithOrganizer>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId && !!user && !authLoading,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const isLoading = authLoading || eventLoading;

  // Debug logging
  console.log('EventContentPage debug:', {
    eventId,
    eventIdType: typeof eventId,
    user: !!user,
    authLoading,
    eventLoading,
    error: error?.message,
    event: !!event,
    pathname: window.location.pathname,
    search: window.location.search,
    isRendering: 'EventContentPage is rendering',
    isFromEventDetail,
    isFromMessages
  });

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

  // Clean up localStorage flags on component unmount
  useEffect(() => {
    return () => {
      // Clean up all navigation flags when component unmounts
      localStorage.removeItem('fromMyEvents');
      localStorage.removeItem('fromBrowse');
      localStorage.removeItem('fromMessagesTab');
      localStorage.removeItem('fromHomeEventDetail');
    };
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

  // Different layouts based on access context
  if (hasHomeLayout) {
    // Home page context: shorter height, no top padding, input above nav
    return (
      <div className="max-w-sm mx-auto bg-white">
        {/* Event Content - shorter for home page with header and bottom nav */}
        <div className="h-[calc(100vh-160px)]"> {/* Adjusted height for header + bottom nav */}
          <EventContentCard
            event={event}
            onSwipeLeft={() => {}}
            onSwipeRight={() => {}}
            isActive={true}
            initialTab={activeTab}
            onTabChange={setActiveTab}
            showBackButton={false} // No back button in home context
            showKeepExploring={false}
            onBackClick={() => {}}
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
          onSwipeLeft={() => {}}
          onSwipeRight={() => {}}
          isActive={true}
          initialTab={activeTab}
          onTabChange={setActiveTab}
          showBackButton={true}
          showKeepExploring={false}
          onBackClick={() => {
            // Navigate back based on context
            if (fromMyEvents) {
              setLocation('/my-events?tab=attending');
            } else if (fromBrowse) {
              setLocation('/browse');
            } else if (fromMessagesTab) {
              setLocation('/my-events?tab=messages');
            } else {
              setLocation('/my-events?tab=messages'); // Default fallback
            }
          }}
          onSimilarEventClick={() => {}}
          hasHomeLayout={false} // Pass context to EventContentCard
        />
      </div>
    </div>
  );
}