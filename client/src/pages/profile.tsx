import { DashboardLayout } from "@/components/dashboard/layout";
import { EnhancedChefProfile } from "@/components/profile/enhanced-chef-profile";
import { useAuth } from "@/lib/auth";

export default function Profile() {
  const { user } = useAuth();

  return (
    <DashboardLayout 
      title="My Profile" 
      subtitle={user?.role === 'chef' ? "Manage your chef profile and availability" : "Manage your profile and preferences"}
    >
      {user?.role === 'chef' ? (
        <EnhancedChefProfile />
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 text-gray-500">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Host Profile Management Coming Soon
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Profile editing and preference management for hosts will be available soon.
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}