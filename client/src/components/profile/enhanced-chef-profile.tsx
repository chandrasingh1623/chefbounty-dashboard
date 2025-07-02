import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  User, 
  MapPin, 
  Globe, 
  BookOpen, 
  Languages, 
  UtensilsCrossed,
  Award,
  Camera,
  Settings,
  DollarSign,
  Edit,
  Eye,
  EyeOff,
  Plus,
  X,
  Upload,
  Star,
  Clock,
  Users,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useProfileCompletion } from "@/hooks/use-profile-completion";

interface ChefProfile {
  id: number;
  name: string;
  profilePhoto?: string;
  bio?: string;
  location?: string;
  willingToTravel: boolean;
  maxTravelDistance?: number;
  customTravelAreas: string[];
  experience?: number;
  languagesSpoken: string[];
  specialties: string[];
  signatureDishes: string[];
  dietaryAccommodations: string[];
  formalTraining?: string;
  foodSafetyCertifications: string[];
  workHistory?: string;
  portfolioImages: string[];
  clientTestimonials: string[];
  videoUrl?: string;
  availableServices: string[];
  lastMinuteBookings: boolean;
  maxPartySize?: number;
  bringsOwnEquipment: boolean;
  equipmentList: string[];
  canProvideStaff: boolean;
  hourlyRate?: number;
  rateUnit: string;
  customPackages: string[];
  travelFees?: string;
  equipmentFees?: string;
  profileLive: boolean;
}

const cuisineOptions = [
  "Italian", "French", "American", "Mexican", "Japanese", "Chinese", "Indian", 
  "Thai", "Mediterranean", "Vegan", "Vegetarian", "BBQ", "Seafood", "Steakhouse", 
  "Farm-to-Table", "Fusion", "Latin", "Caribbean", "Middle Eastern", "Korean"
];

const serviceOptions = [
  "Private Dinners", "Meal Prep", "Catering", "Cooking Classes", "Wine Pairings",
  "Yacht Events", "Corporate Events", "Wedding Catering", "Holiday Parties",
  "Birthday Parties", "Brunch Service", "Buffet Service", "Tasting Menus"
];

const dietaryOptions = [
  "Gluten-Free", "Dairy-Free", "Vegan", "Vegetarian", "Keto", "Paleo", 
  "Halal", "Kosher", "Nut-Free", "Shellfish-Free", "Low-Sodium", "Diabetic-Friendly"
];

const languageOptions = [
  "English", "Spanish", "French", "Italian", "German", "Portuguese", "Mandarin",
  "Japanese", "Korean", "Arabic", "Hindi", "Russian", "Dutch", "Swedish"
];

