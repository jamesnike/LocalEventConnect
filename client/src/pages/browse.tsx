import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import EventCard from "@/components/EventCard";
import CategoryFilter from "@/components/CategoryFilter";
import EventDetail from "@/components/EventDetail";
import CreateEvent from "@/components/CreateEvent";
import BottomNav from "@/components/BottomNav";
import { EventWithOrganizer } from "@shared/schema";

export default function Browse() {
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem('browseTimeFilter') || "day1_morning";
  });
  const [selectedEvent, setSelectedEvent] = useState<EventWithOrganizer | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [, setLocation] = useLocation();

  const handleCategoryChange = (timeFilter: string) => {
    setSelectedCategory(timeFilter);
    localStorage.setItem('browseTimeFilter', timeFilter);
  };

  // Use the browse endpoint with client-side timezone-aware filtering
  const { data: allEvents, isLoading } = useQuery({
    queryKey: ["/api/events/browse", { timeFilter: selectedCategory }],
    queryFn: async () => {
      const response = await fetch(`/api/events/browse?limit=100`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json() as Promise<EventWithOrganizer[]>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Client-side filtering with proper timezone handling
  const filteredEvents = useMemo(() => {
    if (!allEvents) return [];
    
    // Get current date and time in user's local timezone
    const now = new Date();
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Format dates in local timezone
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-CA');
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return allEvents.filter(event => {
      const eventDate = event.date;
      const eventTime = event.time;
      
      // Create a full datetime for comparison
      const eventDateTime = new Date(`${eventDate}T${eventTime}`);
      
      switch (selectedCategory) {
        case "today_morning":
          return eventDate === today && eventTime >= "06:00:00" && eventTime <= "11:59:59";
        case "today_afternoon":
          return eventDate === today && eventTime >= "12:00:00" && eventTime <= "17:59:59";
        case "today_evening":
          return eventDate === today && eventTime >= "18:00:00" && eventTime <= "23:59:59";
        case "day1_morning":
          return eventDate === tomorrow && eventTime >= "06:00:00" && eventTime <= "11:59:59";
        case "day1_afternoon":
          return eventDate === tomorrow && eventTime >= "12:00:00" && eventTime <= "17:59:59";
        case "day1_evening":
          return eventDate === tomorrow && eventTime >= "18:00:00" && eventTime <= "23:59:59";
        case "this_week":
          return eventDateTime >= now && eventDateTime <= nextWeek;
        case "all":
        default:
          return true;
      }
    });
  }, [allEvents, selectedCategory]);

  if (selectedEvent) {
    return (
      <EventDetail
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        fromPage="browse"
      />
    );
  }

  if (showCreateEvent) {
    return <CreateEvent onClose={() => setShowCreateEvent(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-sm mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-600" />
              <h1 className="text-xl font-bold text-gray-900">Browse Events</h1>
            </div>
          </div>
          
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your time filter or check back later for new events.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEventClick={() => setSelectedEvent(event)}
                />
              ))}
            </div>
          )}
        </div>

        <BottomNav currentPage="browse" onCreateEvent={() => setShowCreateEvent(true)} />
      </div>
    </div>
  );
}