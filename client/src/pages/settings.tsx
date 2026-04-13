import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Trash2,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Download,
  MapPin,
  LogOut
} from "lucide-react";

const accountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required and must be at least 10 digits"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const privacySchema = z.object({
  profileVisible: z.boolean(),
  location: z.string().optional(),
  showLocationPublicly: z.boolean(),
});

const notificationSchema = z.object({
  emailNewBids: z.boolean(),
  emailBookings: z.boolean(),
  emailMessages: z.boolean(),
  smsAlerts: z.boolean().default(true), // Default ON for SMS
  pushNotifications: z.boolean(),
  newEventsInArea: z.boolean().default(true), // New: for chefs to get event notifications
});

type AccountFormData = z.infer<typeof accountSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type PrivacyFormData = z.infer<typeof privacySchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showPassword, setShowPassword] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);

  const accountForm = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const privacyForm = useForm<PrivacyFormData>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      profileVisible: true,
      location: "",
      showLocationPublicly: false,
    },
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNewBids: true,
      emailBookings: true,
      emailMessages: true,
      smsAlerts: true, // Default ON for SMS
      pushNotifications: false,
      newEventsInArea: true, // Default ON for chef event notifications
    },
  });

  // Reset Password functionality
  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });
      if (!response.ok) throw new Error('Failed to send reset email');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password reset link sent",
        description: "Check your email for the password reset link.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send password reset email.",
        variant: "destructive",
      });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      const response = await fetch('/api/user/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update account');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account updated",
        description: "Your account details have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update account details.",
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update password');
      return response.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update password. Check your current password.",
        variant: "destructive",
      });
    },
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: async (data: PrivacyFormData) => {
      const response = await fetch('/api/user/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update privacy settings');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Privacy settings updated",
        description: "Your preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update privacy settings.",
        variant: "destructive",
      });
    },
  });

  const updateNotificationMutation = useMutation({
    mutationFn: async (data: NotificationFormData) => {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update notification settings');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification preferences updated",
        description: "Your settings have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "Your account deletion request has been submitted.",
    });
    setDeleteAccountModal(false);
  };

  const handleDataExport = () => {
    toast({
      title: "Data export requested",
      description: "You will receive an email with your data within 24 hours.",
    });
  };

  const handleClearSessions = () => {
    toast({
      title: "Sessions cleared",
      description: "All saved sessions have been cleared.",
    });
  };

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Manage your account, privacy, and notification preferences"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="w-8 h-8 mr-3 text-[#0a51be]" />
            Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your account, privacy, and notification preferences</p>
        </div>

        {/* Account Details Section */}
        <Card className="shadow-sm border-0 ring-1 ring-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <User className="w-6 h-6 mr-3 text-[#0a51be]" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Account Info */}
            <Form {...accountForm}>
              <form onSubmit={accountForm.handleSubmit((data) => updateAccountMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={accountForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={accountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={accountForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-[#0a51be] hover:bg-[#0a51be]/90"
                  disabled={updateAccountMutation.isPending}
                >
                  {updateAccountMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>

            <Separator />

            {/* Password Management */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Password Management</h3>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit((data) => updatePasswordMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter current password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Enter new password" 
                                {...field} 
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm new password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="bg-[#0a51be] hover:bg-[#0a51be]/90"
                      disabled={updatePasswordMutation.isPending}
                    >
                      {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => resetPasswordMutation.mutate()}
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending ? "Sending..." : "Reset Password"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            <Separator />

            {/* Delete Account */}
            <div className="pt-4">
              <h3 className="text-lg font-semibold mb-2 text-red-600">Delete Account</h3>
              <p className="text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <Dialog open={deleteAccountModal} onOpenChange={setDeleteAccountModal}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete my account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteAccountModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Delete Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings Section */}
        <Card className="shadow-sm border-0 ring-1 ring-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Shield className="w-6 h-6 mr-3 text-[#0a51be]" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...privacyForm}>
              <form onSubmit={privacyForm.handleSubmit((data) => updatePrivacyMutation.mutate(data))} className="space-y-6">
                {/* Profile Visibility */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Profile Visibility</h3>
                  <FormField
                    control={privacyForm.control}
                    name="profileVisible"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <FormLabel className="text-base font-medium">
                            {user?.role === 'chef' ? 'Show my profile to hosts' : 'Make my events discoverable'}
                          </FormLabel>
                          <p className="text-sm text-gray-500 mt-1">
                            {user?.role === 'chef' 
                              ? 'Allow event hosts to find and view your chef profile'
                              : 'Let chefs discover your posted events'
                            }
                          </p>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location Settings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Location Settings</h3>
                  <div className="space-y-4">
                    <FormField
                      control={privacyForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="City, State, ZIP" 
                              {...field} 
                              className="max-w-md"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={privacyForm.control}
                      name="showLocationPublicly"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <FormLabel className="text-base font-medium">Display my location publicly</FormLabel>
                            <p className="text-sm text-gray-500 mt-1">Show your location on your public profile</p>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>



                <Button
                  type="submit"
                  className="bg-[#0a51be] hover:bg-[#0a51be]/90"
                  disabled={updatePrivacyMutation.isPending}
                >
                  {updatePrivacyMutation.isPending ? "Saving..." : "Save Privacy Settings"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Notification Preferences Section */}
        <Card className="shadow-sm border-0 ring-1 ring-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Bell className="w-6 h-6 mr-3 text-[#0a51be]" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...notificationForm}>
              <form onSubmit={notificationForm.handleSubmit((data) => updateNotificationMutation.mutate(data))} className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-[#0a51be]" />
                    Email Notifications
                  </h3>
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNewBids"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <FormLabel className="text-base font-medium">New bids received</FormLabel>
                            <p className="text-sm text-gray-500">Get notified when someone bids on your event</p>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="emailBookings"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <FormLabel className="text-base font-medium">Event booked or canceled</FormLabel>
                            <p className="text-sm text-gray-500">Updates about booking confirmations and cancellations</p>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="emailMessages"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <FormLabel className="text-base font-medium">Messages from {user?.role === 'chef' ? 'hosts' : 'chefs'}</FormLabel>
                            <p className="text-sm text-gray-500">New messages and communications</p>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* SMS Alerts */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-[#0a51be]" />
                    SMS Alerts
                  </h3>
                  <FormField
                    control={notificationForm.control}
                    name="smsAlerts"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <FormLabel className="text-base font-medium">Send me SMS alerts for bookings or changes</FormLabel>
                          <p className="text-sm text-gray-500">Receive text messages for urgent updates (requires phone number)</p>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Push Notifications */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
                  <FormField
                    control={notificationForm.control}
                    name="pushNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <FormLabel className="text-base font-medium">Enable browser notifications</FormLabel>
                          <p className="text-sm text-gray-500">Get instant notifications in your browser</p>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Chef-specific Event Notifications */}
                {user?.role === 'chef' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Event Notifications</h3>
                    <FormField
                      control={notificationForm.control}
                      name="newEventsInArea"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <FormLabel className="text-base font-medium">Notify me about new events in my area</FormLabel>
                            <p className="text-sm text-gray-500">Get notified when new culinary opportunities are posted near you</p>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="bg-[#0a51be] hover:bg-[#0a51be]/90"
                  disabled={updateNotificationMutation.isPending}
                >
                  {updateNotificationMutation.isPending ? "Saving..." : "Save Notification Settings"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}