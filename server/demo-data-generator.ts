import { faker } from '@faker-js/faker';
import type { InsertUser, InsertEvent, InsertBid } from '../shared/schema';

// Cuisine specialties for realistic chef profiles
const cuisineSpecialties = [
  'Italian', 'French', 'Mediterranean', 'Asian Fusion', 'Japanese', 'Mexican', 
  'Indian', 'Thai', 'Chinese', 'Korean', 'Spanish', 'Greek', 'Lebanese', 
  'Moroccan', 'American', 'Southern', 'Cajun', 'BBQ', 'Seafood', 'Steakhouse',
  'Vegan', 'Vegetarian', 'Farm-to-Table', 'Molecular Gastronomy', 'Fusion'
];

const certifications = [
  'ServSafe Food Handler',
  'ServSafe Manager',
  'Le Cordon Bleu Graduate',
  'Culinary Institute of America',
  'Johnson & Wales Culinary Arts',
  'HACCP Certification',
  'Allergen Awareness Certified',
  'Sommelier Level 1',
  'Food Safety Manager'
];

const languages = ['Spanish', 'French', 'Italian', 'German', 'Portuguese', 'Mandarin', 'Japanese', 'Korean'];

const venueTypes = ['home', 'commercial_kitchen', 'yacht', 'rooftop', 'garden', 'loft', 'restaurant', 'banquet_hall'];
const mealTypes = ['brunch', 'lunch', 'dinner', 'cocktail_party', 'buffet', 'family_style', 'plated_dinner'];

// Sample dish names by cuisine
const dishNamesByCuisine: Record<string, string[]> = {
  Italian: ['Osso Buco Milanese', 'Truffle Risotto', 'Braised Short Rib Ragu', 'Burrata Caprese', 'Tiramisu'],
  French: ['Coq au Vin', 'Bouillabaisse', 'Duck Confit', 'Crème Brûlée', 'Ratatouille Niçoise'],
  Asian: ['Miso Glazed Black Cod', 'Korean BBQ Bulgogi', 'Thai Green Curry', 'Peking Duck Pancakes', 'Mochi Ice Cream'],
  Mediterranean: ['Lamb Tagine', 'Grilled Branzino', 'Hummus Trio', 'Baklava', 'Shakshuka'],
  American: ['Wagyu Beef Sliders', 'Lobster Mac & Cheese', 'BBQ Brisket', 'Key Lime Pie', 'Buffalo Cauliflower'],
  Mexican: ['Mole Negro', 'Ceviche Mixto', 'Carnitas Tacos', 'Tres Leches Cake', 'Elote Street Corn'],
  Indian: ['Butter Chicken', 'Lamb Biryani', 'Tandoori Salmon', 'Gulab Jamun', 'Samosa Chaat']
};

// Portfolio images (using Unsplash food photography)
const portfolioImages = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
  'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400',
  'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400',
  'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400',
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400'
];

function generateWorkExperience(yearsExperience: number): string {
  const restaurants = [
    'Le Bernardin', 'The French Laundry', 'Eleven Madison Park', 'Alinea', 'Per Se',
    'Daniel', 'Jean-Georges', 'Blue Hill', 'Gramercy Tavern', 'Union Square Cafe',
    'The River Cafe', 'Nobu', 'Momofuku', 'The Modern', 'Balthazar',
    'Babbo', 'Osteria Mozza', 'Providence', 'Animal', 'République'
  ];
  
  const positions = [
    'Executive Chef', 'Sous Chef', 'Chef de Cuisine', 'Pastry Chef', 
    'Line Cook', 'Station Chef', 'Kitchen Manager', 'Culinary Director'
  ];
  
  const experiences = [];
  
  if (yearsExperience >= 8) {
    experiences.push(`Executive Chef at ${faker.helpers.arrayElement(restaurants)} (3+ years)`);
    experiences.push(`Sous Chef at ${faker.helpers.arrayElement(restaurants)} (2+ years)`);
  } else if (yearsExperience >= 5) {
    experiences.push(`Sous Chef at ${faker.helpers.arrayElement(restaurants)} (2+ years)`);
    experiences.push(`Chef de Cuisine at ${faker.helpers.arrayElement(restaurants)} (2+ years)`);
  } else {
    experiences.push(`${faker.helpers.arrayElement(positions)} at ${faker.helpers.arrayElement(restaurants)} (${yearsExperience} years)`);
  }
  
  // Add culinary school or training
  if (yearsExperience >= 3) {
    const culinarySchools = [
      'Culinary Institute of America', 'Johnson & Wales University', 'Institute of Culinary Education',
      'Kendall College of Culinary Arts', 'Sullivan University', 'The Art Institute'
    ];
    experiences.push(`Graduate of ${faker.helpers.arrayElement(culinarySchools)}`);
  }
  
  return experiences.join(' • ');
}

