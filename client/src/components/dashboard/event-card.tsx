import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock,
  UtensilsCrossed,
  Edit,
  Trash2
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
  showHostActions?: boolean;
  onBid?: (eventId: number) => void;
  onViewDetails?: (eventId: number) => void;
  onEdit?: (eventId: number) => void;
  onDelete?: (eventId: number) => void;
  bidCount?: number;
}

export function EventCard({ event, showBidButton = false, showHostActions = false, onBid, onViewDetails, onEdit, onDelete, bidCount }: EventCardProps) {
  const eventDate = new Date(event.eventDate);
  const isUpcoming = eventDate > new Date();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'open':
        return 'Open';
      case 'closed':
        return 'Closed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
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
              {getStatusLabel(event.status)}
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

        <div className="space-y-3">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="capitalize">{event.venueType} venue</span>
            <span>{event.duration} hours</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => onViewDetails?.(event.id)}
              >
                View Full Listing
              </Button>
              
              {showHostActions && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                    onClick={() => onEdit?.(event.id)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => onDelete?.(event.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </div>
            
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
