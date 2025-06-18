import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/layout";
import { EventCard } from "@/components/dashboard/event-card";
import { useAuth } from "@/lib/auth";
import { authService } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Search, Calendar, MapPin, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EventDetailModal } from "@/components/dashboard/event-detail-modal";

const bidSchema = z.object({
  amount: z.number().min(1, "Bid amount must be greater than 0"),
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

  const form = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: 0,
      message: "",
    },
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await fetch('/api/events', {
        headers: authService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch events');
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
  const availableEvents = events.filter((event: any) => {
    const isEventOpen = event.status === 'open';
    const isUpcoming = new Date(event.eventDate) > new Date();
    
    if (user?.role === 'chef') {
      const hasAlreadyBid = myBids.some((bid: any) => bid.eventId === event.id);
      return !hasAlreadyBid && isEventOpen && isUpcoming;
    }
    
    // For hosts, show all open upcoming events (they can't bid anyway)
    return isEventOpen && isUpcoming;
  });

  const filteredEvents = availableEvents.filter((event: any) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === "all" || 
                           event.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesCuisine = cuisineFilter === "all" || event.cuisineType === cuisineFilter;
    const matchesBudget = budgetFilter === "all" || 
                         (budgetFilter === "under500" && parseFloat(event.budget) < 500) ||
                         (budgetFilter === "500-1000" && parseFloat(event.budget) >= 500 && parseFloat(event.budget) <= 1000) ||
                         (budgetFilter === "over1000" && parseFloat(event.budget) > 1000);
    
    return matchesSearch && matchesLocation && matchesCuisine && matchesBudget;
  });

  const handleBid = (eventId: number) => {
    setSelectedEventId(eventId);
    setIsDialogOpen(true);
  };

  const handleViewDetails = (eventId: number) => {
    setSelectedDetailEventId(eventId);
    setIsDetailModalOpen(true);
  };

  const onSubmitBid = (data: BidFormData) => {
    if (selectedEventId) {
      submitBidMutation.mutate({ ...data, eventId: selectedEventId });
    }
  };

  const selectedEvent = selectedEventId ? events.find((e: any) => e.id === selectedEventId) : null;
  const selectedDetailEvent = selectedDetailEventId ? events.find((e: any) => e.id === selectedDetailEventId) : null;

  const uniqueLocations = Array.from(new Set(events.map((event: any) => 
    event.location.split(',')[0].trim()
  ))) as string[];

  const cuisineTypes = Array.from(new Set(events.map((event: any) => event.cuisineType))) as string[];

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event: any) => (
              <EventCard
                key={event.id}
                event={event}
                showBidButton={user?.role === 'chef'}
                onBid={user?.role === 'chef' ? handleBid : undefined}
                onViewDetails={handleViewDetails}
              />
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
            
            {selectedEvent && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{selectedEvent.title}</h4>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedEvent.eventDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedEvent.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${selectedEvent.budget}</span>
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
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
      </div>
    </DashboardLayout>
  );
}