import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Upload, User, ChefHat, Home } from "lucide-react";
import logoImage from "@assets/ChefBounty Lg (2)_1753288571802.png";

const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["host", "chef"], { required_error: "Please select a role" }),
  bio: z.string().min(20, "Bio must be at least 20 characters").optional(),
  location: z.string().min(2, "Location is required"),
  company: z.string().optional(),
  title: z.string().optional(),
  headline: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      email: "",
      role: undefined,
      bio: "",
      location: "",
      company: "",
      title: "",
      headline: "",
    },
  });

  // Fetch user profile with SSO data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLocation('/login');
          return;
        }

        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);
          
          // Prefill form with SSO data
          form.reset({
            name: data.user.fullName || data.user.name || `${data.user.firstName} ${data.user.lastName}`.trim() || "",
            email: data.user.email || "",
            role: data.user.role !== 'host' && data.user.role !== 'chef' ? undefined : data.user.role,
            bio: data.user.bio || "",
            location: data.user.location || "",
            company: data.user.company || "",
            title: data.user.title || "",
            headline: data.user.headline || "",
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role,
          bio: data.bio,
          location: data.location,
          company: data.company,
          title: data.title,
          headline: data.headline,
          // Map SSO fields to user fields
          fullName: data.name,
          firstName: data.name.split(' ')[0],
          lastName: data.name.split(' ').slice(1).join(' '),
        }),
      });

      if (response.ok) {
        toast({
          title: "Profile completed!",
          description: "Welcome to ChefBounty. Let's get started!",
        });
        
        // Redirect based on role
        setLocation(data.role === 'chef' ? '/dashboard/chef' : '/dashboard');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={logoImage} 
              alt="ChefBounty" 
              className="h-20 w-auto object-contain"
              style={{ maxHeight: '80px', width: 'auto' }}
            />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Help us personalize your ChefBounty experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar */}
              {userProfile?.avatarUrl && (
                <div className="flex justify-center mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Role Selection */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I want to...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="relative">
                          <RadioGroupItem value="host" id="host" className="peer sr-only" />
                          <Label
                            htmlFor="host"
                            className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 p-4 hover:bg-gray-50 peer-checked:border-primary peer-checked:bg-primary/5 cursor-pointer transition-all"
                          >
                            <Home className="h-8 w-8 mb-2 text-primary" />
                            <span className="font-medium">Hire a Chef</span>
                            <span className="text-sm text-gray-500">I'm looking for culinary services</span>
                          </Label>
                        </div>
                        <div className="relative">
                          <RadioGroupItem value="chef" id="chef" className="peer sr-only" />
                          <Label
                            htmlFor="chef"
                            className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 p-4 hover:bg-gray-50 peer-checked:border-primary peer-checked:bg-primary/5 cursor-pointer transition-all"
                          >
                            <ChefHat className="h-8 w-8 mb-2 text-primary" />
                            <span className="font-medium">Be a Chef</span>
                            <span className="text-sm text-gray-500">I provide culinary services</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Professional Info (prefilled from LinkedIn) */}
              {(userProfile?.headline || userProfile?.company || userProfile?.title) && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Professional Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {userProfile?.headline && (
                      <FormField
                        control={form.control}
                        name="headline"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Professional Headline</FormLabel>
                            <FormControl>
                              <Input placeholder="Executive Chef | Culinary Consultant" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Current workplace" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your current role" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About You (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a bit about yourself..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary/90"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? "Saving..." : "Complete Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}