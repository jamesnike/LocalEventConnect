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
    search: window.location.search
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

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {/* Event Content */}
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
          fromEventDetailCard={false}
          isStandalonePage={true}
          onBackClick={() => setLocation('/my-events?tab=messages')}
          onSimilarEventClick={() => {
            // EventDetail is now handled directly within EventContentCard
          }}
        />
      </div>
    </div>
  );
}