export function EnhancedChefProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use shared profile completion hook at the top level (Rules of Hooks)
  const { profileCompletion, isLoading: profileCompletionLoading } = useProfileCompletion();
  const [isEditing, setIsEditing] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [formData, setFormData] = useState<Partial<ChefProfile>>({});

  // Fetch chef profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/chef-profile', user?.id],
    enabled: !!user?.id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ChefProfile>) => {
      return await apiRequest('PUT', `/api/chef-profile/${user?.id}`, data).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chef-profile', user?.id] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your chef profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Launch profile mutation
  const launchProfileMutation = useMutation({
    mutationFn: async (isLive: boolean) => {
      return await apiRequest('PUT', `/api/chef-profile/${user?.id}/launch`, { profileLive: isLive }).then(res => res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chef-profile', user?.id] });
      setShowLaunchModal(false);
      toast({
        title: data.profileLive ? "Profile Launched!" : "Profile Unpublished",
        description: data.profileLive 
          ? "Your profile is now live and visible to hosts!"
          : "Your profile has been unpublished and is no longer visible.",
      });
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleLaunch = () => {
    if (profile?.profileLive) {
      launchProfileMutation.mutate(false);
    } else {
      setShowLaunchModal(true);
    }
  };

  const confirmLaunch = () => {
    launchProfileMutation.mutate(true);
  };

  const addToArray = (field: keyof ChefProfile, value: string) => {
    if (!value.trim()) return;
    const currentArray = formData[field] as string[] || [];
    setFormData({
      ...formData,
      [field]: [...currentArray, value.trim()]
    });
  };

  const removeFromArray = (field: keyof ChefProfile, index: number) => {
    const currentArray = formData[field] as string[] || [];
    setFormData({
      ...formData,
      [field]: currentArray.filter((_, i) => i !== index)
    });
  };

  const handleProfilePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64 for now (in production, you'd upload to a storage service)
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setFormData({
        ...formData,
        profilePhoto: base64String
      });
      
      toast({
        title: "Photo uploaded",
        description: "Profile photo has been updated. Remember to save your changes.",
      });
    };
    reader.readAsDataURL(file);
  };

  if (isLoading || profileCompletionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Completion Section */}
      {!isEditing && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-blue-900">Profile Completion</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {profileCompletion.percentage}% Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">
                  {profileCompletion.completedCount} of {profileCompletion.totalFields} fields completed
                </span>
                <span className="text-blue-600 font-medium">
                  {profileCompletion.percentage}%
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${profileCompletion.percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Missing Fields Checklist */}
            {profileCompletion.missingFields.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-blue-900">Complete these fields to boost your visibility:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {profileCompletion.missingFields.map((field, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-4 h-4 border-2 border-blue-300 rounded flex-shrink-0"></div>
                      <span className="text-blue-700">{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Fields */}
            {profileCompletion.completedCount > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-green-900">Completed sections:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { key: 'name', label: 'Full Name', completed: profile?.name?.length > 0 },
                    { key: 'bio', label: 'Bio/About Me', completed: profile?.bio?.length > 10 },
                    { key: 'specialties', label: 'Cuisine Type', completed: profile?.specialties?.length > 0 },
                    { key: 'signatureDishes', label: 'Signature Dishes', completed: profile?.signatureDishes?.length > 0 },
                    { key: 'portfolioImages', label: 'Portfolio Photos', completed: profile?.portfolioImages?.length > 0 },
                    { key: 'hourlyRate', label: 'Rates', completed: profile?.hourlyRate > 0 },
                    { key: 'foodSafetyCertifications', label: 'Certifications', completed: profile?.foodSafetyCertifications?.length > 0 },
                    { key: 'location', label: 'Location', completed: profile?.location?.length > 0 },
                    { key: 'experience', label: 'Experience', completed: profile?.experience > 0 },
                    { key: 'languagesSpoken', label: 'Languages Spoken', completed: profile?.languagesSpoken?.length > 0 },
                  ].filter(field => field.completed).map((field, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-4 h-4 bg-green-500 rounded flex-shrink-0 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-green-700">{field.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-medium">💡 Pro Tip:</span> Finishing your profile helps boost your visibility and increases your chances of getting booked.
              </p>
            </div>

            {profileCompletion.missingFields.length > 0 && (
              <Button onClick={() => setIsEditing(true)} className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Complete Your Profile
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  {(isEditing ? formData.profilePhoto : profile?.profilePhoto) ? (
                    <img 
                      src={isEditing ? formData.profilePhoto || profile?.profilePhoto : profile?.profilePhoto} 
                      alt={profile?.name || 'Profile'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                    <Camera className="w-3 h-3 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePhotoUpload}
                    />
                  </label>
                )}
                {profile?.profileLive && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile?.name}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{profile?.location || "Location not set"}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant={profile?.profileLive ? "default" : "secondary"}>
                {profile?.profileLive ? "Live" : "Draft"}
              </Badge>
              
              {isEditing ? (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={updateProfileMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    onClick={handleLaunch}
                    disabled={launchProfileMutation.isPending}
                    variant={profile?.profileLive ? "destructive" : "default"}
                  >
                    {profile?.profileLive ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Launch Profile
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Basic Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="travel">Willing to Travel</Label>
                  <Switch
                    id="travel"
                    checked={formData.willingToTravel || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, willingToTravel: checked })}
                  />
                </div>
                {formData.willingToTravel && (
                  <div>
                    <Label htmlFor="maxDistance">Max Travel Distance (miles)</Label>
                    <Input
                      id="maxDistance"
                      type="number"
                      value={formData.maxTravelDistance || ''}
                      onChange={(e) => setFormData({ ...formData, maxTravelDistance: parseInt(e.target.value) })}
                      placeholder="50"
                    />
                  </div>
                )}
                <div>
                  <Label>Languages Spoken</Label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(formData.languagesSpoken || []).map((lang, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {lang}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeFromArray('languagesSpoken', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Select onValueChange={(value) => addToArray('languagesSpoken', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((lang) => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{profile?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{profile?.location || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Travel</p>
                  <p className="font-medium">
                    {profile?.willingToTravel ? (
                      <>Yes {profile?.maxTravelDistance && `(${profile.maxTravelDistance} miles)`}</>
                    ) : (
                      "Local only"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {(profile?.languagesSpoken || []).map((lang, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{lang}</Badge>
                    ))}
                    {(!profile?.languagesSpoken || profile.languagesSpoken.length === 0) && (
                      <span className="text-gray-400">None specified</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Culinary Specialties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UtensilsCrossed className="w-5 h-5" />
              <span>Culinary Specialties</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label>Primary Cuisines</Label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(formData.specialties || []).map((cuisine, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {cuisine}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeFromArray('specialties', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Select onValueChange={(value) => addToArray('specialties', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add a cuisine" />
                      </SelectTrigger>
                      <SelectContent>
                        {cuisineOptions.map((cuisine) => (
                          <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Signature Dishes</Label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(formData.signatureDishes || []).map((dish, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {dish}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeFromArray('signatureDishes', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add signature dish"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addToArray('signatureDishes', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={(e) => {
                          const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                          if (input?.value) {
                            addToArray('signatureDishes', input.value);
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Dietary Accommodations</Label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(formData.dietaryAccommodations || []).map((diet, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {diet}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeFromArray('dietaryAccommodations', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Select onValueChange={(value) => addToArray('dietaryAccommodations', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add dietary accommodation" />
                      </SelectTrigger>
                      <SelectContent>
                        {dietaryOptions.map((diet) => (
                          <SelectItem key={diet} value={diet}>{diet}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-500">Primary Cuisines</p>
                  <div className="flex flex-wrap gap-1">
                    {(profile?.specialties || []).map((cuisine, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{cuisine}</Badge>
                    ))}
                    {(!profile?.specialties || profile.specialties.length === 0) && (
                      <span className="text-gray-400">None specified</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Signature Dishes</p>
                  <div className="flex flex-wrap gap-1">
                    {(profile?.signatureDishes || []).map((dish, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{dish}</Badge>
                    ))}
                    {(!profile?.signatureDishes || profile.signatureDishes.length === 0) && (
                      <span className="text-gray-400">None specified</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dietary Accommodations</p>
                  <div className="flex flex-wrap gap-1">
                    {(profile?.dietaryAccommodations || []).map((diet, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{diet}</Badge>
                    ))}
                    {(!profile?.dietaryAccommodations || profile.dietaryAccommodations.length === 0) && (
                      <span className="text-gray-400">None specified</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* About Me / Bio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>About Me</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="bio">Personal Introduction</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell hosts about yourself, your cooking philosophy, and what makes you unique..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience || ''}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                    placeholder="5"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-500">Bio</p>
                  <p className="font-medium">{profile?.bio || "No bio provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">
                    {profile?.experience ? `${profile.experience} years` : "Not specified"}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Credentials & Background */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Credentials & Background</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="training">Formal Training</Label>
                  <Input
                    id="training"
                    value={formData.formalTraining || ''}
                    onChange={(e) => setFormData({ ...formData, formalTraining: e.target.value })}
                    placeholder="Culinary school, certifications, etc."
                  />
                </div>
                <div>
                  <Label>Food Safety Certifications</Label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(formData.foodSafetyCertifications || []).map((cert, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {cert}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeFromArray('foodSafetyCertifications', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add certification (e.g., ServSafe)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addToArray('foodSafetyCertifications', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={(e) => {
                          const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                          if (input?.value) {
                            addToArray('foodSafetyCertifications', input.value);
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="workHistory">Work History</Label>
                  <Textarea
                    id="workHistory"
                    value={formData.workHistory || ''}
                    onChange={(e) => setFormData({ ...formData, workHistory: e.target.value })}
                    placeholder="Brief description of past kitchens, events, and experience..."
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-500">Formal Training</p>
                  <p className="font-medium">{profile?.formalTraining || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Food Safety Certifications</p>
                  <div className="flex flex-wrap gap-1">
                    {(profile?.foodSafetyCertifications || []).map((cert, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{cert}</Badge>
                    ))}
                    {(!profile?.foodSafetyCertifications || profile.foodSafetyCertifications.length === 0) && (
                      <span className="text-gray-400">None specified</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Work History</p>
                  <p className="font-medium">{profile?.workHistory || "Not specified"}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Service Capabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Service Capabilities</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label>Available Services</Label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(formData.availableServices || []).map((service, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {service}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeFromArray('availableServices', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Select onValueChange={(value) => addToArray('availableServices', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((service) => (
                          <SelectItem key={service} value={service}>{service}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="lastMinute">Available for Last-Minute Bookings</Label>
                  <Switch
                    id="lastMinute"
                    checked={formData.lastMinuteBookings || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, lastMinuteBookings: checked })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxParty">Max Party Size</Label>
                  <Input
                    id="maxParty"
                    type="number"
                    value={formData.maxPartySize || ''}
                    onChange={(e) => setFormData({ ...formData, maxPartySize: parseInt(e.target.value) })}
                    placeholder="12"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="equipment">Brings Own Equipment</Label>
                  <Switch
                    id="equipment"
                    checked={formData.bringsOwnEquipment || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, bringsOwnEquipment: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="staff">Can Provide Additional Staff</Label>
                  <Switch
                    id="staff"
                    checked={formData.canProvideStaff || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, canProvideStaff: checked })}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-500">Available Services</p>
                  <div className="flex flex-wrap gap-1">
                    {(profile?.availableServices || []).map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{service}</Badge>
                    ))}
                    {(!profile?.availableServices || profile.availableServices.length === 0) && (
                      <span className="text-gray-400">None specified</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last-Minute Bookings</p>
                  <p className="font-medium">{profile?.lastMinuteBookings ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Max Party Size</p>
                  <p className="font-medium">{profile?.maxPartySize || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Equipment</p>
                  <p className="font-medium">{profile?.bringsOwnEquipment ? "Brings own equipment" : "Uses client equipment"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Additional Staff</p>
                  <p className="font-medium">{profile?.canProvideStaff ? "Can provide staff" : "Solo chef"}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Rates & Packages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Rates & Packages</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="rate">Base Rate</Label>
                    <Input
                      id="rate"
                      type="number"
                      value={formData.hourlyRate || ''}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rateUnit">Rate Unit</Label>
                    <Select
                      value={formData.rateUnit || 'hour'}
                      onValueChange={(value) => setFormData({ ...formData, rateUnit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hour">Per Hour</SelectItem>
                        <SelectItem value="guest">Per Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="travelFees">Travel/Equipment Fees</Label>
                  <Input
                    id="travelFees"
                    value={formData.travelFees || ''}
                    onChange={(e) => setFormData({ ...formData, travelFees: e.target.value })}
                    placeholder="Travel fee: $50 within 25 miles"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-500">Base Rate</p>
                  <p className="font-medium">
                    {profile?.hourlyRate ? `$${profile.hourlyRate} per ${profile.rateUnit}` : "Rate not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Additional Fees</p>
                  <p className="font-medium">{profile?.travelFees || "No additional fees"}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Launch Profile Modal */}
      <Dialog open={showLaunchModal} onOpenChange={setShowLaunchModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🟢 Launch Your Profile?</DialogTitle>
            <DialogDescription>
              You're about to make your profile public on ChefBounty. This means:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Your profile will appear in the Browse Chefs section</li>
              <li>• Hosts will be able to view your experience, availability, and request bookings</li>
              <li>• You can start receiving invites to events right away</li>
            </ul>
            <p className="text-sm font-medium text-gray-900">
              Are you sure you're ready to go live?
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowLaunchModal(false)}>
                Not Yet
              </Button>
              <Button onClick={confirmLaunch} disabled={launchProfileMutation.isPending}>
                {launchProfileMutation.isPending ? "Launching..." : "Yes, Launch My Profile"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}