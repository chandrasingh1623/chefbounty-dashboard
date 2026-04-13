import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  MessageCircle,
  CheckCircle,
  Phone,
  Mail
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bid: {
    id: number;
    amount: string;
    message: string;
    status: string;
    createdAt: string;
    event?: {
      id: number;
      title: string;
      description: string;
      eventDate: string;
      location: string;
      guestCount: number;
      budget: string;
      cuisinePreferences?: string[];
      specialRequests?: string;
    };
    host?: {
      id: number;
      name: string;
      email: string;
      phone?: string;
      profilePhoto?: string;
    };
  };
  onMessageHost: () => void;
}

export function JobDetailsModal({
  isOpen,
  onClose,
  bid,
  onMessageHost,
}: JobDetailsModalProps) {
  if (!bid || !bid.event) return null;

  const eventDate = new Date(bid.event.eventDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Job Details
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Complete details for your accepted bid
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Banner */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">Congratulations!</h3>
                    <p className="text-sm text-green-700">Your bid was accepted</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Job Won
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Event Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h3>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 text-lg">{bid.event.title}</h4>
                  <p className="text-gray-600 mt-1">{bid.event.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date & Time</p>
                      <p className="text-sm text-gray-600">
                        {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{bid.event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Guest Count</p>
                      <p className="text-sm text-gray-600">{bid.event.guestCount} guests</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Your Bid</p>
                      <p className="text-sm text-gray-600">${bid.amount}</p>
                    </div>
                  </div>
                </div>

                {bid.event.cuisinePreferences && bid.event.cuisinePreferences.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Cuisine Preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {bid.event.cuisinePreferences.map((cuisine, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {bid.event.specialRequests && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Special Requests</p>
                    <p className="text-sm text-gray-600 mt-1">{bid.event.specialRequests}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Your Bid Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Winning Bid</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">${bid.amount}</p>
                    <p className="text-sm text-gray-500">
                      Submitted {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Accepted
                  </Badge>
                </div>
                <Separator className="my-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Your Proposal</p>
                  <p className="text-sm text-gray-600">{bid.message}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Host Contact Information */}
          {bid.host && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Host Information</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {bid.host.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{bid.host.name}</p>
                      <p className="text-sm text-gray-500">Event Host</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Communication Policy:</strong> All communication must take place within ChefBounty. 
                      Use the message button below to coordinate event details securely.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={onMessageHost}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Host
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}