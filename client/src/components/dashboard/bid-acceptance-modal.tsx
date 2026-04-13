import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface BidAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bid: {
    id: number;
    amount: string;
    chef?: {
      id: number;
      name: string;
      profilePhoto?: string;
    };
    event?: {
      id: number;
      title: string;
    };
  };
  onMessageChef: () => void;
  onViewEvent: () => void;
}

export function BidAcceptanceModal({
  isOpen,
  onClose,
  bid,
  onMessageChef,
  onViewEvent,
}: BidAcceptanceModalProps) {
  const { user } = useAuth();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Bid Accepted
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 mt-2">
            You've accepted Chef {bid.chef?.name}'s bid for "${bid.event?.title}". 
            You can now message the chef directly within ChefBounty to finalize details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bid Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{bid.event?.title}</h4>
                <p className="text-sm text-gray-600">Chef: {bid.chef?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg text-gray-900">${bid.amount}</p>
                <Badge className="bg-green-100 text-green-800">
                  Accepted
                </Badge>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Security Notice:</strong> All communication must take place within ChefBounty. 
              Contact information is securely managed through in-app messaging.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={onMessageChef}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Chef Now
            </Button>
            <Button
              onClick={onViewEvent}
              variant="outline"
              className="flex-1"
            >
              <Calendar className="w-4 h-4 mr-2" />
              View Event Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}