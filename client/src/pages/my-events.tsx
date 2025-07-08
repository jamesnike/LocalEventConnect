import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNav from "@/components/BottomNav";
import EventCard from "@/components/EventCard";
import EventDetail from "@/components/EventDetail";
import { EventWithOrganizer } from "@shared/schema";

export default function MyEvents() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'organized' | 'attending'>('organized');
  const [selectedEvent, setSelectedEvent] = useState<EventWithOrganizer | null>(null);

  const { data: organizedEvents } = useQuery({
    queryKey: ["/api/users", user?.id, "events", "organized"],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/users/${user.id}/events?type=organized`);
      if (!response.ok) throw new Error('Failed to fetch organized events');
      return response.json() as Promise<EventWithOrganizer[]>;
    },
    enabled: !!user?.id,
  });

  const { data: attendingEvents } = useQuery({
    queryKey: ["/api/users", user?.id, "events", "attending"],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/users/${user.id}/events?type=attending`);
      if (!response.ok) throw new Error('Failed to fetch attending events');
      return response.json() as Promise<EventWithOrganizer[]>;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentEvents = activeTab === 'organized' ? organizedEvents : attendingEvents;

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
        <h2 className="text-lg font-semibold">My Events</h2>
        <div className="w-5 h-5"></div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('organized')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'organized' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-600'
            }`}
          >
            Organized
          </button>
          <button 
            onClick={() => setActiveTab('attending')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'attending' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-600'
            }`}
          >
            Attending
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto pb-20">
        {!currentEvents || currentEvents.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {activeTab === 'organized' ? 'No Events Created' : 'No Events Attending'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'organized' 
                ? 'Create your first event to get started!'
                : 'Browse events and start attending some!'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onEventClick={() => setSelectedEvent(event)}
                showStatus={activeTab === 'organized' ? 'hosting' : 'attending'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPage="my-events" />

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetail 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </div>
  );
}