export function generateDemoChef(): InsertUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const specialties = faker.helpers.arrayElements(cuisineSpecialties, { min: 2, max: 4 });
  const chefCertifications = faker.helpers.arrayElements(certifications, { min: 1, max: 3 });
  const spokenLanguages = ['English', ...faker.helpers.arrayElements(languages, { min: 0, max: 2 })];
  
  // Generate signature dishes based on specialties
  const signatureDishes: string[] = [];
  specialties.forEach(cuisine => {
    const dishes = dishNamesByCuisine[cuisine] || dishNamesByCuisine.American;
    signatureDishes.push(...faker.helpers.arrayElements(dishes, { min: 1, max: 2 }));
  });

  const yearsExperience = faker.number.int({ min: 2, max: 20 });
  const profileCompletion = faker.number.int({ min: 65, max: 100 });

  return {
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@demo.chefbounty.com`,
    password: '$2b$10$demo.password.hash', // Demo password hash
    role: 'chef',
    profilePhoto: `https://randomuser.me/api/portraits/${faker.helpers.arrayElement(['men', 'women'])}/${faker.number.int({ min: 1, max: 99 })}.jpg`,
    
    // Profile completion and status
    profileLive: faker.datatype.boolean({ probability: 0.8 }),
    
    // Location and availability
    location: `${faker.location.city()}, ${faker.location.state()}`,
    maxTravelDistance: faker.number.int({ min: 10, max: 100 }),
    availableNow: faker.datatype.boolean({ probability: 0.7 }),
    
    // Professional info
    bio: `Passionate ${specialties[0]} chef with ${yearsExperience} years of experience. I specialize in creating memorable dining experiences that blend traditional techniques with modern innovation. My culinary journey has taken me through top kitchens where I've honed my craft in ${specialties.join(', ')} cuisine.`,
    experience: yearsExperience,
    specialties,
    signatureDishes: signatureDishes.slice(0, 3),
    formalTraining: faker.helpers.arrayElement([
      'Culinary Institute of America',
      'Le Cordon Bleu',
      'Johnson & Wales University',
      'Institute of Culinary Education',
      'Self-taught with restaurant experience'
    ]),
    foodSafetyCertifications: chefCertifications,
    languages: spokenLanguages,
    
    // Service capabilities
    availableServices: faker.helpers.arrayElements([
      'Personal Chef Services',
      'Event Catering',
      'Cooking Classes',
      'Meal Prep',
      'Private Dinners',
      'Corporate Events'
    ], { min: 2, max: 4 }),
    maxPartySize: faker.number.int({ min: 4, max: 100 }),
    lastMinuteBookings: faker.datatype.boolean({ probability: 0.6 }),
    bringsOwnEquipment: faker.datatype.boolean({ probability: 0.7 }),
    canProvideStaff: faker.datatype.boolean({ probability: 0.4 }),
    
    // Dietary accommodations
    dietaryAccommodations: faker.helpers.arrayElements([
      'Vegetarian',
      'Vegan',
      'Gluten-Free',
      'Keto',
      'Paleo',
      'Nut Allergies',
      'Dairy-Free',
      'Kosher',
      'Halal'
    ], { min: 1, max: 4 }),
    
    // Media and portfolio
    portfolioImages: faker.helpers.arrayElements(portfolioImages, { min: 3, max: 6 }),
    
    // Pricing
    hourlyRate: faker.helpers.arrayElement([45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 150, 175, 200]),
    rateUnit: faker.helpers.arrayElement(['hour', 'guest']),
    
    // Rating and reviews
    rating: faker.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 }),
    reviewCount: faker.number.int({ min: 5, max: 150 }),
    
    // Equipment and fees
    equipmentList: faker.helpers.arrayElements([
      'Professional Knives',
      'Portable Induction Cooktop',
      'Food Processor',
      'Stand Mixer',
      'Thermometer',
      'Serving Platters'
    ], { min: 2, max: 5 }),
    travelFees: `$${faker.number.float({ min: 0.50, max: 2.00, fractionDigits: 2 })} per mile over 25 miles`,
    
    // Work history and experience
    workHistory: generateWorkExperience(yearsExperience),
    emailVerified: true,
  };
}

export function generateDemoHost(): InsertUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  return {
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@demo.chefbounty.com`,
    password: '$2b$10$demo.password.hash', // Demo password hash
    role: 'host',
    profilePhoto: `https://randomuser.me/api/portraits/${faker.helpers.arrayElement(['men', 'women'])}/${faker.number.int({ min: 1, max: 99 })}.jpg`,
    location: `${faker.location.city()}, ${faker.location.state()}`,
    bio: `Experienced event host passionate about bringing people together through exceptional dining experiences. I believe great food creates lasting memories and love connecting talented chefs with the perfect opportunities.`,
    emailVerified: true,
  };
}

