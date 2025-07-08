import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Share, Heart, MapPin, Clock, Check, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { EventWithOrganizer } from "@shared/schema";
import AnimeAvatar from "./AnimeAvatar";

interface EventDetailProps {
  event: EventWithOrganizer;
  onClose: () => void;
}

export default function EventDetail({ event, onClose }: EventDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const rsvpMutation = useMutation({
    mutationFn: async (status: string) => {
      await apiRequest('POST', `/api/events/${event.id}/rsvp`, { status });
    },
    onSuccess: () => {
      toast({
        title: "RSVP Updated",
        description: "Your RSVP has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleRsvp = () => {
    if (!user) {
      toast({
        title: "Please Sign In",
        description: "You need to sign in to RSVP to events.",
        variant: "destructive",
      });
      return;
    }

    const newStatus = event.userRsvpStatus === 'going' ? 'not_going' : 'going';
    rsvpMutation.mutate(newStatus);
  };

  return (
    <div className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 ${
      isClosing ? 'translate-y-full' : 'translate-y-0'
    }`}>
      <div className="relative h-full">
        <button 
          onClick={handleClose}
          className="absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow-md"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md">
          <Share className="w-5 h-5 text-gray-700" />
        </button>
        
        <div className="h-64 relative">
          <img 
            src={event.eventImageUrl || `https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600`}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="px-4 py-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h2>
              <div className="flex items-center text-gray-600 mb-1">
                <Clock className="w-4 h-4 mr-2" />
                <span>{formatDate(event.date)} • {formatTime(event.time)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{event.location}</span>
              </div>
            </div>
            <button className="bg-white border-2 border-primary text-primary px-4 py-2 rounded-full font-medium ml-4">
              <Heart className="w-4 h-4 mr-1 inline" />
              Save
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">About this event</h3>
            <p className="text-gray-600 leading-relaxed">
              {event.description}
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              Attendees ({event.rsvpCount})
            </h3>
            <div className="flex items-center space-x-3">
              <div className="flex -space-x-2">
                <AnimeAvatar seed={event.organizer.animeAvatarSeed} size="md" />
                <AnimeAvatar seed={`attendee_1_${event.id}`} size="md" />
                <AnimeAvatar seed={`attendee_2_${event.id}`} size="md" />
                <AnimeAvatar seed={`attendee_3_${event.id}`} size="md" />
                <AnimeAvatar seed={`attendee_4_${event.id}`} size="md" />
              </div>
              {event.rsvpCount > 5 && (
                <span className="text-sm text-gray-600">+{event.rsvpCount - 5} more</span>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Organized by</h3>
            <div className="flex items-center space-x-3">
              <AnimeAvatar seed={event.organizer.animeAvatarSeed} size="md" />
              <div>
                <p className="font-medium text-gray-800">
                  {event.organizer.firstName || event.organizer.lastName 
                    ? `${event.organizer.firstName || ''} ${event.organizer.lastName || ''}`.trim()
                    : 'Anonymous Organizer'}
                </p>
                <p className="text-sm text-gray-600">{event.organizer.location}</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 pb-6">
            <button 
              onClick={handleRsvp}
              disabled={rsvpMutation.isPending}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                event.userRsvpStatus === 'going'
                  ? 'bg-success text-white'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {rsvpMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                <>
                  {event.userRsvpStatus === 'going' ? (
                    <>
                      <Check className="w-4 h-4 mr-2 inline" />
                      Going
                    </>
                  ) : (
                    <>
                      RSVP - {event.isFree ? 'Free' : `$${event.price}`}
                    </>
                  )}
                </>
              )}
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg">
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
