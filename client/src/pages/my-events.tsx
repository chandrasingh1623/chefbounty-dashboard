import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/layout";
import { EventCard } from "@/components/dashboard/event-card";
import { useAuth } from "@/lib/auth";
import { authService } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, Search } from "lucide-react";
import { EventDetailModal } from "@/components/dashboard/event-detail-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function MyEvents() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events/host', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await fetch(`/api/events/host/${user?.id}`, {
        headers: authService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  const { data: allBids = [] } = useQuery({
    queryKey: ['/api/bids/host', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await fetch(`/api/bids/host/${user?.id}`, {
        headers: authService.getAuthHeaders(),
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  const filteredEvents = events.filter((event: any) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getBidCount = (eventId: number) => {
    return allBids.filter((bid: any) => bid.eventId === eventId).length;
  };

  const handleViewBids = (eventId: number) => {
    setLocation(`/dashboard/bids?event=${eventId}`);
  };

  const handleViewFullListing = (eventId: number) => {
    // Find the event and show it in a modal or navigate to detailed view
    const event = events.find((e: any) => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setIsEventModalOpen(true);
    }
  };

  const handleEditEvent = (eventId: number) => {
    setLocation(`/dashboard/post-event?edit=${eventId}`);
  };

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete event');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events/host', user?.id] });
      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting event",
        description: error.message || "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteEvent = (eventId: number) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="My Events" subtitle="Manage your posted events and track their progress">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading your events...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Events" subtitle="Manage your posted events and track their progress">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => setLocation("/dashboard/post-event")}
            className="bg-primary text-white hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Event
          </Button>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event: any) => (
              <EventCard
                key={event.id}
                event={event}
                showHostActions={true}
                bidCount={getBidCount(event.id)}
                onBid={() => handleViewBids(event.id)}
                onViewDetails={() => handleViewFullListing(event.id)}
                onEdit={() => handleEditEvent(event.id)}
                onDelete={() => handleDeleteEvent(event.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {events.length === 0 ? "No events yet" : "No events match your filters"}
              </h3>
              <p className="text-gray-500 mb-6">
                {events.length === 0 
                  ? "Create your first event to start connecting with talented chefs."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {events.length === 0 && (
                <Button 
                  onClick={() => setLocation("/dashboard/post-event")}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Event
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}