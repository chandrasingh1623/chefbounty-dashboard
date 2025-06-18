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
  Cake
} from "lucide-react";
import { Link } from "wouter";

export function HostDashboard() {
  const { user } = useAuth();

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

  const handleAcceptBid = async (bidId: number) => {
    try {
      await fetch(`/api/bids/${bidId}/status`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ status: 'accepted' }),
      });
      // Refresh bids data
      // queryClient.invalidateQueries({ queryKey: ['/api/bids/recent'] });
    } catch (error) {
      console.error('Failed to accept bid:', error);
    }
  };

  const handleRejectBid = async (bidId: number) => {
    try {
      await fetch(`/api/bids/${bidId}/status`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ status: 'rejected' }),
      });
      // Refresh bids data
      // queryClient.invalidateQueries({ queryKey: ['/api/bids/recent'] });
    } catch (error) {
      console.error('Failed to reject bid:', error);
    }
  };

  return (
    <div>
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
            {recentBids.slice(0, 3).map((bid: any) => (
              <div key={bid.id} className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={bid.chef?.profilePhoto} />
                  <AvatarFallback>{bid.chef?.name?.charAt(0) || 'C'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{bid.chef?.name || 'Chef'}</p>
                  <p className="text-sm text-gray-500">{bid.event?.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(bid.createdAt).toRelativeTimeString()}
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
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        onClick={() => handleRejectBid(bid.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
