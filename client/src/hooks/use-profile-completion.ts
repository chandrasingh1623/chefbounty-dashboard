import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

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

interface ProfileCompletion {
  percentage: number;
  missingFields: string[];
  totalFields: number;
  completedCount: number;
}

export function useProfileCompletion() {
  const { user } = useAuth();

  // Fetch chef profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/chef-profile', user?.id],
    enabled: !!user?.id && user?.role === 'chef',
  });

  const calculateProfileCompletion = (): ProfileCompletion => {
    if (!profile) return { percentage: 0, missingFields: [], totalFields: 0, completedCount: 0 };
    
    const requiredFields = [
      { key: 'name', label: 'Full Name', value: profile.name?.length > 0 },
      { key: 'bio', label: 'Bio/About Me', value: profile.bio?.length > 10 },
      { key: 'specialties', label: 'Cuisine Type', value: profile.specialties?.length > 0 },
      { key: 'signatureDishes', label: 'Signature Dishes', value: profile.signatureDishes?.length > 0 },
      { key: 'portfolioImages', label: 'Portfolio Photos', value: profile.portfolioImages?.length > 0 },
      { key: 'hourlyRate', label: 'Rates', value: profile.hourlyRate > 0 },
      { key: 'foodSafetyCertifications', label: 'Certifications', value: profile.foodSafetyCertifications?.length > 0 },
      { key: 'location', label: 'Location', value: profile.location?.length > 0 },
      { key: 'experience', label: 'Experience', value: profile.experience > 0 },
      { key: 'languagesSpoken', label: 'Languages Spoken', value: profile.languagesSpoken?.length > 0 },
    ];
    
    const completedFields = requiredFields.filter(field => field.value);
    const missingFields = requiredFields.filter(field => !field.value);
    const percentage = Math.round((completedFields.length / requiredFields.length) * 100);
    
    return {
      percentage,
      missingFields: missingFields.map(field => field.label),
      totalFields: requiredFields.length,
      completedCount: completedFields.length
    };
  };

  return {
    profileCompletion: calculateProfileCompletion(),
    profile,
    isLoading
  };
}