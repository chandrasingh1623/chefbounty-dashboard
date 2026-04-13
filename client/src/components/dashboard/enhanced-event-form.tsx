import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon, 
  ChevronDown, 
  UtensilsCrossed, 
  ChefHat, 
  Home, 
  Sparkles,
  Plus,
  X
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertEventSchema } from "@/../../shared/schema";
import { useAuth } from "@/lib/auth";

const cuisineTypes = [
  "Italian", "French", "Asian", "Mexican", "Mediterranean", 
  "Indian", "Japanese", "American", "Vegetarian", "Vegan",
  "BBQ", "Seafood", "Steakhouse", "Farm-to-Table", "Fusion"
];

const allergies = [
  "Peanuts", "Tree Nuts", "Shellfish", "Fish", "Eggs", 
  "Dairy", "Soy", "Wheat/Gluten", "Sesame", "Sulfites"
];

const equipmentOptions = [
  "Professional Mixer", "Food Processor", "Immersion Blender", 
  "Sous Vide Machine", "Pressure Cooker", "Deep Fryer",
  "Grill", "Smoker", "Pizza Oven", "Ice Cream Maker"
];

// Use the actual database schema for validation but exclude hostId (we'll add it in mutation)
const eventFormSchema = insertEventSchema.omit({ 
  hostId: true // Remove hostId from validation - we'll add it in the mutation
}).extend({
  eventDate: z.date({
    required_error: "Event date is required",
  }),
  budget: z.number().min(1, "Budget must be greater than 0"),
  duration: z.number().min(1, "Duration must be at least 1 hour"),
  title: z.string().min(1, "Event title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  cuisineType: z.array(z.string()).min(1, "Select at least one cuisine type"),
  mealType: z.string().min(1, "Meal type is required"),
  venueType: z.string().min(1, "Venue type is required"),
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface EnhancedEventFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
  isEditing?: boolean;
  eventId?: number;
}

export function EnhancedEventForm({ onSuccess, onCancel, initialData, isEditing = false, eventId }: EnhancedEventFormProps) {
  const [sectionsOpen, setSectionsOpen] = useState({
    cuisine: true,
    chef: true,
    venue: true,
    experience: true,
  });
  const [customEquipment, setCustomEquipment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialData ? {
      title: initialData.title || "",
      description: initialData.description || "",
      location: initialData.location || "",
      duration: initialData.duration || 3,
      budget: parseFloat(initialData.budget) || 500,
      cuisineType: initialData.cuisineType || [],
      allergies: initialData.allergies || [],
      mealType: initialData.mealType || "dinner",
      beverageService: initialData.beverageService || false,
      alcoholIncluded: initialData.alcoholIncluded || false,
      chefAttire: initialData.chefAttire || "casual",
      onsiteCooking: initialData.onsiteCooking !== undefined ? initialData.onsiteCooking : true,
      servingStaff: initialData.servingStaff || false,
      setupCleanup: initialData.setupCleanup !== undefined ? initialData.setupCleanup : true,
      specialEquipment: initialData.specialEquipment || [],
      venueType: initialData.venueType || "home",
      kitchenAvailability: initialData.kitchenAvailability || "full",
      parkingAccessibility: initialData.parkingAccessibility || "",
      indoorOutdoor: initialData.indoorOutdoor || "indoor",
      eventTheme: initialData.eventTheme || "",
      liveCooking: initialData.liveCooking || false,
      guestDressCode: initialData.guestDressCode || "",
      eventDate: initialData.eventDate ? new Date(initialData.eventDate) : undefined,
    } : {
      title: "",
      description: "",
      location: "",
      duration: 3,
      budget: 500,
      cuisineType: [],
      allergies: [],
      mealType: "dinner",
      beverageService: false,
      alcoholIncluded: false,
      chefAttire: "casual",
      onsiteCooking: true,
      servingStaff: false,
      setupCleanup: true,
      specialEquipment: [],
      venueType: "home",
      kitchenAvailability: "full",
      parkingAccessibility: "",
      indoorOutdoor: "indoor",
      eventTheme: "",
      liveCooking: false,
      guestDressCode: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData & { hostId: number }) => {
      console.log('Mutation starting with data:', data);
      try {
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `/api/events/${eventId}` : '/api/events';
        const result = await apiRequest(method as any, url, {
          ...data,
          eventDate: data.eventDate.toISOString(),
          budget: data.budget.toString(),
        });
        console.log('Mutation success:', result);
        return result;
      } catch (error) {
        console.error('Mutation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('onSuccess called');
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/host'] });
      toast({
        title: isEditing ? "Event Updated" : "Event Created",
        description: isEditing 
          ? "Your event has been updated successfully!"
          : "Your event has been posted successfully. Chefs can now submit bids!",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error('onError called:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Form errors:', form.formState.errors);
    
    // Check if there are validation errors
    if (Object.keys(form.formState.errors).length > 0) {
      toast({
        title: "Form Validation Error",
        description: "Please fill out all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    // Add hostId from current user
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to create an event.",
        variant: "destructive",
      });
      return;
    }
    
    const eventData = {
      ...data,
      hostId: user.id as number, // TypeScript cast - we already validated user.id exists above
    };
    
    console.log('Submitting event data with hostId:', eventData);
    createEventMutation.mutate(eventData);
  };

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addCustomEquipment = () => {
    if (customEquipment.trim()) {
      const currentEquipment = form.getValues("specialEquipment") || [];
      form.setValue("specialEquipment", [...currentEquipment, customEquipment.trim()]);
      setCustomEquipment("");
    }
  };

  const removeEquipment = (equipment: string) => {
    const currentEquipment = form.getValues("specialEquipment") || [];
    form.setValue("specialEquipment", currentEquipment.filter(e => e !== equipment));
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        console.log('Form onSubmit event triggered');
        e.preventDefault();
        form.handleSubmit(onSubmit)(e);
      }} className="space-y-6">
        {/* Basic Event Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Event Information</CardTitle>
            <CardDescription>
              Provide the fundamental details about your event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Intimate Dinner Party for 8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Downtown San Francisco" {...field} />
                    </FormControl>
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
                  <FormLabel>Event Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your event, the occasion, and any special requirements..."
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                        max="12"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                        min="0" 
                        step="10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cuisine & Meal Info */}
        <Card>
          <Collapsible open={sectionsOpen.cuisine} onOpenChange={() => toggleSection('cuisine')}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>Cuisine & Meal Information</CardTitle>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${sectionsOpen.cuisine ? 'rotate-180' : ''}`} />
                </div>
                <CardDescription>
                  Help chefs tailor their proposals to your preferences
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="cuisineType"
                  render={() => (
                    <FormItem>
                      <FormLabel>Preferred Cuisine Types</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {cuisineTypes.map((cuisine) => (
                          <FormField
                            key={cuisine}
                            control={form.control}
                            name="cuisineType"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(cuisine)}
                                    onCheckedChange={(checked) => {
                                      const updated = checked
                                        ? [...(field.value || []), cuisine]
                                        : field.value?.filter((value) => value !== cuisine) || [];
                                      field.onChange(updated);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {cuisine}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mealType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select meal type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="brunch">Brunch</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                            <SelectItem value="buffet">Buffet</SelectItem>
                            <SelectItem value="cocktail">Cocktail Party</SelectItem>
                            <SelectItem value="tasting">Tasting Menu</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allergies"
                    render={() => (
                      <FormItem>
                        <FormLabel>Dietary Restrictions & Allergies</FormLabel>
                        <div className="grid grid-cols-2 gap-1">
                          {allergies.map((allergy) => (
                            <FormField
                              key={allergy}
                              control={form.control}
                              name="allergies"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(allergy)}
                                      onCheckedChange={(checked) => {
                                        const updated = checked
                                          ? [...(field.value || []), allergy]
                                          : field.value?.filter((value) => value !== allergy) || [];
                                        field.onChange(updated);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-xs font-normal cursor-pointer">
                                    {allergy}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="beverageService"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Beverage Service Needed</FormLabel>
                          <FormDescription>
                            Chef will handle drink service
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alcoholIncluded"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Alcohol Service</FormLabel>
                          <FormDescription>
                            Include alcoholic beverages
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createEventMutation.isPending}
            onClick={(e) => {
              console.log('Button clicked');
              console.log('Form valid:', form.formState.isValid);
              console.log('Form errors:', form.formState.errors);
              console.log('Form values:', form.getValues());
            }}
          >
            {createEventMutation.isPending ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}