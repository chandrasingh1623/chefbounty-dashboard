import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, MapPin, DollarSign, Star, Filter, SlidersHorizontal, Award, Eye, X, User, Globe, Clock, Users, UtensilsCrossed, MessageCircle, Utensils, Heart, ChefHat } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ContactChefModal } from "@/components/dashboard/contact-chef-modal";

interface Chef {
  id: number;
  name: string;
  email: string;
  location?: string;
  bio?: string;
  specialties?: string[];
  signatureDishes?: string[];
  dietaryAccommodations?: string[];
  experience?: number;
  hourlyRate?: number;
  rating?: number;
  reviewCount?: number;
  profilePhoto?: string;
  featured?: boolean;
  availableNow?: boolean;
  languagesSpoken?: string[];
  formalTraining?: string;
  foodSafetyCertifications?: string[];
  workHistory?: string;
  availableServices?: string[];
  maxPartySize?: number;
  bringsOwnEquipment?: boolean;
  equipmentList?: string[];
  canProvideStaff?: boolean;
  willingToTravel?: boolean;
  maxTravelDistance?: number;
  customTravelAreas?: string[];
  travelFees?: string;
  equipmentFees?: string;
  portfolioImages?: string[];
  rateUnit?: string;
  customPackages?: string[];
  lastMinuteBookings?: boolean;
  clientTestimonials?: string[];
  videoUrl?: string;
}

import { DashboardLayout } from "@/components/dashboard/layout";

