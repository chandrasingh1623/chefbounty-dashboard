import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Database, Trash2, Users, Calendar, DollarSign, Bell } from "lucide-react";
import { useState } from "react";

interface DemoDataResult {
  message: string;
  hosts?: number;
  chefs?: number;
  events?: number;
  bids?: number;
  notifications?: number;
  totalUsers?: number;
  existingDemoUsers?: number;
}

export function DemoDataControls() {
  const [result, setResult] = useState<DemoDataResult | null>(null);
  const queryClient = useQueryClient();

  const seedDataMutation = useMutation({
    mutationFn: () => 
      apiRequest("/api/demo/seed", {
        method: "POST"
      }),
    onSuccess: (data: DemoDataResult) => {
      setResult(data);
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chefs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const clearDataMutation = useMutation({
    mutationFn: () => 
      apiRequest("/api/demo/clear", {
        method: "DELETE"
      }),
    onSuccess: (data: DemoDataResult) => {
      setResult(data);
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chefs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  // Don't show in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Database className="w-5 h-5 mr-2 text-blue-600" />
          Demo Data Controls
          <Badge variant="outline" className="ml-2 text-xs">Development Only</Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Generate realistic sample data for testing Browse Chefs and Browse Events sections
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-3">
          <Button
            onClick={() => seedDataMutation.mutate()}
            disabled={seedDataMutation.isPending}
            className="flex-1"
          >
            <Database className="w-4 h-4 mr-2" />
            {seedDataMutation.isPending ? "Generating..." : "Generate Demo Data"}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => clearDataMutation.mutate()}
            disabled={clearDataMutation.isPending}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {clearDataMutation.isPending ? "Clearing..." : "Clear Demo Data"}
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">
              {result.message}
            </h4>
            
            {result.hosts && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{result.hosts}</p>
                    <p className="text-xs text-gray-500">Hosts</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{result.chefs}</p>
                    <p className="text-xs text-gray-500">Chefs</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">{result.events}</p>
                    <p className="text-xs text-gray-500">Events</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">{result.bids}</p>
                    <p className="text-xs text-gray-500">Bids</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">{result.notifications}</p>
                    <p className="text-xs text-gray-500">Notifications</p>
                  </div>
                </div>
              </div>
            )}

            {result.existingDemoUsers && (
              <p className="text-sm text-gray-600 mt-2">
                Found {result.existingDemoUsers} existing demo users
              </p>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
          <strong>What this generates:</strong>
          <ul className="mt-1 space-y-1">
            <li>• 15-20 realistic chef profiles with photos, specialties, and portfolios</li>
            <li>• 5-8 host profiles with varied event needs</li>
            <li>• 10-15 diverse events with different cuisines and requirements</li>
            <li>• Multiple bids per event with realistic pricing and messages</li>
            <li>• Sample notifications for testing the notification system</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}