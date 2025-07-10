import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Camera, Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateEventProps {
  onClose: () => void;
}

const createEventSchema = insertEventSchema.extend({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  isFree: z.boolean().default(true),
  price: z.string().optional(),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

export default function CreateEvent({ onClose }: CreateEventProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState(false);

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      date: "",
      time: "",
      location: "",
      isFree: true,
      price: "0.00",
      eventImageUrl: "",
      organizerId: user?.id || "",
      capacity: undefined,
      parkingInfo: "",
      meetingPoint: "",
      duration: "",
      whatToBring: "",
      specialNotes: "",
      requirements: "",
      contactInfo: "",
      cancellationPolicy: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEventFormData) => {
      const eventData = {
        ...data,
        price: data.isFree ? "0.00" : data.price || "0.00",
        organizerId: user?.id || "",
      };
      await apiRequest('POST', '/api/events', eventData);
    },
    onSuccess: () => {
      toast({
        title: "Event Created",
        description: "Your event has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events", "organized"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "events", "group-chats"] });
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
        description: "Failed to create event. Please try again.",
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

  const onSubmit = (data: CreateEventFormData) => {
    createEventMutation.mutate(data);
  };

  const isFree = form.watch('isFree');

  return (
    <div className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 ${
      isClosing ? 'translate-y-full' : 'translate-y-0'
    }`}>
      <div className="h-full flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={handleClose} className="text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">Create Event</h2>
          <button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={createEventMutation.isPending}
            className="text-primary font-medium disabled:opacity-50"
          >
            {createEventMutation.isPending ? 'Publishing...' : 'Publish'}
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                  Event Photo
                </FormLabel>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Add a photo to make your event stand out</p>
                  <FormField
                    control={form.control}
                    name="eventImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter image URL"
                            className="mt-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Give your event a name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="tech">Tech</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Where will your event take place?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={4} 
                        placeholder="Tell people about your event..." 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>This is a free event</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                {!isFree && (
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel>Ticket Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
