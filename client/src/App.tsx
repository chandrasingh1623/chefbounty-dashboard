import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthContext } from "@/lib/auth";
import { authService } from "@/lib/supabase";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import PostEvent from "@/pages/post-event";
import MyEvents from "@/pages/my-events";
import Bids from "@/pages/bids";
import BrowseEvents from "@/pages/browse-events";
import BrowseChefs from "@/pages/browse-chefs";
import { ChefProfile } from "@/pages/chef-profile";
import MyBids from "@/pages/my-bids";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import Payments from "@/pages/payments";
import Settings from "@/pages/settings";
import AdminDashboard from "@/pages/admin-dashboard";
import Onboarding from "@/pages/onboarding";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(authService.getUser());
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = authService.getUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.signIn(email, password);
      setUser(result.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: {
    email: string;
    password: string;
    role: 'host' | 'chef';
    name: string;
  }) => {
    setIsLoading(true);
    try {
      const result = await authService.signUp(userData);
      setUser(result.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setLocation('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = authService.getUser();
  
  if (!user) {
    return <Login />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Login />} />
      <Route path="/login" component={() => <Login />} />
      <Route path="/onboarding">
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/post-event">
        <ProtectedRoute>
          <PostEvent />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/my-events">
        <ProtectedRoute>
          <MyEvents />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/bids">
        <ProtectedRoute>
          <Bids />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/browse-events">
        <ProtectedRoute>
          <BrowseEvents />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/browse-chefs">
        <ProtectedRoute>
          <BrowseChefs />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/chef/:id">
        <ProtectedRoute>
          <ChefProfile />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/my-bids">
        <ProtectedRoute>
          <MyBids />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/messages">
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/payments">
        <ProtectedRoute>
          <Payments />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      <Route path="/admin-dashboard">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
