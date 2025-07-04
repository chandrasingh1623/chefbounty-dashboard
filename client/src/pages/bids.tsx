import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/layout";
import { BidCard } from "@/components/dashboard/bid-card";
import { useAuth } from "@/lib/auth";
import { authService } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Search, Users, DollarSign, Clock, CheckCircle } from "lucide-react";
import { getChefPrivacyInfo } from "@/lib/chef-privacy";

export default function Bids() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");

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

  const { data: allBids = [], isLoading } = useQuery({
    queryKey: ['/api/bids/host-events'],
    enabled: !!user?.id && events.length > 0,
    queryFn: async () => {
      // Get bids for all host events
      const bidPromises = events.map((event: any) =>
        fetch(`/api/bids/event/${event.id}`, {
          headers: authService.getAuthHeaders(),
        }).then(res => res.ok ? res.json() : [])
      );
      const bidsArrays = await Promise.all(bidPromises);
      return bidsArrays.flat();
    },
  });

  const filteredBids = allBids.filter((bid: any) => {
    // For search, use actual chef name for hosts (they can search by masked name too)
    // But only show masked results unless bid is accepted
    const chefPrivacy = getChefPrivacyInfo(bid.status, user?.role || '', bid.chef?.name || '');
    
    const matchesSearch = 
      bid.chef?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chefPrivacy.maskedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || bid.status === statusFilter;
    const matchesEvent = eventFilter === "all" || bid.eventId.toString() === eventFilter;
    return matchesSearch && matchesStatus && matchesEvent;
  });

  const stats = {
    total: allBids.length,
    pending: allBids.filter((bid: any) => bid.status === 'pending').length,
    accepted: allBids.filter((bid: any) => bid.status === 'accepted').length,
    avgAmount: allBids.length > 0 
      ? Math.round(allBids.reduce((sum: number, bid: any) => sum + parseFloat(bid.amount || '0'), 0) / allBids.length)
      : 0,
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Bids" subtitle="Review and manage bids from chefs for your events">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading bids...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Bids" subtitle="Review and manage bids from chefs for your events">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Bids</p>
                  <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Accepted</p>
                  <p className="text-xl font-bold text-gray-900">{stats.accepted}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-100">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Avg. Bid</p>
                  <p className="text-xl font-bold text-gray-900">${stats.avgAmount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by chef name or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((event: any) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bids List */}
        {filteredBids.length > 0 ? (
          <div className="space-y-4">
            {filteredBids.map((bid: any) => (
              <BidCard key={bid.id} bid={bid} showActions={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {allBids.length === 0 ? "No bids yet" : "No bids match your filters"}
              </h3>
              <p className="text-gray-500">
                {allBids.length === 0 
                  ? "Bids from chefs will appear here once you post events."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}