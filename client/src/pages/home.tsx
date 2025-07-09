import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Bell, Plus, Music, Activity, Palette, UtensilsCrossed, Laptop, X, Heart, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import SwipeCard from "@/components/SwipeCard";
import EventDetailCard from "@/components/EventDetailCard";
import CreateEvent from "@/components/CreateEvent";
import EventDetail from "@/components/EventDetail";
import BottomNav from "@/components/BottomNav";
import AnimeAvatar from "@/components/AnimeAvatar";
import { EventWithOrganizer } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithOrganizer | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [swipedEvents, setSwipedEvents] = useState<Set<number>>(new Set());
  const [showDetailCard, setShowDetailCard] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const availableInterests = [
    { id: 'music', name: 'Music', icon: Music },
    { id: 'sports', name: 'Sports', icon: Activity },
    { id: 'arts', name: 'Arts', icon: Palette },
    { id: 'food', name: 'Food', icon: UtensilsCrossed },
    { id: 'tech', name: 'Tech', icon: Laptop },
    { id: 'photography', name: 'Photography', icon: Activity },
    { id: 'travel', name: 'Travel', icon: Activity },
    { id: 'fitness', name: 'Fitness', icon: Activity },
    { id: 'gaming', name: 'Gaming', icon: Activity },
    { id: 'reading', name: 'Reading', icon: Activity },
  ];

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await fetch("/api/events?limit=50");
      return response.json() as Promise<EventWithOrganizer[]>;
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number; status: string }) => {
      await apiRequest("POST", `/api/events/${eventId}/rsvp`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events", "attending"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please Sign In",
          description: "You need to sign in to RSVP to events.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const availableEvents = events?.filter(event => !swipedEvents.has(event.id)) || [];
  const currentEvent = availableEvents[currentEventIndex];

  const handleSwipeLeft = () => {
    if (!currentEvent || isTransitioning) return;
    if (showDetailCard) {
      // From detail card, go back to main card
      setIsTransitioning(true);
      setTimeout(() => {
        setShowDetailCard(false);
        setIsTransitioning(false);
      }, 150);
    } else {
      // From main card, skip this event
      setSwipedEvents(prev => new Set(prev).add(currentEvent.id));
      setCurrentEventIndex(prev => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    if (!currentEvent || isTransitioning) return;
    if (showDetailCard) {
      // From detail card, RSVP and move to next event
      if (user) {
        rsvpMutation.mutate({ eventId: currentEvent.id, status: 'attending' });
      }
      setSwipedEvents(prev => new Set(prev).add(currentEvent.id));
      setCurrentEventIndex(prev => prev + 1);
      setShowDetailCard(false);
    } else {
      // From main card, show detail card
      setIsTransitioning(true);
      setTimeout(() => {
        setShowDetailCard(true);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleUndo = () => {
    if (isTransitioning) return;
    if (showDetailCard) {
      // If in detail view, go back to main card
      setIsTransitioning(true);
      setTimeout(() => {
        setShowDetailCard(false);
        setIsTransitioning(false);
      }, 150);
      return;
    }
    if (swipedEvents.size === 0) return;
    const lastSwipedEvent = Array.from(swipedEvents).pop();
    if (lastSwipedEvent) {
      setSwipedEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(lastSwipedEvent);
        return newSet;
      });
      setCurrentEventIndex(prev => Math.max(0, prev - 1));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* User Avatar */}
          <div className="flex items-center space-x-3">
            <AnimeAvatar seed={user?.animeAvatarSeed || user?.id || "default"} size="sm" />
            
            {/* User Interests */}
            <div className="flex items-center space-x-1">
              {user?.interests && user.interests.length > 0 ? (
                user.interests.slice(0, 2).map((interest) => {
                  const interestData = availableInterests.find(i => i.id === interest);
                  const Icon = interestData?.icon || Activity;
                  
                  return (
                    <div key={interest} className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      <Icon className="w-3 h-3" />
                      <span>{interestData?.name || interest}</span>
                    </div>
                  );
                })
              ) : (
                <span className="text-xs text-gray-500">Set interests</span>
              )}
            </div>
          </div>
          
          {/* Location and Notifications */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-gray-600">
                {user?.location || "San Francisco, CA"}
              </span>
            </div>
            <Bell className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </header>

      {/* Swipe Area */}
      <div className="flex-1 relative bg-gray-50 overflow-hidden">
        {availableEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">All caught up!</h3>
              <p className="text-gray-600">No more events to discover right now.</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Main Event Card */}
            <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${
              showDetailCard ? 'transform -translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'
            }`}>
              <div className="relative w-full h-full">
                {/* Render current and next event cards */}
                {availableEvents.slice(currentEventIndex, currentEventIndex + 2).map((event, index) => (
                  <SwipeCard
                    key={event.id}
                    event={event}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onInfoClick={() => setSelectedEvent(event)}
                    isActive={index === 0}
                  />
                ))}
              </div>
            </div>

            {/* Detail Card */}
            <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${
              showDetailCard ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'
            }`}>
              <div className="flex items-center justify-center h-full">
                <EventDetailCard
                  event={currentEvent}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  isActive={showDetailCard}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Floating over event card */}
      <div className="absolute bottom-24 left-0 right-0 px-4 py-4 flex-shrink-0 z-20">
        <div className="flex justify-center space-x-16">
          <button
            onClick={handleSwipeLeft}
            disabled={!currentEvent || isTransitioning}
            className="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {showDetailCard ? (
              <ArrowLeft className="w-6 h-6" />
            ) : (
              <X className="w-6 h-6" />
            )}
          </button>
          
          <button
            onClick={handleSwipeRight}
            disabled={!currentEvent || isTransitioning}
            className={`w-14 h-14 ${showDetailCard ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
        
        {/* Action Labels */}
        <div className="flex justify-center space-x-16 mt-2">
          <span className="text-xs text-gray-600 w-14 text-center">
            {showDetailCard ? 'Back' : 'Skip'}
          </span>
          <span className="text-xs text-gray-600 w-14 text-center">
            {showDetailCard ? 'RSVP' : 'Details'}
          </span>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowCreateEvent(true)}
        className="fixed bottom-24 right-4 bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-30 hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Navigation */}
      <BottomNav currentPage="home" />

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