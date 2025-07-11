import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Plus } from "lucide-react";
import EventCard from "@/components/EventCard";
import CategoryFilter from "@/components/CategoryFilter";
import EventDetail from "@/components/EventDetail";
import CreateEvent from "@/components/CreateEvent";
import BottomNav from "@/components/BottomNav";
import { EventWithOrganizer } from "@shared/schema";

export default function Browse() {
  const [selectedCategory, setSelectedCategory] = useState(() => {
    // Load saved time filter from localStorage or default to "day1_morning" (tomorrow morning)
    return localStorage.getItem('browseTimeFilter') || "day1_morning";
  });
  const [selectedEvent, setSelectedEvent] = useState<EventWithOrganizer | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [, setLocation] = useLocation();

  // Save time filter to localStorage whenever it changes
  const handleCategoryChange = (timeFilter: string) => {
    setSelectedCategory(timeFilter);
    localStorage.setItem('browseTimeFilter', timeFilter);
  };

  const { data: allEvents, isLoading } = useQuery({
    queryKey: ["/api/events/browse"],
    queryFn: async () => {
      const response = await fetch("/api/events/browse?limit=100");
      return response.json() as Promise<EventWithOrganizer[]>;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Filter events on the frontend based on selected time filter
  const filterEventsByTime = (events: EventWithOrganizer[], timeFilter: string) => {
    if (!timeFilter || !events) return events;
    
    const [dayPart, timePart] = timeFilter.split('_');
    
    // Calculate target date
    let dayOffset = 0;
    if (dayPart === 'today') dayOffset = 0;
    else if (dayPart === 'tomorrow') dayOffset = 1;
    else if (dayPart.startsWith('day')) dayOffset = parseInt(dayPart.substring(3));
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset);
    // Use local timezone instead of UTC to avoid timezone issues
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    // Define time ranges
    let startTime: string, endTime: string;
    switch (timePart) {
      case 'morning':
        startTime = '06:00:00';
        endTime = '11:59:59';
        break;
      case 'afternoon':
        startTime = '12:00:00';
        endTime = '17:59:59';
        break;
      case 'night':
        startTime = '18:00:00';
        endTime = '23:59:59';
        break;
      default:
        return events;
    }
    
    const filteredEvents = events.filter(event => {
      return event.date === dateString && 
             event.time >= startTime && 
             event.time <= endTime;
    });
    
    // Sort filtered events by time in ascending order (earliest first)
    return filteredEvents.sort((a, b) => {
      const timeA = a.time;
      const timeB = b.time;
      return timeA.localeCompare(timeB);
    });
  };

  const events = filterEventsByTime(allEvents || [], selectedCategory);

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 text-center">
        <h2 className="text-lg font-semibold">I am free in ... (next week)</h2>
      </header>
      {/* Category Filter */}
      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onCategoryChange={handleCategoryChange} 
      />
      {/* Events List */}
      <div className="flex-1 overflow-y-auto pb-20">
        {!events || events.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No events found for this time period.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onEventClick={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        )}
      </div>
      {/* Bottom Navigation */}
      <BottomNav 
        currentPage="browse" 
        onCreateEvent={() => setShowCreateEvent(true)}
      />
      {/* Modals */}
      {showCreateEvent && (
        <CreateEvent onClose={() => setShowCreateEvent(false)} />
      )}
      {selectedEvent && (
        <EventDetail 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          fromPage="browse"
          onBack={() => setSelectedEvent(null)}
          onNavigateToContent={() => {
            // Navigate to Home page with the event content
            // Store the event ID in localStorage so Home page can pick it up
            localStorage.setItem('eventContentId', selectedEvent.id.toString());
            // Set preferred tab to chat for group chat access
            localStorage.setItem('preferredTab', 'chat');
            // Indicate that we came from Browse page
            localStorage.setItem('fromBrowse', 'true');
            setLocation('/');
          }}
        />
      )}
    </div>
  );
}
