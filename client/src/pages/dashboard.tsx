import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard/layout";
import { HostDashboard } from "@/components/dashboard/host-dashboard";
import { ChefDashboard } from "@/components/dashboard/chef-dashboard";
import { OnboardingSlider } from "@/components/onboarding/onboarding-slider";

export default function Dashboard() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const onboardingCompleted = localStorage.getItem('chefbounty_onboarding_completed');
    if (!onboardingCompleted && user) {
      setShowOnboarding(true);
    }
  }, [user]);

  if (!user) {
    return null; // This will be handled by auth middleware
  }

  const title = "Dashboard Overview";
  const subtitle = user.role === "host" 
    ? "Welcome back! Here's what's happening with your events."
    : "Welcome back! Here are the latest opportunities.";

  return (
    <>
      <DashboardLayout title={title} subtitle={subtitle}>
        {user.role === "host" && <HostDashboard />}
        {user.role === "chef" && <ChefDashboard />}
      </DashboardLayout>
      
      <OnboardingSlider 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </>
  );
}
