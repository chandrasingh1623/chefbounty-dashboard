import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileUpload } from "@/components/ui/file-upload";
import { useAuth } from "@/lib/auth";
import { authService } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const eventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  cuisineType: z.string().min(1, "Cuisine type is required"),
  eventDate: z.string().min(1, "Event date is required"),
  duration: z.number().min(1, "Duration must be at least 1 hour"),
  location: z.string().min(1, "Location is required"),
  budget: z.number().min(1, "Budget must be greater than 0"),
  venueType: z.enum(["indoor", "outdoor"]),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventForm({ onSuccess, onCancel }: EventFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      cuisineType: "",
      eventDate: "",
      duration: 4,
      location: "",
      budget: 0,
      venueType: "indoor",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const eventDate = new Date(data.eventDate);
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          ...data,
          eventDate: eventDate.toISOString(),
          hostId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event created successfully!",
        description: "Your event has been posted and chefs can now submit bids.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      form.reset();
      setSelectedFile(null);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Failed to create event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  const cuisineOptions = [
    "Italian",
    "French",
    "American",
    "Asian",
    "Mediterranean",
    "Mexican",
    "Indian",
    "Japanese",
    "Thai",
    "Other"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Italian Dinner Party" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cuisineType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuisine Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cuisineOptions.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your event, guest count, special requirements..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="eventDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date & Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="4"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="500"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
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
                <Input placeholder="Manhattan, NY" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="venueType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Venue Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="indoor" id="indoor" />
                    <Label htmlFor="indoor">Indoor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="outdoor" id="outdoor" />
                    <Label htmlFor="outdoor">Outdoor</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Label>Event Image (Optional)</Label>
          <FileUpload
            onFileSelect={setSelectedFile}
            accept="image/*"
            maxSize={5}
            placeholder="Click to upload or drag and drop event image"
            className="mt-2"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={createEventMutation.isPending}
            className="bg-primary text-white hover:bg-primary/90"
          >
            {createEventMutation.isPending ? "Creating..." : "Post Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
