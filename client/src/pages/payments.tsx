import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function Payments() {
  return (
    <DashboardLayout title="Payments" subtitle="Manage your payment methods and transaction history">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Payment System Coming Soon
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Secure payment processing will be available soon. 
                You'll be able to manage payment methods, view transaction history, and handle invoicing directly through the platform.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}