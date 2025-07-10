import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Camera, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AvatarUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl: string;
}

export default function AvatarUpdateModal({ isOpen, onClose, currentAvatarUrl }: AvatarUpdateModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const generateAvatarMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('/api/generate-avatar', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate avatar');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setPreviewUrl(data.url);
      toast({
        title: "Avatar Generated!",
        description: "Your new avatar has been created. Click 'Save' to use it.",
        duration: 3000,
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
        description: "Failed to generate avatar. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveAvatarMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      const response = await apiRequest('/api/update-avatar', {
        method: 'POST',
        body: JSON.stringify({ customAvatarUrl: avatarUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save avatar');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Avatar Saved!",
        description: "Your new avatar has been saved to your profile.",
        duration: 2000,
      });
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
        description: "Failed to save avatar. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setDescription("");
    setPreviewUrl(null);
    onClose();
  };

  const handleGenerate = () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe the avatar you'd like to create.",
        variant: "destructive",
      });
      return;
    }

    // Create a detailed prompt for avatar generation
    const prompt = `Create a professional portrait avatar of a person with the following description: ${description}. The image should be suitable for a social media profile photo, well-lit, and focused on the face and upper body. Style should be modern and clean.`;
    
    generateAvatarMutation.mutate(prompt);
  };

  const handleSave = () => {
    if (previewUrl) {
      saveAvatarMutation.mutate(previewUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Update Avatar
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Current Avatar */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Avatar</h3>
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gray-200">
                <img
                  src={currentAvatarUrl}
                  alt="Current avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your ideal avatar
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., A friendly young person with short brown hair, wearing a casual blue shirt, smiling warmly..."
                className="w-full h-24 text-sm bg-white text-black border-2 border-gray-300 rounded-md px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary placeholder-gray-400 resize-none"
                maxLength={500}
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={generateAvatarMutation.isPending || !description.trim()}
              className="w-full"
            >
              {generateAvatarMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Avatar
                </>
              )}
            </Button>

            {/* Preview */}
            {previewUrl && (
              <div className="text-center space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Preview</h3>
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-primary">
                  <img
                    src={previewUrl}
                    alt="Generated avatar preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSave}
                    disabled={saveAvatarMutation.isPending}
                    className="flex-1"
                  >
                    {saveAvatarMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Avatar"
                    )}
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={generateAvatarMutation.isPending}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400"
                  >
                    {generateAvatarMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Try Again"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}