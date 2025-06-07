import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { authService } from "@/lib/supabase";
import { 
  Hand, 
  CheckCircle, 
  Star, 
  DollarSign 
} from "lucide-react";
import { Link } from "wouter";

export function ChefDashboard() {
  const { user } = useAuth();

  const { data: myBids = [] } = useQuery({
    queryKey: ['/api/bids/chef', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await fetch(`/api/bids/chef/${user?.id}`, {
        headers: authService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch bids');
      return response.json();
    },
  });

  const { data: availableEvents = [] } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await fetch('/api/events', {
        headers: authService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  const activeBids = myBids.filter((bid: any) => bid.status === 'pending');
  const jobsWon = myBids.filter((bid: any) => bid.status === 'accepted');
  const totalEarnings = jobsWon.reduce((sum: number, bid: any) => sum + parseFloat(bid.amount || '0'), 0);

  const stats = [
    {
      title: "Active Bids",
      value: activeBids.length,
      icon: Hand,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Jobs Won",
      value: jobsWon.length,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Rating",
      value: user?.rating || "4.9",
      icon: Star,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Earnings",
      value: `$${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const handleSubmitBid = async (eventId: number) => {
    // This would open a bid submission modal
    console.log('Submit bid for event:', eventId);
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

      {/* Available Events & My Bids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Available Events</CardTitle>
              <Link href="/dashboard/browse-events">
                <a className="text-sm text-primary hover:text-primary/80 font-medium">
                  Browse All
                </a>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableEvents.filter((event: any) => event.status === 'open').slice(0, 3).map((event: any) => (
              <div
                key={event.id}
                className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(event.eventDate).toLocaleDateString()} • {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-gray-500">{event.location}</p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{event.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-gray-900">${event.budget}</p>
                    <Button
                      size="sm"
                      className="mt-2 bg-primary text-white hover:bg-primary/90"
                      onClick={() => handleSubmitBid(event.id)}
                    >
                      Place Bid
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {availableEvents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No available events at the moment. Check back later!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Bids */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Bids</CardTitle>
              <Link href="/dashboard/my-bids">
                <a className="text-sm text-primary hover:text-primary/80 font-medium">
                  View All
                </a>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {myBids.slice(0, 3).map((bid: any) => (
              <div key={bid.id} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{bid.event?.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted {new Date(bid.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{bid.message}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-gray-900">${bid.amount}</p>
                    <Badge
                      variant={
                        bid.status === 'accepted' ? 'default' :
                        bid.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                      className="mt-2"
                    >
                      {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {myBids.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No bids yet. Start bidding on events to grow your business!</p>
                <Link href="/dashboard/browse-events">
                  <Button className="mt-4">Browse Events</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