export function generateDemoEvent(hostId: number): InsertEvent {
  const cuisineTypes = faker.helpers.arrayElements(cuisineSpecialties, { min: 1, max: 3 });
  const eventDate = faker.date.future({ days: 60 });
  const guestCount = faker.number.int({ min: 4, max: 50 });
  
  const eventTitles = [
    `${faker.helpers.arrayElement(['Birthday', 'Anniversary', 'Corporate', 'Holiday', 'Wedding'])} ${faker.helpers.arrayElement(['Dinner', 'Brunch', 'Lunch', 'Cocktail Party', 'Celebration'])}`,
    `${cuisineTypes[0]} Night for ${guestCount}`,
    `Private ${faker.helpers.arrayElement(['Chef Experience', 'Dining Event', 'Cooking Class', 'Wine Pairing'])}`,
    `${faker.helpers.arrayElement(['Intimate', 'Elegant', 'Casual', 'Formal'])} ${faker.helpers.arrayElement(['Gathering', 'Dinner Party', 'Reception', 'Event'])}`
  ];

  return {
    hostId,
    title: faker.helpers.arrayElement(eventTitles),
    description: `Looking for a talented chef to create an unforgettable ${cuisineTypes[0].toLowerCase()} dining experience. We're planning a ${faker.helpers.arrayElement(['sophisticated', 'fun', 'intimate', 'lively'])} event that showcases fresh, seasonal ingredients with exceptional presentation. ${faker.helpers.arrayElement(['Guests will include food enthusiasts who appreciate quality cuisine.', 'This is a special occasion that deserves exceptional culinary artistry.', 'We value creativity and attention to detail in both preparation and service.'])}`,
    
    // Event details
    cuisineType: cuisineTypes,
    eventDate,
    duration: faker.number.int({ min: 2, max: 8 }), // hours
    location: `${faker.location.city()}, ${faker.location.state()}`,
    budget: faker.helpers.arrayElement([500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000]),
    
    // Venue and meal info
    venueType: faker.helpers.arrayElement(venueTypes),
    mealType: faker.helpers.arrayElement(mealTypes),
    beverageService: faker.datatype.boolean({ probability: 0.7 }),
    alcoholIncluded: faker.datatype.boolean({ probability: 0.5 }),
    
    // Chef requirements
    chefAttire: faker.helpers.arrayElement(['casual', 'formal', 'uniform']),
    onsiteCooking: faker.datatype.boolean({ probability: 0.8 }),
    servingStaff: faker.datatype.boolean({ probability: 0.3 }),
    setupCleanup: faker.datatype.boolean({ probability: 0.9 }),
    
    // Venue details
    kitchenAvailability: faker.helpers.arrayElement(['full', 'limited', 'none']),
    parkingAccessibility: faker.helpers.arrayElement(['Street parking', 'Driveway available', 'Garage access', 'Paid parking nearby']),
    indoorOutdoor: faker.helpers.arrayElement(['indoor', 'outdoor', 'both']),
    
    // Experience and style
    eventTheme: faker.helpers.arrayElement(['Modern', 'Rustic', 'Elegant', 'Casual', 'Themed', 'Traditional']),
    liveCooking: faker.datatype.boolean({ probability: 0.4 }),
    guestDressCode: faker.helpers.arrayElement(['Casual', 'Business Casual', 'Cocktail', 'Formal', 'Black Tie']),
    
    // Special requirements
    allergies: faker.helpers.arrayElements([
      'Nuts', 'Shellfish', 'Dairy', 'Gluten', 'Eggs', 'Soy'
    ], { min: 0, max: 2 }),
    specialEquipment: faker.helpers.arrayElements([
      'Grill', 'Pizza Oven', 'Smoker', 'Pasta Machine', 'Ice Cream Maker'
    ], { min: 0, max: 2 }),
    
    status: 'open'
  };
}

export function generateDemoBid(eventId: number, chefId: number): InsertBid {
  const bidAmount = faker.number.float({ min: 200, max: 1500, fractionDigits: 2 });
  
  const bidMessages = [
    `I'm excited about the opportunity to create an exceptional dining experience for your event. With my expertise in the requested cuisine, I'll craft a memorable menu using premium, seasonal ingredients. My approach focuses on both flavor and presentation to ensure your guests have an unforgettable evening.`,
    
    `This sounds like a fantastic event! I specialize in the cuisine you're looking for and have extensive experience with similar gatherings. I'll work closely with you to customize the menu to your preferences and dietary requirements, ensuring every detail exceeds your expectations.`,
    
    `I'd love to be your chef for this special occasion. My culinary background and passion for exceptional service make me confident I can deliver exactly what you're envisioning. I pride myself on creating dishes that are both delicious and beautifully presented.`,
    
    `Your event sounds wonderful, and I believe my skills are a perfect match for what you're seeking. I focus on using the finest ingredients and techniques to create an elevated dining experience. I'm happy to discuss menu customization and any special requirements you may have.`
  ];

  return {
    eventId,
    chefId,
    amount: bidAmount,
    message: faker.helpers.arrayElement(bidMessages),
    status: faker.helpers.weightedArrayElement([
      { weight: 0.7, value: 'pending' },
      { weight: 0.2, value: 'accepted' },
      { weight: 0.1, value: 'rejected' }
    ])
  };
}