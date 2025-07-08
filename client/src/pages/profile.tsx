import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, Bell, Shield, HelpCircle, Music, Activity, Palette, UtensilsCrossed, Laptop } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import AnimeAvatar from "@/components/AnimeAvatar";
import { EventWithOrganizer } from "@shared/schema";

export default function Profile() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showProfile, setShowProfile] = useState(false);

  const { data: userEvents } = useQuery({
    queryKey: ["/api/users", user?.id, "events", "organized"],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/users/${user.id}/events?type=organized`);
      if (!response.ok) throw new Error('Failed to fetch user events');
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
    
    if (user) {
      setShowProfile(true);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  if (isLoading || !showProfile) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const categoryIcons = {
    music: Music,
    sports: Activity,
    arts: Palette,
    food: UtensilsCrossed,
    tech: Laptop,
  };

  const getEventIcon = (category: string) => {
    const IconComponent = categoryIcons[category.toLowerCase() as keyof typeof categoryIcons] || Music;
    return <IconComponent className="w-5 h-5 text-white" />;
  };

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
        <h2 className="text-lg font-semibold">Profile</h2>
        <button className="text-primary font-medium">
          <Edit className="w-5 h-5" />
        </button>
      </header>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary to-accent p-6 text-white text-center">
        <AnimeAvatar seed={user?.animeAvatarSeed || user?.id || "default"} size="lg" />
        <h3 className="text-xl font-semibold mb-1 mt-4">
          {user?.firstName || user?.lastName 
            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
            : 'Anonymous User'}
        </h3>
        <p className="text-white/80 text-sm">{user?.location || "Location not set"}</p>
      </div>

      {/* Profile Content */}
      <div className="p-4 space-y-6">
        {/* My Events */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">My Events</h4>
          <div className="space-y-3">
            {userEvents && userEvents.length > 0 ? (
              userEvents.slice(0, 2).map((event) => (
                <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    {getEventIcon(event.category)}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-800">{event.title}</h5>
                    <p className="text-sm text-gray-600">Hosting • {event.rsvpCount} attending</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No events created yet</p>
              </div>
            )}
            
            {attendingEvents && attendingEvents.length > 0 && (
              attendingEvents.slice(0, 1).map((event) => (
                <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center">
                    {getEventIcon(event.category)}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-800">{event.title}</h5>
                    <p className="text-sm text-gray-600">Attending • {event.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Interests */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Interests</h4>
          <div className="flex flex-wrap gap-2">
            {user?.interests && user.interests.length > 0 ? (
              user.interests.map((interest) => (
                <span key={interest} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {interest}
                </span>
              ))
            ) : (
              <>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Music</span>
                <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm">Sports</span>
                <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-sm">Tech</span>
                <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-sm">Food</span>
              </>
            )}
          </div>
        </div>

        {/* Settings */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Settings</h4>
          <div className="space-y-1">
            <button className="w-full text-left p-3 flex items-center justify-between hover:bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Notifications</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </button>
            <button className="w-full text-left p-3 flex items-center justify-between hover:bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Privacy</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </button>
            <button className="w-full text-left p-3 flex items-center justify-between hover:bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Help & Support</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-4 border-t border-gray-200">
          <button 
            onClick={() => window.location.href = '/api/logout'}
            className="w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
