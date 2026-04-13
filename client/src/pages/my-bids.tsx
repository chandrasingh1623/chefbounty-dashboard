import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/layout";
import { BidCard } from "@/components/dashboard/bid-card";
import { useAuth } from "@/lib/auth";
import { authService } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Hand, CheckCircle, XCircle, Clock, Plus } from "lucide-react";

export default function MyBids() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: myBids = [], isLoading } = useQuery({
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

  const filteredBids = myBids.filter((bid: any) => {
    const matchesSearch = bid.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bid.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bid.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: myBids.length,
    pending: myBids.filter((bid: any) => bid.status === 'pending').length,
    accepted: myBids.filter((bid: any) => bid.status === 'accepted').length,
    rejected: myBids.filter((bid: any) => bid.status === 'rejected').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-600';
      case 'rejected':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-yellow-100 text-yellow-600';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="My Bids" subtitle="Track your bid submissions and their status">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading your bids...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Bids" subtitle="Track your bid submissions and their status">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Hand className="w-5 h-5 text-blue-600" />
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
                <div className={`p-2 rounded-lg ${getStatusColor('pending')}`}>
                  {getStatusIcon('pending')}
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
                <div className={`p-2 rounded-lg ${getStatusColor('accepted')}`}>
                  {getStatusIcon('accepted')}
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
                <div className={`p-2 rounded-lg ${getStatusColor('rejected')}`}>
                  {getStatusIcon('rejected')}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Rejected</p>
                  <p className="text-xl font-bold text-gray-900">{stats.rejected}</p>
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
              placeholder="Search by event title or your message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={() => setLocation("/dashboard/browse-events")}
            className="bg-primary text-white hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Submit New Bid
          </Button>
        </div>

        {/* Bids List */}
        {filteredBids.length > 0 ? (
          <div className="space-y-4">
            {filteredBids.map((bid: any) => (
              <BidCard key={bid.id} bid={bid} showActions={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hand className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {myBids.length === 0 ? "No bids submitted yet" : "No bids match your filters"}
              </h3>
              <p className="text-gray-500 mb-6">
                {myBids.length === 0 
                  ? "Start bidding on events to grow your business and connect with hosts."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {myBids.length === 0 && (
                <Button 
                  onClick={() => setLocation("/dashboard/browse-events")}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Events
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}