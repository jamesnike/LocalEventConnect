import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Share, Heart, MapPin, Clock, Check, MessageCircle, Music, Activity, Palette, UtensilsCrossed, Laptop, X, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { EventWithOrganizer } from "@shared/schema";
import AnimeAvatar from "./AnimeAvatar";
import CelebrationAnimation from "./CelebrationAnimation";

interface EventDetailProps {
  event: EventWithOrganizer;
  onClose: () => void;
  onNavigateToContent?: () => void;
  showGroupChatButton?: boolean;
  onSkip?: () => void;
}

export default function EventDetail({ event, onClose, onNavigateToContent, showGroupChatButton = false, onSkip }: EventDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [localRsvpStatus, setLocalRsvpStatus] = useState<string | undefined>(event.userRsvpStatus);
  const [localRsvpCount, setLocalRsvpCount] = useState(event.rsvpCount);

  // Sync local state with event prop when event changes
  useEffect(() => {
    setLocalRsvpStatus(event.userRsvpStatus);
    setLocalRsvpCount(event.rsvpCount);
  }, [event.userRsvpStatus, event.rsvpCount]);

  const formatDate = (dateString: string) => {
    // Parse the date string as local time to avoid timezone issues
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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
      await apiRequest(`/api/events/${event.id}/rsvp`, { 
        method: 'POST',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: (_, status) => {
      // Invalidate all relevant queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", event.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events", "attending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events", "organized"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events", "group-chats"] });
      
      // Update local state for immediate UI feedback
      const wasAlreadyRsvped = localRsvpStatus === 'going' || localRsvpStatus === 'attending';
      setLocalRsvpStatus(status);
      if (!wasAlreadyRsvped && status === 'going') {
        setLocalRsvpCount(prev => prev + 1);
      }
      
      // If user is RSVPing "going", show celebration animation
      if (status === 'going') {
        setShowCelebration(true);
      } else {
        toast({
          title: "RSVP Updated",
          description: "Your RSVP has been updated successfully.",
          duration: 2000,
        });
      }
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

  const removeRsvpMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/events/${event.id}/rsvp`, { 
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      // Invalidate all relevant queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", event.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events", "attending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events", "organized"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events", "group-chats"] });
      
      // Update local state for immediate UI feedback
      setLocalRsvpStatus(undefined);
      setLocalRsvpCount(prev => Math.max(0, prev - 1));
      
      toast({
        title: "RSVP Removed",
        description: "Your RSVP has been removed successfully.",
        duration: 2000,
      });
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
        description: "Failed to remove RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelEventMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/events/${event.id}`, { 
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events", "attending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events", "organized"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events", "group-chats"] });
      
      toast({
        title: "Event Canceled",
        description: "Your event has been canceled successfully.",
        duration: 2000,
      });
      
      // Close the modal after canceling
      handleClose();
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
        description: "Failed to cancel event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onSkip) {
        onSkip();
      } else {
        onClose();
      }
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

    if (localRsvpStatus === 'going' || localRsvpStatus === 'attending') {
      // Remove RSVP
      removeRsvpMutation.mutate();
    } else {
      // Add RSVP
      rsvpMutation.mutate('going');
    }
  };

  const handleButtonClick = () => {
    if (isOrganizer) {
      // If user is organizer, cancel the event
      cancelEventMutation.mutate();
    } else if (localRsvpStatus === 'going' || localRsvpStatus === 'attending') {
      // If user has RSVP'd (going or attending), remove RSVP
      handleRsvp();
    } else {
      // If user is not organizer and hasn't RSVP'd, add RSVP
      handleRsvp();
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    // Navigate to EventContent after celebration
    if (onNavigateToContent) {
      onNavigateToContent();
    }
    onClose();
  };

  // Check if current user is the organizer of this event
  const isOrganizer = user?.id === event.organizerId;
  


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
              Attendees ({localRsvpCount})
            </h3>
            <div className="flex items-center space-x-3">
              <div className="flex -space-x-2">
                <AnimeAvatar seed={event.organizer.animeAvatarSeed} size="md" />
                <AnimeAvatar seed={`attendee_1_${event.id}`} size="md" />
                <AnimeAvatar seed={`attendee_2_${event.id}`} size="md" />
                <AnimeAvatar seed={`attendee_3_${event.id}`} size="md" />
                <AnimeAvatar seed={`attendee_4_${event.id}`} size="md" />
              </div>
              {localRsvpCount > 5 && (
                <span className="text-sm text-gray-600">+{localRsvpCount - 5} more</span>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Organized by</h3>
            <div className="flex items-center space-x-3 mb-3">
              <AnimeAvatar seed={event.organizer.animeAvatarSeed} size="md" />
              <div>
                <p className="font-medium text-gray-800">
                  {event.organizer.firstName || event.organizer.lastName 
                    ? `${event.organizer.firstName || ''} ${event.organizer.lastName || ''}`.trim()
                    : 'Anonymous Organizer'}
                </p>
                <p className="text-sm text-gray-600">{event.organizer.location}</p>
                {event.organizer.aiSignature && (
                  <p className="text-[10px] text-gray-500 italic mt-1">
                    "{event.organizer.aiSignature}"
                  </p>
                )}
              </div>
            </div>
            {event.organizer.interests && event.organizer.interests.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {event.organizer.interests.slice(0, 3).map((interest) => {
                  const interestData = availableInterests.find(i => i.id === interest);
                  const Icon = interestData?.icon || Activity;
                  
                  return (
                    <div key={interest} className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      <Icon className="w-3 h-3" />
                      <span>{interestData?.name || interest}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="flex space-x-3 pb-6">
            <button 
              onClick={handleButtonClick}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              disabled={rsvpMutation.isPending || removeRsvpMutation.isPending || cancelEventMutation.isPending}
              className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                (rsvpMutation.isPending || removeRsvpMutation.isPending || cancelEventMutation.isPending) 
                  ? 'opacity-50 cursor-not-allowed'
                  : isHovering 
                  ? ((localRsvpStatus === 'going' || localRsvpStatus === 'attending') ? 'bg-red-500 text-white' : isOrganizer ? 'bg-red-500 text-white' : 'bg-primary text-white')
                  : ((localRsvpStatus === 'going' || localRsvpStatus === 'attending')
                    ? 'bg-success text-white hover:bg-red-500'
                    : isOrganizer 
                    ? 'bg-blue-500 text-white hover:bg-red-500'
                    : 'bg-primary text-white hover:bg-primary/90')
              }`}
            >
              {(rsvpMutation.isPending || removeRsvpMutation.isPending || cancelEventMutation.isPending) ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {cancelEventMutation.isPending ? 'Canceling...' : 'Updating...'}
                </div>
              ) : isHovering ? (
                <>
                  {isOrganizer ? (
                    <>
                      <X className="w-4 h-4 mr-2 inline" />
                      Cancel Event
                    </>
                  ) : (localRsvpStatus === 'going' || localRsvpStatus === 'attending') ? (
                    <>
                      <Trash2 className="w-4 h-4 mr-2 inline" />
                      Remove RSVP
                    </>
                  ) : (
                    <>
                      RSVP - {event.isFree ? 'Free' : `$${event.price}`}
                    </>
                  )}
                </>
              ) : (
                <>
                  {isOrganizer ? (
                    <>
                      <Check className="w-4 h-4 mr-2 inline" />
                      Organizing
                    </>
                  ) : (localRsvpStatus === 'going' || localRsvpStatus === 'attending') ? (
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
            {user && (
              <button 
                onClick={() => {
                  if (onNavigateToContent) {
                    onNavigateToContent();
                  }
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg flex items-center space-x-2 font-medium"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Group Chat</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Celebration Animation */}
      <CelebrationAnimation 
        isVisible={showCelebration}
        onComplete={handleCelebrationComplete}
      />
    </div>
  );
}
