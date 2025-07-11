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

  // Use the regular events endpoint instead of browse to avoid infinite loop
  const { data: allEvents, isLoading } = useQuery({
    queryKey: ["/api/events", { category: undefined, timeFilter: selectedCategory }],
    queryFn: async () => {
      const response = await fetch(`/api/events?timeFilter=${selectedCategory}&limit=100`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json() as Promise<EventWithOrganizer[]>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const filteredEvents = useMemo(() => {
    if (!allEvents) return [];
    
    // Apply time filter
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return allEvents.filter(event => {
      const eventDate = event.date;
      
      switch (selectedCategory) {
        case "today_morning":
          return eventDate === today && event.time >= "06:00" && event.time <= "12:00";
        case "today_afternoon":
          return eventDate === today && event.time >= "12:00" && event.time <= "18:00";
        case "today_evening":
          return eventDate === today && event.time >= "18:00" && event.time <= "23:59";
        case "day1_morning":
          return eventDate === tomorrow && event.time >= "06:00" && event.time <= "12:00";
        case "day1_afternoon":
          return eventDate === tomorrow && event.time >= "12:00" && event.time <= "18:00";
        case "day1_evening":
          return eventDate === tomorrow && event.time >= "18:00" && event.time <= "23:59";
        case "this_week":
          const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          return new Date(eventDate) >= now && new Date(eventDate) <= nextWeek;
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