import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Sparkles } from "lucide-react";

export function SeedNotificationsButton() {
  const { user } = useAuth();

  const seedNotificationsMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const sampleNotifications = [
        {
          userId: user.id,
          type: "new_bid",
          title: "New Bid Received",
          message: "John Doe submitted a bid of $250 for your 'Dinner Party for 8' event.",
          relatedId: 1,
          relatedType: "bid",
          isRead: false,
        },
        {
          userId: user.id,
          type: "bid_accepted",
          title: "Bid Accepted!",
          message: "Congratulations! Your bid for 'Corporate Catering Event' has been accepted.",
          relatedId: 2,
          relatedType: "bid",
          isRead: false,
        },
        {
          userId: user.id,
          type: "new_message",
          title: "New Message",
          message: "Sarah Johnson sent you a message about the upcoming event details.",
          relatedId: 1,
          relatedType: "message",
          isRead: true,
        },
        {
          userId: user.id,
          type: "event_update",
          title: "Event Updated",
          message: "The location for 'Birthday Celebration' has been changed. Please review the details.",
          relatedId: 3,
          relatedType: "event",
          isRead: false,
        },
      ];

      // Create notifications via API (we need to create this endpoint)
      for (const notification of sampleNotifications) {
        await apiRequest("/api/notifications", {
          method: "POST",
          body: JSON.stringify(notification),
        });
      }
    },
  });

  return (
    <Button
      variant="outline" 
      size="sm"
      onClick={() => seedNotificationsMutation.mutate()}
      disabled={seedNotificationsMutation.isPending}
      className="mb-4"
    >
      <Sparkles className="w-4 h-4 mr-2" />
      {seedNotificationsMutation.isPending ? "Creating..." : "Add Sample Notifications"}
    </Button>
  );
}