import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  MapPin, 
  DollarSign,
  Clock,
  User,
  Check,
  X
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  budget: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  hostId: number;
}

interface PendingEventCardProps {
  event: Event;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isLoading?: boolean;
}

function PendingEventCard({ event, onApprove, onReject, isLoading }: PendingEventCardProps) {
  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(event.eventDate), 'MMM d, yyyy • h:mm a')}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.location}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {formatAmount(event.budget)}
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4 line-clamp-3">{event.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Submitted {format(new Date(event.createdAt), 'MMM d, yyyy')}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(event.id)}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => onApprove(event.id)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Handle success messages from email redirects
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const eventTitle = urlParams.get('event');
    
    if (message && eventTitle) {
      if (message === 'approved') {
        toast({
          title: "Event Approved Successfully",
          description: `"${decodeURIComponent(eventTitle)}" has been approved and the host has been notified.`,
          duration: 5000,
        });
      } else if (message === 'rejected') {
        toast({
          title: "Event Rejected",
          description: `"${decodeURIComponent(eventTitle)}" has been rejected and the host has been notified.`,
          duration: 5000,
        });
      }
      
      // Clean up URL parameters after showing the message
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [toast]);

  // Fetch pending events
  const { data: pendingEvents = [], isLoading } = useQuery({
    queryKey: ['/api/admin/pending-events'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pending-events');
      if (!response.ok) throw new Error('Failed to fetch pending events');
      return response.json();
    }
  });

  // Approve event mutation
  const approveMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await fetch(`/api/events/approve/${eventId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-events'] });
    },
  });

  // Reject event mutation
  const rejectMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await fetch(`/api/events/reject/${eventId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reject event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-events'] });
    },
  });

  const handleApprove = (eventId: number) => {
    approveMutation.mutate(eventId);
  };

  const handleReject = (eventId: number) => {
    rejectMutation.mutate(eventId);
  };

  return (
    <DashboardLayout 
      title="Admin Dashboard" 
      subtitle="Manage pending events and platform moderation"
    >
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Events</p>
                  <p className="text-2xl font-bold">{pendingEvents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Today</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected Today</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Events</TabsTrigger>
            <TabsTrigger value="history">Moderation History</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Events Awaiting Approval</CardTitle>
                <CardDescription>
                  Review and moderate new event submissions from hosts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : pendingEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-500">No events pending approval at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingEvents.map((event: Event) => (
                      <PendingEventCard
                        key={event.id}
                        event={event}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        isLoading={approveMutation.isPending || rejectMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderation History</CardTitle>
                <CardDescription>
                  View previously approved and rejected events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">History Coming Soon</h3>
                  <p className="text-gray-500">
                    Moderation history and analytics will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}