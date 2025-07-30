import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAuth } from "@/lib/auth";
import { ChevronLeft, ChevronRight, X, Users, Calendar, MessageSquare, Star } from "lucide-react";
import logoImage from "@assets/ChefBounty Lg (2)_1753288571802.png";

interface OnboardingSliderProps {
  isOpen: boolean;
  onClose: () => void;
}

const slides = [
  {
    id: 1,
    title: "Welcome to ChefBounty",
    subtitle: "Connecting talented chefs with amazing events",
    content: (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <img 
            src={logoImage} 
            alt="ChefBounty" 
            className="h-24 w-auto object-contain"
            style={{ maxHeight: '96px', width: 'auto' }}
          />
        </div>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Whether you're a chef looking for exciting opportunities or a host planning the perfect event, ChefBounty makes it easy to connect.
        </p>
      </div>
    ),
  },
  {
    id: 2,
    title: "For Event Hosts",
    subtitle: "Post your event and find the perfect chef",
    content: (
      <div className="space-y-6">
        <div className="flex justify-center">
          <Calendar className="w-16 h-16 text-[#0a51be]" />
        </div>
        <div className="space-y-4 max-w-md mx-auto">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-[#0a51be] text-white flex items-center justify-center text-sm font-bold">1</div>
            <p className="text-gray-700">Post your event details, budget, and requirements</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-[#0a51be] text-white flex items-center justify-center text-sm font-bold">2</div>
            <p className="text-gray-700">Review bids from qualified chefs in your area</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-[#0a51be] text-white flex items-center justify-center text-sm font-bold">3</div>
            <p className="text-gray-700">Choose the perfect chef and finalize your booking</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "For Professional Chefs",
    subtitle: "Showcase your skills and find great opportunities",
    content: (
      <div className="space-y-6">
        <div className="flex justify-center">
          <Users className="w-16 h-16 text-[#0a51be]" />
        </div>
        <div className="space-y-4 max-w-md mx-auto">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-[#0a51be] text-white flex items-center justify-center text-sm font-bold">1</div>
            <p className="text-gray-700">Create your professional chef profile with portfolio</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-[#0a51be] text-white flex items-center justify-center text-sm font-bold">2</div>
            <p className="text-gray-700">Browse available events and submit competitive bids</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-[#0a51be] text-white flex items-center justify-center text-sm font-bold">3</div>
            <p className="text-gray-700">Get hired and build your reputation with reviews</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Let's Get Started!",
    subtitle: "Ready to begin your ChefBounty journey?",
    content: (
      <div className="text-center space-y-6">
        <div className="flex justify-center space-x-8">
          <div className="flex flex-col items-center space-y-2">
            <MessageSquare className="w-12 h-12 text-[#0a51be]" />
            <span className="text-sm font-medium">Direct Messaging</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Star className="w-12 h-12 text-[#0a51be]" />
            <span className="text-sm font-medium">Rating System</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Calendar className="w-12 h-12 text-[#0a51be]" />
            <span className="text-sm font-medium">Event Management</span>
          </div>
        </div>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          You're all set to start using ChefBounty. Complete your profile to get the most out of the platform.
        </p>
      </div>
    ),
  },
];

export function OnboardingSlider({ isOpen, onClose }: OnboardingSliderProps) {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleFinish = () => {
    // Mark onboarding as completed
    localStorage.setItem('chefbounty_onboarding_completed', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('chefbounty_onboarding_completed', 'true');
    onClose();
  };

  const currentSlideData = slides[currentSlide];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>ChefBounty Onboarding</DialogTitle>
          <DialogDescription>Welcome to ChefBounty - Get started with our platform</DialogDescription>
        </VisuallyHidden>
        <div className="relative min-h-[500px] bg-gradient-to-br from-blue-50 to-indigo-50">
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress indicators */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-[#0a51be]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Slide content */}
          <div className="px-8 py-16 h-full flex flex-col justify-center">
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                {currentSlideData.title}
              </h1>
              <p className="text-xl text-gray-600">
                {currentSlideData.subtitle}
              </p>
            </div>

            <div className="flex-1 flex items-center justify-center">
              {currentSlideData.content}
            </div>
          </div>

          {/* Navigation */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex space-x-2">
              {currentSlide < slides.length - 1 ? (
                <Button
                  onClick={nextSlide}
                  className="bg-[#0a51be] hover:bg-[#0a51be]/90 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  className="bg-[#0a51be] hover:bg-[#0a51be]/90 px-8"
                >
                  Start Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}