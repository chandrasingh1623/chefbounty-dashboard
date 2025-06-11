import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Search, MapPin, DollarSign, Star, Filter, SlidersHorizontal, Award } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

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
  profileImage?: string;
  featured?: boolean;
  availableNow?: boolean;
}

export function BrowseChefs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [budgetRange, setBudgetRange] = useState([25, 200]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [availableNowOnly, setAvailableNowOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const cuisineTypes = [
    "Italian", "French", "Asian", "Mexican", "Mediterranean", 
    "Indian", "Japanese", "American", "Vegetarian", "Vegan"
  ];

  const { data: chefs = [], isLoading } = useQuery({
    queryKey: ['/api/chefs', searchTerm, sortBy, budgetRange, selectedCuisines, locationFilter, availableNowOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (sortBy) params.append('sort', sortBy);
      if (locationFilter) params.append('location', locationFilter);
      if (availableNowOnly) params.append('available', 'true');
      if (selectedCuisines.length > 0) params.append('cuisines', selectedCuisines.join(','));
      params.append('minRate', budgetRange[0].toString());
      params.append('maxRate', budgetRange[1].toString());
      
      const response = await fetch(`/api/chefs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch chefs');
      return response.json();
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Browse Chefs</h1>
        </div>
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Chefs</h1>
          <p className="text-gray-600 mt-1">Find the perfect chef for your event</p>
        </div>
      </div>

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chefs.map((chef: Chef) => (
          <Card key={chef.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Header with Avatar and Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={chef.profileImage} alt={chef.name} />
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
                    <span className="ml-1 text-sm font-medium">{chef.rating.toFixed(1)}</span>
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

              {/* View Profile Button */}
              <Link href={`/dashboard/chef/${chef.id}`}>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  View Profile
                </Button>
              </Link>
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
  );
}