export default function BrowseChefs() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [budgetRange, setBudgetRange] = useState([25, 200]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [availableNowOnly, setAvailableNowOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedChef, setSelectedChef] = useState<Chef | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [contactChef, setContactChef] = useState<Chef | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const cuisineTypes = [
    "Italian", "French", "Asian", "Mexican", "Mediterranean", 
    "Indian", "Japanese", "American", "Vegetarian", "Vegan"
  ];

  // Build query string for dynamic filtering
  const queryString = (() => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (sortBy) params.append('sort', sortBy);
    if (locationFilter) params.append('location', locationFilter);
    if (availableNowOnly) params.append('available', 'true');
    if (selectedCuisines.length > 0) params.append('cuisines', selectedCuisines.join(','));
    params.append('minRate', budgetRange[0].toString());
    params.append('maxRate', budgetRange[1].toString());
    return params.toString();
  })();

  const { data: chefs = [], isLoading } = useQuery({
    queryKey: ['/api/chefs', queryString],
    queryFn: async () => {
      const url = `/api/chefs${queryString ? `?${queryString}` : ''}`;
      const token = localStorage.getItem('chefbounty_token');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Failed to fetch chefs:', response.status, response.statusText);
        return [];
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setBudgetRange([25, 200]);
    setSelectedCuisines([]);
    setLocationFilter("");
    setAvailableNowOnly(false);
  };

  const openProfileModal = (chef: Chef) => {
    setSelectedChef(chef);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setSelectedChef(null);
    setIsProfileModalOpen(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout 
        title="Browse Chefs" 
        subtitle="Discover talented chefs for your events and connect with culinary professionals"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Browse Chefs" 
      subtitle="Discover talented chefs for your events and connect with culinary professionals"
    >
      <div className="space-y-6">

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, cuisine, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleContent className="mt-6">
              <Separator className="mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Budget Range */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Budget Range ($/hour)
                  </label>
                  <div className="px-3">
                    <Slider
                      value={budgetRange}
                      onValueChange={setBudgetRange}
                      max={500}
                      min={25}
                      step={25}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>${budgetRange[0]}</span>
                      <span>${budgetRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Location Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <Input
                    placeholder="City, State, or ZIP"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>

                {/* Cuisine Types */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Cuisine Types</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {cuisineTypes.map((cuisine) => (
                      <div key={cuisine} className="flex items-center space-x-2">
                        <Checkbox
                          id={cuisine}
                          checked={selectedCuisines.includes(cuisine)}
                          onCheckedChange={() => toggleCuisine(cuisine)}
                        />
                        <label
                          htmlFor={cuisine}
                          className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {cuisine}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Quick Filters</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="available-now"
                        checked={availableNowOnly}
                        onCheckedChange={(checked) => setAvailableNowOnly(checked as boolean)}
                      />
                      <label htmlFor="available-now" className="text-sm">
                        Available Now
                      </label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {chefs.length} chef{chefs.length !== 1 ? 's' : ''} found
        </p>
        {selectedCuisines.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filtered by:</span>
            {selectedCuisines.map((cuisine) => (
              <Badge
                key={cuisine}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleCuisine(cuisine)}
              >
                {cuisine} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Chef Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {chefs.map((chef: Chef) => (
          <Card key={chef.id} className="rounded-2xl shadow-lg bg-white hover:scale-[1.02] transition-transform duration-300 ease-in-out overflow-hidden">
            <CardContent className="p-6">
              {/* Header with Avatar and Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={chef.profilePhoto} alt={chef.name} />
                    <AvatarFallback>{chef.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{chef.name}</h3>
                    {chef.location && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {chef.location}
                      </div>
                    )}
                  </div>
                </div>
                {chef.featured && (
                  <Badge variant="default" className="bg-[#0a51be] hover:bg-[#0a51be]/90">
                    <Award className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Rating and Reviews */}
              {chef.rating && (
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">{parseFloat(chef.rating.toString()).toFixed(1)}</span>
                  </div>
                  {chef.reviewCount && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({chef.reviewCount} review{chef.reviewCount !== 1 ? 's' : ''})
                    </span>
                  )}
                  {chef.availableNow && (
                    <Badge variant="outline" className="ml-auto text-green-600 border-green-600">
                      Available Now
                    </Badge>
                  )}
                </div>
              )}

              {/* Bio */}
              {chef.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {chef.bio}
                </p>
              )}

              {/* Specialties */}
              {chef.specialties && chef.specialties.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {chef.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {chef.specialties.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{chef.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing and Experience */}
              <div className="flex items-center justify-between mb-4">
                {chef.hourlyRate && (
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">${chef.hourlyRate}/hour</span>
                  </div>
                )}
                {chef.experience && (
                  <span className="text-sm text-gray-500">
                    {chef.experience}+ years exp
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => openProfileModal(chef)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
                {user?.role !== 'chef' && (
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setContactChef(chef);
                      setIsContactModalOpen(true);
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Chef
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {chefs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <Search className="w-full h-full" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No chefs found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters to find more chefs.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
      </div>

      {/* Chef Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedChef && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedChef.profilePhoto} alt={selectedChef.name} />
                    <AvatarFallback className="text-lg">{selectedChef.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl font-bold">{selectedChef.name}</DialogTitle>
                    <DialogDescription className="flex items-center text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedChef.location || "Location not specified"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Left Column - Basic Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* About Section */}
                  {selectedChef.bio && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        About
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{selectedChef.bio}</p>
                    </div>
                  )}

                  {/* Culinary Specialties */}
                  {selectedChef.specialties && selectedChef.specialties.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center">
                        <UtensilsCrossed className="w-5 h-5 mr-2" />
                        Culinary Specialties
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedChef.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="px-3 py-1">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Signature Dishes */}
                  {selectedChef.signatureDishes && selectedChef.signatureDishes.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center">
                        <UtensilsCrossed className="w-5 h-5 mr-2 text-red-500" />
                        Signature Dishes
                      </h3>
                      <div className="space-y-2">
                        {selectedChef.signatureDishes.map((dish, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-gray-700">{dish}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Credentials & Background */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Credentials & Background
                    </h3>
                    <div className="space-y-4">
                      {selectedChef.formalTraining && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Formal Training</h4>
                          <p className="text-gray-700">{selectedChef.formalTraining}</p>
                        </div>
                      )}
                      
                      {selectedChef.workHistory && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Work Experience</h4>
                          <p className="text-gray-700">{selectedChef.workHistory}</p>
                        </div>
                      )}

                      {selectedChef.foodSafetyCertifications && selectedChef.foodSafetyCertifications.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Food Safety Certifications</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedChef.foodSafetyCertifications.map((cert) => (
                              <Badge key={cert} variant="outline" className="flex items-center">
                                <Award className="w-3 h-3 mr-1" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dietary Accommodations */}
                  {selectedChef.dietaryAccommodations && selectedChef.dietaryAccommodations.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-green-500" />
                        Dietary Accommodations
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedChef.dietaryAccommodations.map((accommodation) => (
                          <Badge key={accommodation} variant="outline" className="text-xs">
                            {accommodation}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience & Skills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedChef.experience && (
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Experience
                        </h4>
                        <p className="text-gray-600">{selectedChef.experience}+ years</p>
                      </div>
                    )}
                    
                    {selectedChef.rating && (
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <Star className="w-4 h-4 mr-2" />
                          Rating
                        </h4>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="font-medium">{parseFloat(selectedChef.rating.toString()).toFixed(1)}</span>
                          {selectedChef.reviewCount && (
                            <span className="text-gray-500 ml-2">({selectedChef.reviewCount} reviews)</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Booking Info */}
                <div className="space-y-6">
                  {/* Pricing */}
                  {selectedChef.hourlyRate && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Pricing
                      </h3>
                      <div className="text-2xl font-bold text-primary mb-2">
                        ${selectedChef.hourlyRate}/hour
                      </div>
                      <p className="text-sm text-gray-600">Starting rate for private events</p>
                    </Card>
                  )}

                  {/* Service Details */}
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <ChefHat className="w-5 h-5 mr-2" />
                      Service Info
                    </h3>
                    <div className="space-y-3">
                      {selectedChef.availableNow ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Available Now
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Contact for Availability</Badge>
                      )}
                      
                      {selectedChef.featured && (
                        <Badge variant="default" className="bg-[#0a51be] block w-fit">
                          <Award className="w-3 h-3 mr-1" />
                          Featured Chef
                        </Badge>
                      )}

                      {selectedChef.languagesSpoken && selectedChef.languagesSpoken.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Languages</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedChef.languagesSpoken.map((lang) => (
                              <Badge key={lang} variant="secondary" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedChef.maxPartySize && (
                        <div className="text-sm">
                          <span className="font-medium">Max Party Size:</span>
                          <span className="ml-2">{selectedChef.maxPartySize} guests</span>
                        </div>
                      )}

                      {selectedChef.bringsOwnEquipment !== undefined && (
                        <div className="text-sm">
                          <span className="font-medium">Brings Equipment:</span>
                          <Badge variant={selectedChef.bringsOwnEquipment ? "outline" : "secondary"} className="ml-2 text-xs">
                            {selectedChef.bringsOwnEquipment ? "Yes" : "No"}
                          </Badge>
                        </div>
                      )}

                      {selectedChef.canProvideStaff !== undefined && (
                        <div className="text-sm">
                          <span className="font-medium">Provides Staff:</span>
                          <Badge variant={selectedChef.canProvideStaff ? "outline" : "secondary"} className="ml-2 text-xs">
                            {selectedChef.canProvideStaff ? "Yes" : "No"}
                          </Badge>
                        </div>
                      )}

                      {selectedChef.willingToTravel !== undefined && (
                        <div className="text-sm">
                          <span className="font-medium">Travel:</span>
                          <span className="ml-2 text-gray-600">
                            {selectedChef.willingToTravel ? "Available" : "Local only"}
                            {selectedChef.maxTravelDistance && ` (${selectedChef.maxTravelDistance}mi)`}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Contact Actions */}
                  <div className="space-y-3">
                    {user?.role !== 'chef' && (
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => {
                          setContactChef(selectedChef);
                          setIsContactModalOpen(true);
                          setIsProfileModalOpen(false);
                        }}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Contact Chef
                      </Button>
                    )}
                    <Button variant="outline" className="w-full">
                      Save to Favorites
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Chef Modal */}
      {contactChef && (
        <ContactChefModal
          open={isContactModalOpen}
          onOpenChange={setIsContactModalOpen}
          chef={contactChef}
        />
      )}
    </DashboardLayout>
  );
}