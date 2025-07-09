import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Bell, Shield, HelpCircle, Music, Activity, Palette, UtensilsCrossed, Laptop, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import AnimeAvatar from "@/components/AnimeAvatar";
import BottomNav from "@/components/BottomNav";
import { EventWithOrganizer } from "@shared/schema";

export default function Profile() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showProfile, setShowProfile] = useState(false);
  const [editingInterests, setEditingInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

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

  const updateInterestsMutation = useMutation({
    mutationFn: async (interests: string[]) => {
      await apiRequest('PUT', '/api/users/profile', { 
        location: user?.location,
        interests 
      });
    },
    onSuccess: () => {
      toast({
        title: "Interests Updated",
        description: "Your interests have been saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setEditingInterests(false);
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
        description: "Failed to update interests. Please try again.",
        variant: "destructive",
      });
    },
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
      setSelectedInterests(user.interests || []);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else if (prev.length < 3) {
        return [...prev, interestId];
      }
      return prev;
    });
  };

  const handleSaveInterests = () => {
    updateInterestsMutation.mutate(selectedInterests);
  };

  const handleEditInterests = () => {
    setEditingInterests(true);
    setSelectedInterests(user?.interests || []);
  };

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
        <button 
          onClick={handleEditInterests}
          className="text-primary font-medium"
        >
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
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">Interests</h4>
            {!editingInterests && (
              <button 
                onClick={handleEditInterests}
                className="text-primary text-sm font-medium"
              >
                Edit
              </button>
            )}
          </div>
          
          {editingInterests ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Select up to 3 interests that represent you best:</p>
              <div className="grid grid-cols-2 gap-2">
                {availableInterests.map((interest) => {
                  const Icon = interest.icon;
                  const isSelected = selectedInterests.includes(interest.id);
                  
                  return (
                    <button
                      key={interest.id}
                      onClick={() => handleInterestToggle(interest.id)}
                      disabled={!isSelected && selectedInterests.length >= 3}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                        isSelected 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      } ${!isSelected && selectedInterests.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{interest.name}</span>
                      {isSelected && <Check className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveInterests}
                  disabled={updateInterestsMutation.isPending}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
                >
                  {updateInterestsMutation.isPending ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingInterests(false);
                    setSelectedInterests(user?.interests || []);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user?.interests && user.interests.length > 0 ? (
                user.interests.slice(0, 3).map((interest) => {
                  const interestData = availableInterests.find(i => i.id === interest);
                  const Icon = interestData?.icon || Activity;
                  
                  return (
                    <div key={interest} className="flex items-center space-x-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      <Icon className="w-3 h-3" />
                      <span>{interestData?.name || interest}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm">No interests selected yet</p>
              )}
            </div>
          )}
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

      {/* Bottom Navigation */}
      <BottomNav currentPage="profile" />
    </div>
  );
}
