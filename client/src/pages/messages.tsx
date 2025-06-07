import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export default function Messages() {
  return (
    <DashboardLayout title="Messages" subtitle="Communicate with hosts and chefs">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Messaging System Coming Soon
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Real-time messaging between hosts and chefs will be available soon. 
                You'll be able to discuss event details, ask questions, and coordinate directly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}