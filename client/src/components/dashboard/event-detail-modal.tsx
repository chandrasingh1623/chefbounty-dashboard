import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users,
  UtensilsCrossed,
  ChefHat,
  Home,
  Car,
  Utensils,
  Wine,
  Shirt,
  Camera
} from "lucide-react";

interface EventDetailModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  if (!event) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const eventDateTime = formatDate(event.eventDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">
            {event.title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Complete event details and requirements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Overview */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Event Overview</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium text-gray-900">{eventDateTime.date}</p>
                  <p className="text-sm text-gray-700">{eventDateTime.time}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{event.duration} {event.duration === 1 ? 'hour' : 'hours'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Guest Count</p>
                  <p className="font-medium text-gray-900">{event.guestCount} {event.guestCount === 1 ? 'person' : 'people'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-medium text-gray-900">${event.budget}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{event.location}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Description</p>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          </div>

          <Separator />

          {/* Cuisine & Meal Preferences */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Cuisine & Meal Preferences</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Preferred Cuisine(s)</p>
                <div className="flex flex-wrap gap-2">
                  {event.cuisineType?.map((cuisine: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Meal Type</p>
                <Badge variant="outline" className="capitalize">
                  {event.mealType}
                </Badge>
              </div>
              
              {event.allergies && event.allergies.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Dietary Restrictions</p>
                  <div className="flex flex-wrap gap-2">
                    {event.allergies.map((allergy: string, index: number) => (
                      <Badge key={index} variant="destructive" className="bg-red-100 text-red-800">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Beverage Service</p>
                <Badge variant={event.beverageService ? "default" : "secondary"}>
                  {event.beverageService ? "Required" : "Not Required"}
                </Badge>
                {event.alcoholIncluded && (
                  <Badge variant="outline" className="ml-2">
                    Alcohol Included
                  </Badge>
                )}
              </div>
              
              {event.dietaryRequirements && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Dietary Requirements</p>
                  <p className="text-gray-700 text-sm">{event.dietaryRequirements}</p>
                </div>
              )}
              
              {event.serviceStyle && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Service Style</p>
                  <p className="text-gray-700 text-sm">{event.serviceStyle}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Chef Requirements */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ChefHat className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Chef Requirements</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Shirt className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Chef Attire</p>
                  <p className="font-medium text-gray-900 capitalize">{event.chefAttire}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Utensils className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">On-site Cooking</p>
                  <Badge variant={event.onsiteCooking ? "default" : "secondary"}>
                    {event.onsiteCooking ? "Required" : "Not Required"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Serving Staff</p>
                  <Badge variant={event.servingStaff ? "default" : "secondary"}>
                    {event.servingStaff ? "Required" : "Not Required"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 text-gray-500 flex items-center justify-center">
                  🧽
                </div>
                <div>
                  <p className="text-sm text-gray-500">Setup & Cleanup</p>
                  <Badge variant={event.setupCleanup ? "default" : "secondary"}>
                    {event.setupCleanup ? "Included" : "Not Included"}
                  </Badge>
                </div>
              </div>
            </div>
            
            {event.specialEquipment && event.specialEquipment.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Special Equipment</p>
                <div className="flex flex-wrap gap-2">
                  {event.specialEquipment.map((equipment: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {equipment}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Venue Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Home className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Venue Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Venue Type</p>
                <Badge variant="outline" className="capitalize">
                  {event.venueType}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Kitchen Availability</p>
                <Badge variant="outline" className="capitalize">
                  {event.kitchenAvailability} Kitchen
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Setting</p>
                <Badge variant="outline" className="capitalize">
                  {event.indoorOutdoor}
                </Badge>
              </div>
              
              {event.parkingAccessibility && (
                <div className="flex items-center space-x-3">
                  <Car className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Parking</p>
                    <p className="font-medium text-gray-900">{event.parkingAccessibility}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Style & Experience */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Style & Experience</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.eventTheme && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Theme / Mood</p>
                  <p className="font-medium text-gray-900">{event.eventTheme}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Live Interaction</p>
                <Badge variant={event.liveCooking ? "default" : "secondary"}>
                  {event.liveCooking ? "Expected" : "Not Expected"}
                </Badge>
              </div>
              
              {event.guestDressCode && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Guest Dress Code</p>
                  <p className="font-medium text-gray-900 capitalize">{event.guestDressCode}</p>
                </div>
              )}
            </div>
          </div>

          {/* Event Image */}
          {event.eventImage && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Event Image</h3>
                <img 
                  src={event.eventImage} 
                  alt={event.title}
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}