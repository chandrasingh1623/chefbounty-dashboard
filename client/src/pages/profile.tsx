import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { useAuth } from "@/lib/auth";
import { authService } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { User, Camera, Star, DollarSign, MapPin } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
  hourlyRate: z.number().min(0, "Hourly rate must be 0 or greater").optional(),
  specialties: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    queryFn: async () => {
      const response = await fetch('/api/user/profile', {
        headers: authService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      hourlyRate: profile?.hourlyRate ? parseFloat(profile.hourlyRate) : undefined,
      specialties: profile?.specialties?.join(", ") || "",
    },
  });

  // Update form when profile data loads
  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        hourlyRate: profile.hourlyRate ? parseFloat(profile.hourlyRate) : undefined,
        specialties: profile.specialties?.join(", ") || "",
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const specialtiesArray = data.specialties
        ? data.specialties.split(",").map(s => s.trim()).filter(s => s.length > 0)
        : [];

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          ...data,
          specialties: specialtiesArray,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="My Profile" subtitle="Manage your chef profile and showcase your skills">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your chef profile and showcase your skills">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.profilePhoto} />
                  <AvatarFallback className="text-lg">
                    {profile?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{profile?.name || 'Chef'}</h2>
                <p className="text-gray-500 flex items-center mt-1">
                  <User className="w-4 h-4 mr-1" />
                  Professional Chef
                </p>
                
                <div className="flex items-center space-x-4 mt-3">
                  {profile?.rating && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{profile.rating}</span>
                    </div>
                  )}
                  
                  {profile?.hourlyRate && (
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium">${profile.hourlyRate}/hr</span>
                    </div>
                  )}
                  
                  {profile?.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-600">{profile.location}</span>
                    </div>
                  )}
                </div>

                {profile?.specialties && profile.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.specialties.map((specialty: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell potential hosts about your culinary background, experience, and cooking style..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="50.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialties"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialties</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Italian, French, Vegan, etc. (comma separated)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Profile Photo
                  </label>
                  <FileUpload
                    onFileSelect={setSelectedFile}
                    accept="image/*"
                    maxSize={5}
                    placeholder="Click to upload or drag and drop your profile photo"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Portfolio Section (Future Enhancement) */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500">Portfolio management coming soon!</p>
              <p className="text-sm text-gray-400 mt-1">
                Soon you'll be able to showcase your best dishes and cooking experiences.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}