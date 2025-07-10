import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { NotificationsDropdown } from "./notifications-dropdown";

interface HeaderProps {
  title: string;
  subtitle: string;
  onQuickAction?: () => void;
}

export function Header({ title, subtitle, onQuickAction }: HeaderProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleQuickAction = () => {
    if (onQuickAction) {
      onQuickAction();
    } else if (user?.role === "host") {
      setLocation("/dashboard/post-event");
    } else if (user?.role === "chef") {
      setLocation("/dashboard/browse-events");
    }
  };

  const quickActionText = user?.role === "host" ? "Post Event" : "Browse Events";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationsDropdown />
          
          {/* Quick Action Button */}
          <Button
            onClick={handleQuickAction}
            className="bg-primary text-white font-medium hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            {quickActionText}
          </Button>
        </div>
      </div>
    </header>
  );
}
