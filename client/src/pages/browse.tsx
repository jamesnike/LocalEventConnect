import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import EventCard from "@/components/EventCard";
import CategoryFilter from "@/components/CategoryFilter";
import EventDetail from "@/components/EventDetail";
import CreateEvent from "@/components/CreateEvent";
import BottomNav from "@/components/BottomNav";
import { EventWithOrganizer } from "@shared/schema";

export default function Browse() {
  const [selectedCategory, setSelectedCategory] = useState("today_morning");
  const [selectedEvent, setSelectedEvent] = useState<EventWithOrganizer | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events", selectedCategory],
    queryFn: async () => {
      // For now, we'll show all events regardless of time filter
      // In a real app, we'd filter by event date/time on the backend
      const response = await fetch("/api/events?limit=50");
      return response.json() as Promise<EventWithOrganizer[]>;
    },
  });

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
        <h2 className="text-lg font-semibold">I am free in ...</h2>
      </header>

      {/* Category Filter */}
      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onCategoryChange={setSelectedCategory} 
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
        />
      )}
    </div>
  );
}
