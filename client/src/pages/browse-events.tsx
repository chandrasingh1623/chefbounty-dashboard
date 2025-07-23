import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/layout";
import { EventCard } from "@/components/dashboard/event-card";
import { useAuth } from "@/lib/auth";
import { authService } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Search, Calendar, MapPin, DollarSign, Eye, X, User, Globe, Users, UtensilsCrossed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EventDetailModal } from "@/components/dashboard/event-detail-modal";

const bidSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Bid amount must be a valid number greater than 0"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type BidFormData = z.infer<typeof bidSchema>;

export default function BrowseEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDetailEventId, setSelectedDetailEventId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const form = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: "",
      message: "",
    },
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events/browse'],
    queryFn: async () => {
      const response = await fetch('/api/events/browse', {
        headers: authService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch browse events');
      return response.json();
    },
  });

  const { data: myBids = [] } = useQuery({
    queryKey: ['/api/bids/chef', user?.id],
    enabled: !!user?.id && user?.role === 'chef',
    queryFn: async () => {
      const response = await fetch(`/api/bids/chef/${user?.id}`, {
        headers: authService.getAuthHeaders(),
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  const submitBidMutation = useMutation({
    mutationFn: async (data: BidFormData & { eventId: number }) => {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit bid');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bid submitted successfully!",
        description: "Your bid has been sent to the host for review.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bids/chef'] });
      form.reset();
      setIsDialogOpen(false);
      setSelectedEventId(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit bid",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter events based on user role and bidding status
  // Events from /api/events/browse are already approved and ready for display
  const availableEvents = events.filter((event: any) => {
    const isUpcoming = new Date(event.eventDate) > new Date();
    
    if (user?.role === 'chef') {
      const hasAlreadyBid = myBids.some((bid: any) => bid.eventId === event.id);
      return !hasAlreadyBid && isUpcoming;
    }
    
    // For hosts, show all approved upcoming events
    return isUpcoming;
  });

  const filteredEvents = availableEvents.filter((event: any) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === "all" || 
                           event.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesCuisine = cuisineFilter === "all" || 
                          (Array.isArray(event.cuisineType) ? event.cuisineType.includes(cuisineFilter) : event.cuisineType === cuisineFilter);
    const matchesBudget = budgetFilter === "all" || 
                         (budgetFilter === "under500" && parseFloat(event.budget) < 500) ||
                         (budgetFilter === "500-1000" && parseFloat(event.budget) >= 500 && parseFloat(event.budget) <= 1000) ||
                         (budgetFilter === "over1000" && parseFloat(event.budget) > 1000);
    
    return matchesSearch && matchesLocation && matchesCuisine && matchesBudget;
  });

  const handleBid = (eventId: number) => {
    console.log('Setting up bid for event:', eventId);
    const event = events.find((e: any) => e.id === eventId);
    console.log('Found event:', event);
    setSelectedEventId(eventId);
    setIsDialogOpen(true);
  };

  const handleViewDetails = (eventId: number) => {
    setSelectedDetailEventId(eventId);
    setIsDetailModalOpen(true);
  };

  const openEventModal = (event: any) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
    setIsEventModalOpen(false);
  };

  const onSubmitBid = (data: BidFormData) => {
    if (selectedEventId) {
      submitBidMutation.mutate({ ...data, eventId: selectedEventId });
    }
  };

  const selectedBidEvent = selectedEventId ? events.find((e: any) => e.id === selectedEventId) : null;
  const selectedDetailEvent = selectedDetailEventId ? events.find((e: any) => e.id === selectedDetailEventId) : null;

  const uniqueLocations = Array.from(new Set(events.map((event: any) => 
    event.location.split(',')[0].trim()
  ))) as string[];

  const cuisineTypes = Array.from(new Set(events.flatMap((event: any) => 
    Array.isArray(event.cuisineType) ? event.cuisineType : [event.cuisineType]
  ))) as string[];

  if (isLoading) {
    return (
      <DashboardLayout title="Browse Events" subtitle="Find exciting cooking opportunities">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading events...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Browse Events" 
      subtitle={user?.role === 'chef' ? "Find exciting cooking opportunities and submit your bids" : "Browse available events and see what chefs are offering"}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map((location: string) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by cuisine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cuisines</SelectItem>
              {cuisineTypes.map((cuisine: string) => (
                <SelectItem key={cuisine} value={cuisine}>
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={budgetFilter} onValueChange={setBudgetFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Budgets</SelectItem>
              <SelectItem value="under500">Under $500</SelectItem>
              <SelectItem value="500-1000">$500 - $1,000</SelectItem>
              <SelectItem value="over1000">Over $1,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Role-based messaging for hosts */}
        {user?.role === 'host' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Search className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Browsing as Host
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>You're viewing available events as a host. Only chefs can submit bids on events. To post your own event, visit the "Post New Event" section.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredEvents.map((event: any) => (
              <div key={event.id} className="rounded-2xl shadow-lg bg-white hover:scale-[1.02] transition-transform duration-300 ease-in-out overflow-hidden">
                <div className="p-6">
                  {/* Event Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm">{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-lg font-bold text-primary">
                        <DollarSign className="w-5 h-5" />
                        {event.budget}
                      </div>
                      <span className="text-xs text-gray-500">Budget</span>
                    </div>
                  </div>

                  {/* Event Description */}
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{event.description}</p>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cuisine:</span>
                      <span className="font-medium">{Array.isArray(event.cuisineType) ? event.cuisineType.join(', ') : event.cuisineType}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-medium">{event.guestCount} {event.guestCount === 1 ? 'person' : 'people'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{event.duration} {event.duration === 1 ? 'hour' : 'hours'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => openEventModal(event)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {user?.role === 'chef' && (
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => handleBid(event.id)}
                      >
                        Submit Bid
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {availableEvents.length === 0 ? "No available events" : "No events match your filters"}
              </h3>
              <p className="text-gray-500">
                {availableEvents.length === 0 
                  ? "Check back later for new cooking opportunities."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </div>
          </div>
        )}

        {/* Bid Submission Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Bid</DialogTitle>
            </DialogHeader>
            
            {selectedBidEvent && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{selectedBidEvent.title}</h4>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedBidEvent.eventDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedBidEvent.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${selectedBidEvent.budget}</span>
                    </div>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitBid)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Bid Amount ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Enter your bid amount"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message to Host</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell the host why you're the perfect chef for this event..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitBidMutation.isPending}
                        className="bg-primary text-white hover:bg-primary/90"
                      >
                        {submitBidMutation.isPending ? "Submitting..." : "Submit Bid"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Event Detail Modal */}
        <EventDetailModal
          event={selectedDetailEvent}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedDetailEventId(null);
          }}
        />

        {/* Full Event Details Modal */}
        <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold">{selectedEvent.title}</DialogTitle>
                    <DialogDescription className="flex items-center text-gray-600 mt-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(selectedEvent.eventDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      <span className="mx-2">•</span>
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedEvent.location}
                    </DialogDescription>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  {/* Left Column - Event Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Event Description</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p>
                    </div>

                    {/* Event Requirements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center">
                          <UtensilsCrossed className="w-4 h-4 mr-2" />
                          Cuisine & Style
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cuisine Type:</span>
                            <span className="font-medium">{Array.isArray(selectedEvent.cuisineType) ? selectedEvent.cuisineType.join(', ') : selectedEvent.cuisineType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dietary Requirements:</span>
                            <span className="font-medium">{selectedEvent.dietaryRestrictions || 'None specified'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Event Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Guest Count:</span>
                            <span className="font-medium">{selectedEvent.guestCount} people</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{selectedEvent.duration || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Service Style:</span>
                            <span className="font-medium">{selectedEvent.serviceStyle || 'To be discussed'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Host Information */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Host Information
                      </h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-medium">
                            {selectedEvent.hostName ? selectedEvent.hostName[0].toUpperCase() : 'H'}
                          </div>
                          <div>
                            <p className="font-medium">{selectedEvent.hostName || 'Host'}</p>
                            <p className="text-sm text-gray-600">Event Organizer</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Pricing & Actions */}
                  <div className="space-y-6">
                    {/* Budget */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <h3 className="font-semibold mb-3 flex items-center text-blue-900">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Budget
                      </h3>
                      <div className="text-3xl font-bold text-blue-900 mb-2">
                        ${selectedEvent.budget}
                      </div>
                      <p className="text-sm text-blue-700">Total event budget</p>
                    </div>

                    {/* Event Status */}
                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <Globe className="w-5 h-5 mr-2" />
                        Event Status
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {selectedEvent.status === 'open' ? 'Accepting Bids' : selectedEvent.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Posted:</span>
                          <span className="text-sm font-medium">
                            {new Date(selectedEvent.createdAt || selectedEvent.eventDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {user?.role === 'chef' && (
                      <div className="space-y-3">
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => {
                            closeEventModal();
                            handleBid(selectedEvent.id);
                          }}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Submit Bid
                        </Button>
                        <Button variant="outline" className="w-full">
                          Save Event
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}