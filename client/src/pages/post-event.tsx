import { DashboardLayout } from "@/components/dashboard/layout";
import { EnhancedEventForm } from "@/components/dashboard/enhanced-event-form";
import { useLocation } from "wouter";

export default function PostEvent() {
  const [, setLocation] = useLocation();

  const handleSuccess = () => {
    setLocation("/dashboard/my-events");
  };

  const handleCancel = () => {
    setLocation("/dashboard");
  };

  return (
    <DashboardLayout 
      title="Post New Event" 
      subtitle="Create a new event and start receiving bids from talented chefs"
    >
      <div className="max-w-4xl mx-auto">
        <EnhancedEventForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </DashboardLayout>
  );
}