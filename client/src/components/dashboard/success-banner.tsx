import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SuccessBannerProps {
  type: "chef" | "host";
  chefName?: string;
  eventTitle?: string;
  onMessageClick?: () => void;
  onDismiss?: () => void;
}

export function SuccessBanner({ 
  type, 
  chefName, 
  eventTitle, 
  onMessageClick, 
  onDismiss 
}: SuccessBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getBannerContent = () => {
    if (type === "chef") {
      return {
        title: "You've been hired!",
        description: `Your bid for "${eventTitle}" was accepted. Start chatting with the host to coordinate.`,
        buttonText: "Message Host"
      };
    } else {
      return {
        title: "Chef confirmed",
        description: `You've hired ${chefName}. Use the in-app messages to finalize event details.`,
        buttonText: "Message Chef"
      };
    }
  };

  const content = getBannerContent();

  return (
    <Alert className="bg-green-50 border-green-200 mb-6">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div>
          <p className="font-medium text-green-800">{content.title}</p>
          <p className="text-green-700 text-sm mt-1">{content.description}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {onMessageClick && (
            <Button
              size="sm"
              onClick={onMessageClick}
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {content.buttonText}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-green-600 hover:text-green-700 hover:bg-green-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}