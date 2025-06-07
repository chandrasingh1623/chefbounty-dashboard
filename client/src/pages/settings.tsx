import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <DashboardLayout title="Settings" subtitle="Manage your account settings and preferences">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <SettingsIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Settings Panel Coming Soon
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Account settings and preferences will be available soon. 
                You'll be able to manage notifications, privacy settings, and account details.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}