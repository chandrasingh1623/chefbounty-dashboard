import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { getChefPrivacyInfo, shouldShowContactInfo } from "@/lib/chef-privacy";
import { MessageCircle, Eye, Award, MapPin, Users, ChefHat } from "lucide-react";
import { BidAcceptanceModal } from "./bid-acceptance-modal";
import { useState } from "react";

interface BidCardProps {
  bid: {
    id: number;
    amount: string;
    message: string;
    status: string;
    createdAt: string;
    chef?: {
      id: number;
      name: string;
      profilePhoto?: string;
      rating?: string;
      email?: string;
      specialties?: string[];
      experience?: number;
      maxTravelDistance?: number;
      foodSafetyCertifications?: string[];
      formalTraining?: string;
      workHistory?: string;
      availableServices?: string[];
      maxPartySize?: number;
    };
    event?: {
      id: number;
      title: string;
    };
  };
  showActions?: boolean;
}

export function BidCard({ bid, showActions = false }: BidCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showAcceptanceModal, setShowAcceptanceModal] = useState(false);
  
  // Get chef privacy information based on bid status and user role
  const chefPrivacy = getChefPrivacyInfo(
    bid.status, 
    user?.role || '', 
    bid.chef?.name || ''
  );
  
  const canShowContactInfo = shouldShowContactInfo(bid.status, user?.role || '');

  const updateBidMutation = useMutation({
    mutationFn: async ({ bidId, status }: { bidId: number; status: string }) => {
      const response = await fetch(`/api/bids/${bidId}/status`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bid status');
      }

      return response.json();
    },
    onSuccess: (_, { status }) => {
      if (status === 'accepted') {
        setShowAcceptanceModal(true);
      } else {
        toast({
          title: `Bid ${status}`,
          description: `The bid has been ${status} successfully.`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/bids'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update bid",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAccept = () => {
    updateBidMutation.mutate({ bidId: bid.id, status: 'accepted' });
  };

  const handleReject = () => {
    updateBidMutation.mutate({ bidId: bid.id, status: 'rejected' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={bid.chef?.profilePhoto} />
              <AvatarFallback>{bid.chef?.name?.charAt(0) || 'C'}</AvatarFallback>
            </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">
                    {chefPrivacy.maskedName || 'Unknown Chef'}
                  </p>
                  {!chefPrivacy.showFullInfo && (
                    <Badge variant="secondary" className="text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      Masked
                    </Badge>
                  )}
                </div>
                
                {chefPrivacy.privacyMessage && (
                  <p className="text-xs text-gray-500 italic mt-1">
                    {chefPrivacy.privacyMessage}
                  </p>
                )}
                
                {bid.event && (
                  <p className="text-sm text-gray-500">{bid.event.title}</p>
                )}
                <p className="text-sm text-gray-500">
                  {new Date(bid.createdAt).toLocaleDateString()}
                </p>
                {bid.chef?.rating && (
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-yellow-600">★</span>
                    <span className="text-sm text-gray-600 ml-1">{bid.chef.rating}</span>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-lg text-gray-900">${bid.amount}</p>
                <Badge className={`text-xs ${getStatusColor(bid.status)}`}>
                  {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                </Badge>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{bid.message}</p>
            
            {/* Chef Qualifications Section */}
            <div className="mt-4 space-y-3">
              {/* Cuisine Specialization Tags */}
              {bid.chef?.specialties && bid.chef.specialties.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-1">
                    {bid.chef.specialties.slice(0, 4).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="rounded-full bg-gray-100 text-gray-700 text-xs px-2 py-1">
                        {specialty}
                      </Badge>
                    ))}
                    {bid.chef.specialties.length > 4 && (
                      <Badge variant="secondary" className="rounded-full bg-gray-100 text-gray-700 text-xs px-2 py-1">
                        +{bid.chef.specialties.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {/* Experience Summary */}
              {bid.chef?.experience && (
                <div className="flex items-start space-x-2">
                  <ChefHat className="w-4 h-4 text-gray-500 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    {bid.chef.experience}+ years of culinary experience
                  </p>
                </div>
              )}
              
              {/* Travel Radius */}
              {bid.chef?.maxTravelDistance && (
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Available within {bid.chef.maxTravelDistance} miles
                  </p>
                </div>
              )}
              
              {/* Service Capacity */}
              {bid.chef?.maxPartySize && (
                <div className="flex items-start space-x-2">
                  <Users className="w-4 h-4 text-gray-500 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Can serve up to {bid.chef.maxPartySize} guests
                  </p>
                </div>
              )}
              
              {/* Certifications */}
              {bid.chef?.foodSafetyCertifications && bid.chef.foodSafetyCertifications.length > 0 && (
                <div>
                  <div className="flex items-start space-x-2 mb-1">
                    <Award className="w-4 h-4 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-600 font-medium">Certifications:</p>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-6">
                    {bid.chef.foodSafetyCertifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Formal Training */}
              {bid.chef?.formalTraining && (
                <div>
                  <div className="flex items-start space-x-2">
                    <Award className="w-4 h-4 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Training:</span> {bid.chef.formalTraining}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {showActions && (
              <div className="flex space-x-2 mt-3">
                {bid.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      onClick={handleAccept}
                      disabled={updateBidMutation.isPending}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      onClick={handleReject}
                      disabled={updateBidMutation.isPending}
                    >
                      Decline
                    </Button>
                  </>
                )}
                
                {bid.status === 'accepted' && (
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      window.location.href = `/dashboard/messages?chef=${bid.chef?.id}`;
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Chef
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    <BidAcceptanceModal
      isOpen={showAcceptanceModal}
      onClose={() => setShowAcceptanceModal(false)}
      bid={bid}
      onMessageChef={() => {
        setShowAcceptanceModal(false);
        window.location.href = `/dashboard/messages?chef=${bid.chef?.id}`;
      }}
      onViewEvent={() => {
        setShowAcceptanceModal(false);
        window.location.href = `/dashboard/my-events?event=${bid.event?.id}`;
      }}
    />
    </>
  );
}
