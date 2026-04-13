import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { authService } from "@/lib/supabase";
import { 
  Calendar, 
  HandIcon as Hand, 
  CheckCircle, 
  DollarSign,
  UtensilsCrossed,
  Cake,
  Eye,
  MessageCircle
} from "lucide-react";
import { Link } from "wouter";
import { getChefPrivacyInfo, shouldShowContactInfo } from "@/lib/chef-privacy";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DemoDataControls } from "./demo-data-controls";

export function HostDashboard() {
  const { user } = useAuth();
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

  const handleAcceptBid = (bidId: number) => {
    updateBidMutation.mutate({ bidId, status: 'accepted' });
  };

  const handleRejectBid = (bidId: number) => {
    updateBidMutation.mutate({ bidId, status: 'rejected' });
  };

  const { data: events = [] } = useQuery({
    queryKey: ['/api/events/host', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await fetch(`/api/events/host/${user?.id}`, {
        headers: authService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  const { data: recentBids = [] } = useQuery({
    queryKey: ['/api/bids/recent'],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await fetch('/api/bids/recent', {
        headers: authService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch bids');
      return response.json();
    },
  });

  const activeEvents = events.filter((event: any) => event.status === 'open');
  const completedEvents = events.filter((event: any) => event.status === 'completed');
  const totalBids = recentBids.length;
  const totalSpent = completedEvents.reduce((sum: number, event: any) => sum + parseFloat(event.budget || '0'), 0);

  const stats = [
    {
      title: "Active Events",
      value: activeEvents.length,
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Bids",
      value: totalBids,
      icon: Hand,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Completed",
      value: completedEvents.length,
      icon: CheckCircle,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Total Spent",
      value: `$${totalSpent.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-purple-100 text-purple-600",
    },
  ];



  return (
    <div>


      {/* Welcome Banner */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0] || 'Host'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Your next culinary experience is just a booking away.
              </p>
            </div>
            <div className="hidden md:block">
              <UtensilsCrossed className="w-12 h-12 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Events & Bids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Events</CardTitle>
              <Link href="/dashboard/my-events">
                <span className="text-sm text-primary hover:text-primary/80 font-medium cursor-pointer">
                  View All
                </span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.slice(0, 3).map((event: any) => (
              <div
                key={event.id}
                className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  {event.cuisineType === 'Italian' ? (
                    <UtensilsCrossed className="w-6 h-6 text-gray-500" />
                  ) : (
                    <Cake className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.eventDate).toLocaleDateString()} • {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-1">
                    {recentBids.filter((bid: any) => bid.eventId === event.id).length} Bids
                  </Badge>
                  <p className="text-sm font-medium text-gray-900">${event.budget}</p>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No events yet. Create your first event!</p>
                <Link href="/dashboard/post-event">
                  <Button className="mt-4">Post New Event</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bids */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Bids</CardTitle>
              <Link href="/dashboard/bids">
                <span className="text-sm text-primary hover:text-primary/80 font-medium cursor-pointer">
                  View All
                </span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBids.slice(0, 3).map((bid: any) => {
              const chefPrivacy = getChefPrivacyInfo(bid.status, user?.role || '', bid.chef?.name || '');
              const canShowContactInfo = shouldShowContactInfo(bid.status, user?.role || '');
              
              return (
                <div key={bid.id} className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={bid.chef?.profilePhoto} />
                    <AvatarFallback>{bid.chef?.name?.charAt(0) || 'C'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">
                        {chefPrivacy.maskedName || 'Chef'}
                      </p>
                      {!chefPrivacy.showFullInfo && (
                        <Badge variant="secondary" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Masked
                        </Badge>
                      )}
                    </div>
                    {chefPrivacy.privacyMessage && (
                      <p className="text-xs text-gray-500 italic">
                        {chefPrivacy.privacyMessage}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">{bid.event?.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(bid.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${bid.amount}</p>
                    {bid.status === 'pending' && (
                      <div className="flex space-x-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          onClick={() => handleAcceptBid(bid.id)}
                          disabled={updateBidMutation.isPending}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          onClick={() => handleRejectBid(bid.id)}
                          disabled={updateBidMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {canShowContactInfo && bid.status === 'accepted' && (
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 mt-2"
                        onClick={() => {
                          window.location.href = `/dashboard/messages?chef=${bid.chef?.id}`;
                        }}
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Contact
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {recentBids.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No bids yet. Your events will receive bids from interested chefs.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
