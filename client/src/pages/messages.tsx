import { DashboardLayout } from "@/components/dashboard/layout";
import { MessageCenter } from "@/components/messages/message-center";

export default function Messages() {
  return (
    <DashboardLayout title="Messages" subtitle="Communicate with hosts and chefs">
      <MessageCenter />
    </DashboardLayout>
  );
}