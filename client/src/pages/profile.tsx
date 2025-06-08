import React, { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Camera, 
  Star, 
  DollarSign, 
  MapPin, 
  Upload, 
  Plus, 
  Trash2, 
  Calendar,
  Phone,
  Mail,
  ChefHat,
  Clock
} from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
  hourlyRate: z.number().min(0, "Hourly rate must be 0 or greater").optional(),
  specialties: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  preferredContact: z.enum(["email", "phone"]).optional(),
  yearsExperience: z.number().min(0).optional(),
  chefType: z.string().optional(),
  availableLastMinute: z.boolean().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Menu {
  id: string;
  title: string;
  description: string;
  dishes: string[];
}

interface PortfolioImage {
  id: string;
  url: string;
  caption: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [newMenu, setNewMenu] = useState<Menu>({
    id: "",
    title: "",
    description: "",
    dishes: [""]
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    queryFn: () => apiRequest('/api/user/profile'),
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      hourlyRate: profile?.hourlyRate ? parseFloat(profile.hourlyRate) : undefined,
      specialties: profile?.specialties?.join(", ") || "",
      phone: profile?.phone || "",
      email: profile?.email || "",
      preferredContact: profile?.preferredContact || "email",
      yearsExperience: profile?.yearsExperience || undefined,
      chefType: profile?.chefType || "",
      availableLastMinute: profile?.availableLastMinute || false,
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
        phone: profile.phone || "",
        email: profile.email || "",
        preferredContact: profile.preferredContact || "email",
        yearsExperience: profile.yearsExperience || undefined,
        chefType: profile.chefType || "",
        availableLastMinute: profile.availableLastMinute || false,
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const specialtiesArray = data.specialties
        ? data.specialties.split(",").map(s => s.trim()).filter(s => s.length > 0)
        : [];

      return apiRequest('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({
          ...data,
          specialties: specialtiesArray,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Here you would typically upload to Supabase Storage
      toast({
        title: "File selected",
        description: "Profile photo selected. Click Save Changes to update.",
      });
    }
  };

  const addMenu = () => {
    if (newMenu.title && newMenu.description) {
      setMenus([...menus, { ...newMenu, id: Date.now().toString() }]);
      setNewMenu({ id: "", title: "", description: "", dishes: [""] });
      toast({
        title: "Menu added",
        description: "Your sample menu has been added.",
      });
    }
  };

  const removeMenu = (id: string) => {
    setMenus(menus.filter(menu => menu.id !== id));
  };

  const addDishToNewMenu = () => {
    setNewMenu({
      ...newMenu,
      dishes: [...newMenu.dishes, ""]
    });
  };

  const updateDishInNewMenu = (index: number, value: string) => {
    const updatedDishes = [...newMenu.dishes];
    updatedDishes[index] = value;
    setNewMenu({ ...newMenu, dishes: updatedDishes });
  };

  const removeDishFromNewMenu = (index: number) => {
    const updatedDishes = newMenu.dishes.filter((_, i) => i !== index);
    setNewMenu({ ...newMenu, dishes: updatedDishes });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a51be] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Chef Profile</h1>
          <p className="text-gray-600 mt-2">Build and customize your professional profile to attract event hosts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Header & Contact */}
          <div className="space-y-6">
            {/* Profile Header Card */}
            <Card className="overflow-hidden shadow-sm border-0 ring-1 ring-gray-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarImage src={profile?.profilePhoto} />
                      <AvatarFallback className="bg-[#0a51be] text-white text-2xl">
                        {profile?.name?.charAt(0) || <User className="w-8 h-8" />}
                      </AvatarFallback>
                    </Avatar>
                    <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-[#0a51be] rounded-full p-2 cursor-pointer hover:bg-[#0a51be]/90 transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold text-gray-900">{profile?.name || "Your Name"}</h3>
                    {profile?.location && (
                      <p className="text-gray-600 flex items-center justify-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {profile.location}
                      </p>
                    )}
                    {profile?.hourlyRate && (
                      <p className="text-[#0a51be] font-semibold flex items-center justify-center mt-1">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ${profile.hourlyRate}/hour
                      </p>
                    )}
                    {profile?.rating && (
                      <div className="flex items-center justify-center mt-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-gray-600">{profile.rating} rating</span>
                      </div>
                    )}
                  </div>

                  {/* Specialties */}
                  {profile?.specialties && profile.specialties.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {profile.specialties.map((specialty: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-[#0a51be]/10 text-[#0a51be] border-[#0a51be]/20">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Preferences */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-[#0a51be]" />
                  Contact Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{profile?.email || "No email set"}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{profile.phone}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available for last-minute bookings</span>
                  <Switch checked={profile?.availableLastMinute || false} disabled />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChefHat className="w-5 h-5 mr-2 text-[#0a51be]" />
                  Chef Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile?.yearsExperience && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Experience</span>
                    <span className="font-medium">{profile.yearsExperience} years</span>
                  </div>
                )}
                {profile?.chefType && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Chef Type</span>
                    <span className="font-medium">{profile.chefType}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Events</span>
                  <span className="font-medium">0</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
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
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., New York, NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly Rate ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="e.g., 75"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yearsExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="e.g., 5"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="chefType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chef Type</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Private Chef, Executive Chef" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., (555) 123-4567" {...field} />
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
                          <FormLabel>About Me</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell hosts what makes your cooking special. Share your culinary philosophy, favorite ingredients, or signature dishes..."
                              className="min-h-[120px]"
                              {...field} 
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
                          <FormLabel>Cuisine Specialties</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Italian, Vegan, Sushi, BBQ, Mediterranean (comma separated)"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="availableLastMinute"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch 
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Available for last-minute bookings</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#0a51be] hover:bg-[#0a51be]/90"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Portfolio</span>
                  <Button size="sm" variant="outline" className="border-[#0a51be] text-[#0a51be] hover:bg-[#0a51be]/5">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {portfolioImages.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <Camera className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Upload photos of your dishes and events</p>
                      <p className="text-sm">Show hosts your culinary skills</p>
                    </div>
                  ) : (
                    portfolioImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img 
                          src={image.url} 
                          alt={image.caption}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sample Menus */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader>
                <CardTitle>Sample Menus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Existing Menus */}
                {menus.map((menu) => (
                  <div key={menu.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{menu.title}</h4>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeMenu(menu.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{menu.description}</p>
                    <div className="space-y-1">
                      {menu.dishes.map((dish, index) => (
                        <div key={index} className="text-sm text-gray-700">• {dish}</div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Add New Menu */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Add New Menu</h4>
                  <div className="space-y-4">
                    <Input
                      placeholder="Menu title (e.g., 'Italian Wedding Menu')"
                      value={newMenu.title}
                      onChange={(e) => setNewMenu({ ...newMenu, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Menu description"
                      value={newMenu.description}
                      onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Dishes</label>
                      {newMenu.dishes.map((dish, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder={`Dish ${index + 1}`}
                            value={dish}
                            onChange={(e) => updateDishInNewMenu(index, e.target.value)}
                          />
                          {newMenu.dishes.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeDishFromNewMenu(index)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addDishToNewMenu}
                        className="border-[#0a51be] text-[#0a51be] hover:bg-[#0a51be]/5"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Dish
                      </Button>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={addMenu}
                        className="bg-[#0a51be] hover:bg-[#0a51be]/90"
                        disabled={!newMenu.title || !newMenu.description}
                      >
                        Add Menu
                      </Button>
                      <Button
                        variant="outline"
                        className="border-[#0a51be] text-[#0a51be] hover:bg-[#0a51be]/5"
                      >
                        Generate with AI
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-[#0a51be]" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Calendar integration coming soon</p>
                  <p className="text-sm">Set your available days and times</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-[#0a51be] text-[#0a51be] hover:bg-[#0a51be]/5"
                  >
                    Set Availability
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}