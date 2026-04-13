import { DashboardLayout } from "@/components/dashboard/layout";
import { PaymentDashboard } from "@/components/payments/payment-dashboard";

export default function Payments() {
  return (
    <DashboardLayout title="Payments" subtitle="Manage your payment methods and transaction history">
      <PaymentDashboard />
    </DashboardLayout>
  );
}