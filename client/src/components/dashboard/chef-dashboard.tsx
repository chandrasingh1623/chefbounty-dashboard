import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { authService } from "@/lib/supabase";
import { useProfileCompletion } from "@/hooks/use-profile-completion";
import { JobDetailsModal } from "./job-details-modal";
import { 
  Hand, 
  CheckCircle, 
  Star, 
  DollarSign 
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { DemoDataControls } from "./demo-data-controls";

export function ChefDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { profileCompletion, isLoading: profileLoading } = useProfileCompletion();
  const [selectedJobDetails, setSelectedJobDetails] = useState<any>(null);

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

  // Remove the availableEvents query since we're showing Jobs Won instead

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
    // Navigate to browse events page
    setLocation('/dashboard/browse-events');
    
    // Add a small delay and trigger the bid modal for the specific event
    setTimeout(() => {
      // Find the Submit Bid button for this event and click it
      const bidButtons = document.querySelectorAll('button');
      bidButtons.forEach(button => {
        if (button.textContent === 'Submit Bid') {
          button.click();
          return;
        }
      });
    }, 100);
  };

  return (
    <div>


      {/* Welcome Banner */}
      <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, Chef {user?.name?.split(' ')[0] || 'Chef'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Let's cook up some opportunities.
              </p>
            </div>
            <div className="hidden md:block">
              <Star className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Progress Bar */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
            <span className="text-sm font-medium text-gray-600">{profileCompletion.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${profileCompletion.percentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {profileCompletion.percentage < 100 
              ? `Your profile is ${profileCompletion.percentage}% complete. Finish it to start receiving invites!`
              : "Your profile is complete! You're ready to receive bookings."
            }
          </p>
          {profileCompletion.percentage < 100 && (
            <Link href="/dashboard/profile">
              <Button size="sm" className="mt-3">Complete Profile</Button>
            </Link>
          )}
          {profileCompletion.missingFields.length > 0 && (
            <div className="mt-3 text-xs text-gray-500">
              Missing: {profileCompletion.missingFields.slice(0, 3).join(', ')}
              {profileCompletion.missingFields.length > 3 && ` +${profileCompletion.missingFields.length - 3} more`}
            </div>
          )}
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

      {/* Jobs Won & My Bids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Jobs Won */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Jobs Won</CardTitle>
              <Link href="/dashboard/my-bids">
                <span className="text-sm text-primary hover:text-primary/80 font-medium cursor-pointer">
                  View All Bids
                </span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobsWon.slice(0, 3).map((bid: any) => (
              <div
                key={bid.id}
                className="p-4 border border-green-100 rounded-lg bg-green-50/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <Badge className="bg-green-100 text-green-800 text-xs">Won</Badge>
                    </div>
                    <h4 className="font-medium text-gray-900">{bid.event?.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Event Date: {new Date(bid.event?.eventDate || '').toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">{bid.event?.location}</p>
                    <p className="text-sm text-gray-700 mt-2">Your bid: ${bid.amount}</p>
                  </div>
                  <div className="text-right ml-4">
                    <Button
                      size="sm"
                      className="bg-primary text-white hover:bg-primary/90"
                      onClick={() => setSelectedJobDetails(bid)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {jobsWon.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-2">No jobs won yet</p>
                <p className="text-sm text-gray-400">Keep bidding on events to win your first job!</p>
                <Link href="/dashboard/browse-events">
                  <Button className="mt-4" size="sm">Browse Events</Button>
                </Link>
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
                <span className="text-sm text-primary hover:text-primary/80 font-medium cursor-pointer">
                  View All
                </span>
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

      {/* Job Details Modal */}
      {selectedJobDetails && (
        <JobDetailsModal
          isOpen={!!selectedJobDetails}
          onClose={() => setSelectedJobDetails(null)}
          bid={selectedJobDetails}
          onMessageHost={() => {
            setSelectedJobDetails(null);
            window.location.href = `/dashboard/messages?chef=${selectedJobDetails?.host?.id || selectedJobDetails?.event?.hostId}`;
          }}
        />
      )}
    </div>
  );
}
