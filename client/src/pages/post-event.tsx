import { DashboardLayout } from "@/components/dashboard/layout";
import { EnhancedEventForm } from "@/components/dashboard/enhanced-event-form";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { authService } from "@/lib/supabase";

export default function PostEvent() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Get edit parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const editEventId = urlParams.get('edit');
  const isEditing = !!editEventId;

  // Fetch event data if editing
  const { data: eventData, isLoading } = useQuery({
    queryKey: ['/api/events', editEventId],
    queryFn: async () => {
      if (!editEventId) return null;
      const response = await fetch(`/api/events/${editEventId}`, {
        headers: authService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch event');
      return response.json();
    },
    enabled: !!editEventId && !!user?.id,
  });

  const handleSuccess = () => {
    setLocation("/dashboard/my-events");
  };

  const handleCancel = () => {
    setLocation("/dashboard/my-events");
  };

  if (isEditing && isLoading) {
    return (
      <DashboardLayout 
        title="Edit Event" 
        subtitle="Loading event details..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={isEditing ? "Edit Event" : "Post New Event"} 
      subtitle={isEditing ? "Update your event details" : "Create a new event and start receiving bids from talented chefs"}
    >
      <div className="max-w-4xl mx-auto">
        <EnhancedEventForm 
          onSuccess={handleSuccess} 
          onCancel={handleCancel}
          initialData={eventData}
          isEditing={isEditing}
          eventId={editEventId ? parseInt(editEventId) : undefined}
        />
      </div>
    </DashboardLayout>
  );
}