import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock,
  UtensilsCrossed 
} from "lucide-react";

interface EventCardProps {
  event: {
    id: number;
    title: string;
    description: string;
    cuisineType: string;
    eventDate: string;
    duration: number;
    location: string;
    budget: string;
    venueType: string;
    status: string;
    createdAt: string;
  };
  showBidButton?: boolean;
  onBid?: (eventId: number) => void;
  onViewDetails?: (eventId: number) => void;
  bidCount?: number;
}

export function EventCard({ event, showBidButton = false, onBid, onViewDetails, bidCount }: EventCardProps) {
  const eventDate = new Date(event.eventDate);
  const isUpcoming = eventDate > new Date();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {event.cuisineType}
              </Badge>
            </div>
          </div>
          
          <div className="text-right">
            <Badge className={`text-xs ${getStatusColor(event.status)}`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
            {bidCount !== undefined && (
              <p className="text-sm text-gray-500 mt-1">{bidCount} bids</p>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{eventDate.toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>${event.budget}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="capitalize">{event.venueType} venue</span>
            <span>{event.duration} hours</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => onViewDetails?.(event.id)}
            >
              View Full Listing
            </Button>
            
            {showBidButton && event.status === 'open' && isUpcoming && (
              <Button
                size="sm"
                className="bg-primary text-white hover:bg-primary/90"
                onClick={() => onBid?.(event.id)}
              >
                Place Bid
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
