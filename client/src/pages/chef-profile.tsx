import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, DollarSign, Award, MessageCircle, Calendar, Clock, ChefHat } from "lucide-react";
import { Link } from "wouter";

interface Chef {
  id: number;
  name: string;
  email: string;
  location?: string;
  bio?: string;
  specialties?: string[];
  experience?: number;
  hourlyRate?: number;
  rating?: number;
  reviewCount?: number;
  profilePhoto?: string;
  featured?: boolean;
  availableNow?: boolean;
}

export function ChefProfile() {
  const params = useParams();
  const chefId = params.id;

  const { data: chef, isLoading, error } = useQuery({
    queryKey: ['/api/chefs', chefId],
    queryFn: async () => {
      const response = await fetch(`/api/chefs/${chefId}`);
      if (!response.ok) throw new Error('Failed to fetch chef');
      return response.json();
    },
    enabled: !!chefId
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !chef) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chef not found</h3>
          <p className="text-gray-600 mb-4">
            The chef profile you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/dashboard/browse-chefs">
            <Button variant="outline">Back to Browse Chefs</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/browse-chefs">
          <Button variant="ghost" className="mb-4">
            ← Back to Browse Chefs
          </Button>
        </Link>
      </div>

      {/* Chef Profile Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={chef.profilePhoto} alt={chef.name} />
                <AvatarFallback className="text-2xl">
                  {chef.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              {chef.availableNow && (
                <Badge variant="outline" className="text-green-600 border-green-600 mb-2">
                  Available Now
                </Badge>
              )}
              
              {chef.featured && (
                <Badge variant="default" className="bg-[#0a51be] hover:bg-[#0a51be]/90">
                  <Award className="w-3 h-3 mr-1" />
                  Featured Chef
                </Badge>
              )}
            </div>

            {/* Chef Details */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{chef.name}</h1>
                  
                  {chef.location && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      {chef.location}
                    </div>
                  )}

                  {chef.rating && (
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="ml-1 text-lg font-semibold">{chef.rating}</span>
                      </div>
                      {chef.reviewCount && (
                        <span className="text-gray-600 ml-2">
                          ({chef.reviewCount} review{chef.reviewCount !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Pricing */}
                {chef.hourlyRate && (
                  <div className="text-right">
                    <div className="flex items-center text-2xl font-bold text-gray-900">
                      <DollarSign className="w-6 h-6" />
                      {chef.hourlyRate}/hour
                    </div>
                    <p className="text-sm text-gray-600">Starting rate</p>
                  </div>
                )}
              </div>

              {/* Experience and Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {chef.experience && (
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start">
                      <Clock className="w-5 h-5 text-gray-500 mr-2" />
                      <span className="text-lg font-semibold">{chef.experience}+ years</span>
                    </div>
                    <p className="text-sm text-gray-600">Experience</p>
                  </div>
                )}
                
                {chef.specialties && chef.specialties.length > 0 && (
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start">
                      <ChefHat className="w-5 h-5 text-gray-500 mr-2" />
                      <span className="text-lg font-semibold">{chef.specialties.length}</span>
                    </div>
                    <p className="text-sm text-gray-600">Specialties</p>
                  </div>
                )}

                {chef.reviewCount && (
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start">
                      <Star className="w-5 h-5 text-gray-500 mr-2" />
                      <span className="text-lg font-semibold">{chef.reviewCount}</span>
                    </div>
                    <p className="text-sm text-gray-600">Reviews</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 bg-primary hover:bg-primary/90">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Check Availability
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* About Section */}
        <div className="lg:col-span-2 space-y-6">
          {chef.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{chef.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Specialties */}
          {chef.specialties && chef.specialties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cuisine Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {chef.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-sm">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Portfolio/Gallery Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>Sample dishes and previous work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <ChefHat className="w-8 h-8 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Response time</span>
                <span className="font-medium">Within 2 hours</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">Repeat hire rate</span>
                <span className="font-medium">85%</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">On-time delivery</span>
                <span className="font-medium">98%</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className={`w-4 h-4 ${
                            j < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">5.0</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    "Excellent chef with amazing attention to detail..."
                  </p>
                  <p className="text-xs text-gray-500">- Sarah M., 2 weeks ago</p>
                  {i < 2 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}