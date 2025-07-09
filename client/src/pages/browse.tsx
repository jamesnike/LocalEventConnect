import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, Plus } from "lucide-react";
import EventCard from "@/components/EventCard";
import CategoryFilter from "@/components/CategoryFilter";
import EventDetail from "@/components/EventDetail";
import CreateEvent from "@/components/CreateEvent";
import BottomNav from "@/components/BottomNav";
import { EventWithOrganizer } from "@shared/schema";

export default function Browse() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<EventWithOrganizer | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events", selectedCategory === "all" ? undefined : selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === "all" 
        ? "/api/events?limit=50" 
        : `/api/events?category=${selectedCategory}&limit=50`;
      const response = await fetch(url);
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
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => window.history.back()}
          className="text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">Browse Events</h2>
        <Search className="w-5 h-5 text-gray-600" />
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
            <p className="text-gray-600">No events found in this category.</p>
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

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowCreateEvent(true)}
        className="fixed bottom-24 right-4 bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-30 hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Navigation */}
      <BottomNav currentPage="browse" />

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
