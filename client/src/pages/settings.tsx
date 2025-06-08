import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings as SettingsIcon,
  User,
  Camera,
  Shield,
  Bell,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Trash2,
  LogOut,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Globe,
  Lock,
  UserCheck
} from "lucide-react";

const accountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const profileSchema = z.object({
  location: z.string().optional(),
  publicProfile: z.boolean(),
});

type AccountFormData = z.infer<typeof accountSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type ProfileFormData = z.infer<typeof profileSchema>;

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    account: true,
    profile: false,
    role: false,
    availability: false,
    notifications: false,
    security: false,
    legal: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [contactSupportModal, setContactSupportModal] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/user/settings'],
    queryFn: () => apiRequest('/api/user/settings'),
  });

  const accountForm = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: settings?.phone || "",
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

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      location: settings?.location || "",
      publicProfile: settings?.publicProfile || false,
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: (data: AccountFormData) =>
      apiRequest('/api/user/account', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      toast({
        title: "Account updated",
        description: "Your account settings have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update account settings.",
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) =>
      apiRequest('/api/user/password', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
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

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleDeleteAccount = () => {
    // Implementation for account deletion
    toast({
      title: "Account deletion requested",
      description: "Your account deletion request has been submitted.",
    });
    setDeleteAccountModal(false);
  };

  const SettingsCard = ({ 
    id, 
    title, 
    icon, 
    children 
  }: { 
    id: string; 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
  }) => (
    <Card className="shadow-sm border-0 ring-1 ring-gray-200">
      <Collapsible open={openSections[id]} onOpenChange={() => toggleSection(id)}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-[#0a51be]">{icon}</div>
                <span>{title}</span>
              </div>
              {openSections[id] ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a51be] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="w-8 h-8 mr-3 text-[#0a51be]" />
            Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your account, profile, and preferences</p>
        </div>

        {/* Account Settings */}
        <SettingsCard
          id="account"
          title="Account Settings"
          icon={<User className="w-5 h-5" />}
        >
          <div className="space-y-6">
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
                          <Input 
                            placeholder="your@email.com" 
                            {...field}
                            className="bg-gray-50"
                            readOnly
                          />
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
                        <FormLabel>Phone Number</FormLabel>
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

            {/* Password Update */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
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
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
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

                  <Button
                    type="submit"
                    className="bg-[#0a51be] hover:bg-[#0a51be]/90"
                    disabled={updatePasswordMutation.isPending}
                  >
                    {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </Form>
            </div>

            <Separator />

            {/* Delete Account */}
            <div className="pt-4">
              <h3 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h3>
              <p className="text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <Dialog open={deleteAccountModal} onOpenChange={setDeleteAccountModal}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
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
          </div>
        </SettingsCard>

        {/* Profile Settings */}
        <SettingsCard
          id="profile"
          title="Profile Settings"
          icon={<User className="w-5 h-5" />}
        >
          <div className="space-y-6">
            {/* Profile Photo */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.profilePhoto} />
                  <AvatarFallback className="bg-[#0a51be] text-white text-xl">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="border-[#0a51be] text-[#0a51be] hover:bg-[#0a51be]/5">
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Profile Information */}
            <Form {...profileForm}>
              <form className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State, ZIP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="publicProfile"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Public Profile</FormLabel>
                        <p className="text-sm text-gray-500">Show my profile to event hosts</p>
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

                <Button className="bg-[#0a51be] hover:bg-[#0a51be]/90">
                  Save Profile Settings
                </Button>
              </form>
            </Form>
          </div>
        </SettingsCard>

        {/* Role Settings */}
        <SettingsCard
          id="role"
          title="Role Settings"
          icon={<UserCheck className="w-5 h-5" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Current Role</h3>
                <p className="text-gray-600">Your active role on ChefBounty</p>
              </div>
              <Badge className="bg-[#0a51be] text-white">
                {user?.role === 'chef' ? 'Chef' : 'Host'}
              </Badge>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Role switching and dual-role access management will be available in a future update.
              </p>
            </div>
          </div>
        </SettingsCard>

        {/* Availability (for Chefs) */}
        {user?.role === 'chef' && (
          <SettingsCard
            id="availability"
            title="Availability"
            icon={<Clock className="w-5 h-5" />}
          >
            <div className="space-y-6">
              {/* Weekly Availability */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Weekly Availability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{day}</span>
                      <Switch />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Time Zone */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Time Zone</h3>
                <Select>
                  <SelectTrigger className="w-full md:w-1/2">
                    <SelectValue placeholder="Select your time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eastern">Eastern Time (ET)</SelectItem>
                    <SelectItem value="central">Central Time (CT)</SelectItem>
                    <SelectItem value="mountain">Mountain Time (MT)</SelectItem>
                    <SelectItem value="pacific">Pacific Time (PT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Last-minute bookings */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Last-minute Bookings</h3>
                  <p className="text-gray-600">Accept bookings with less than 24 hours notice</p>
                </div>
                <Switch />
              </div>

              <Button className="bg-[#0a51be] hover:bg-[#0a51be]/90">
                Save Availability Settings
              </Button>
            </div>
          </SettingsCard>
        )}

        {/* Notification Preferences */}
        <SettingsCard
          id="notifications"
          title="Notification Preferences"
          icon={<Bell className="w-5 h-5" />}
        >
          <div className="space-y-6">
            {/* Email Notifications */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-[#0a51be]" />
                Email Notifications
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'New bid received', description: 'Get notified when someone bids on your event' },
                  { label: 'Event accepted', description: 'When your bid is accepted by a host' },
                  { label: 'Booking status updates', description: 'Changes to your bookings and events' },
                  { label: 'Marketing emails', description: 'Tips, updates, and promotional content' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <Switch defaultChecked={index < 3} />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* SMS Notifications */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-[#0a51be]" />
                SMS Notifications
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Urgent booking updates', description: 'Critical updates about your bookings' },
                  { label: 'Event reminders', description: '24-hour reminders for upcoming events' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <Switch />
                  </div>
                ))}
              </div>
            </div>

            <Button className="bg-[#0a51be] hover:bg-[#0a51be]/90">
              Save Notification Settings
            </Button>
          </div>
        </SettingsCard>

        {/* Security */}
        <SettingsCard
          id="security"
          title="Security"
          icon={<Shield className="w-5 h-5" />}
        >
          <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">2FA Status</p>
                    <p className="text-sm text-gray-600">Currently disabled</p>
                  </div>
                  <Button variant="outline" className="border-[#0a51be] text-[#0a51be] hover:bg-[#0a51be]/5">
                    <Lock className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Active Sessions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-500">Chrome on MacOS • Current location</p>
                      <p className="text-xs text-gray-400">Last active: Now</p>
                    </div>
                    <Badge variant="secondary">Current</Badge>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="mt-4">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out of All Devices
              </Button>
            </div>
          </div>
        </SettingsCard>

        {/* Legal & Support */}
        <SettingsCard
          id="legal"
          title="Legal & Support"
          icon={<HelpCircle className="w-5 h-5" />}
        >
          <div className="space-y-6">
            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Terms of Service', href: '#' },
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Refund Policy', href: '#' },
                  { label: 'Help Center', href: '#' }
                ].map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start"
                    asChild
                  >
                    <a href={link.href}>
                      <Globe className="w-4 h-4 mr-2" />
                      {link.label}
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Need help?</p>
                  <p className="text-sm text-gray-600">Contact our support team for assistance</p>
                </div>
                <Dialog open={contactSupportModal} onOpenChange={setContactSupportModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#0a51be] hover:bg-[#0a51be]/90">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contact Support</DialogTitle>
                      <DialogDescription>
                        Support contact form will be available soon. For immediate assistance, please email support@chefbounty.com
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button onClick={() => setContactSupportModal(false)}>
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </SettingsCard>
      </div>
    </DashboardLayout>
  );
}