import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

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
      toast({
        title: `Bid ${status}`,
        description: `The bid has been ${status} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bids'] });
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
                <p className="font-medium text-gray-900">{bid.chef?.name || 'Unknown Chef'}</p>
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
            
            {showActions && bid.status === 'pending' && (
              <div className="flex space-x-2 mt-3">
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
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
