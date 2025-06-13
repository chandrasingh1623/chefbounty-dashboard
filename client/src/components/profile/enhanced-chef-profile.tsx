import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvailabilityCalendar } from "@/components/calendar/availability-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  MapPin, 
  DollarSign, 
  Star, 
  Calendar,
  Award,
  Camera,
  Plus,
  Edit,
  Save,
  X
} from "lucide-react";

export function EnhancedChefProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    hourlyRate: user?.hourlyRate || "",
    specialties: user?.specialties || [],
  });
  const [newSpecialty, setNewSpecialty] = useState("");

  const handleSave = () => {
    // In real implementation, this would call the API
    setIsEditing(false);
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !profileData.specialties.includes(newSpecialty.trim())) {
      setProfileData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user?.profilePhoto} />
                  <AvatarFallback className="text-2xl">
                    {user?.name?.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        rows={3}
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell potential clients about your culinary background and expertise..."
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                    <p className="text-gray-600 mt-1">{profileData.bio || "No bio added yet"}</p>
                    
                    <div className="flex items-center gap-4 mt-4">
                      {profileData.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          {profileData.location}
                        </div>
                      )}
                      
                      {user?.rating && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {user.rating} ({user.reviewCount} reviews)
                        </div>
                      )}
                      
                      {profileData.hourlyRate && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <DollarSign className="w-4 h-4" />
                          ${profileData.hourlyRate}/hour
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Profile Details</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Profile Details */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Your professional details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, State"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={profileData.hourlyRate}
                        onChange={(e) => setProfileData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-sm">{user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Location</Label>
                      <p className="text-sm">{profileData.location || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Hourly Rate</Label>
                      <p className="text-sm">${profileData.hourlyRate || "Not set"}/hour</p>
                    </div>
                    {user?.experience && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Experience</Label>
                        <p className="text-sm">{user.experience} years</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card>
              <CardHeader>
                <CardTitle>Culinary Specialties</CardTitle>
                <CardDescription>
                  Your areas of expertise and signature dishes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {profileData.specialties.map((specialty) => (
                      <Badge 
                        key={specialty} 
                        variant="secondary" 
                        className="text-sm px-3 py-1"
                      >
                        {specialty}
                        {isEditing && (
                          <button
                            onClick={() => removeSpecialty(specialty)}
                            className="ml-2 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a specialty..."
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                      />
                      <Button onClick={addSpecialty} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  {profileData.specialties.length === 0 && !isEditing && (
                    <p className="text-gray-500 text-sm">No specialties added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Professional Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{user?.reviewCount || 0}</div>
                  <div className="text-sm text-gray-500">Total Reviews</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{user?.rating || "0.0"}</div>
                  <div className="text-sm text-gray-500">Average Rating</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">Completed Events</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{user?.experience || 0}</div>
                  <div className="text-sm text-gray-500">Years Experience</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Calendar */}
        <TabsContent value="availability" className="space-y-6">
          <AvailabilityCalendar chefId={user?.id || 0} />
        </TabsContent>

        {/* Portfolio */}
        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio & Gallery</CardTitle>
              <CardDescription>
                Showcase your culinary creations and past events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Portfolio Coming Soon
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Upload photos of your dishes, showcase your events, and build your culinary portfolio.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Reviews</CardTitle>
              <CardDescription>
                Feedback from your previous events and clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Reviews Yet
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Complete your first event to start receiving reviews from clients.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}