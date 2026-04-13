import dotenv from 'dotenv';
dotenv.config();

import { DatabaseStorage } from '../server/storage';
import { Pool } from 'pg';

// Create storage instance
const storage = new DatabaseStorage();

// Create a connection pool for checking users
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

// Sample events data
const events = [
  {
    title: '50th Anniversary Celebration',
    description: 'Looking for an experienced chef to create an elegant dinner menu for my parents\' golden anniversary. Expecting 40 guests.',
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    duration: 4,
    location: 'Beverly Hills, CA',
    budget: 3500,
    cuisineType: ['Italian', 'Mediterranean'],
    dietaryRestrictions: ['Vegetarian options needed', 'One guest with nut allergy'],
    venueType: 'home',
    mealType: 'dinner',
    beverageService: true,
    alcoholIncluded: true,
    chefAttire: 'formal',
    onsiteCooking: true,
    servingStaff: true,
    setupCleanup: true,
    kitchenAvailability: 'full',
    parkingAccessibility: 'Driveway available',
    indoorOutdoor: 'indoor',
    eventTheme: 'Elegant',
    menuFlexibility: 'open',
    presentationStyle: 'plated',
    proposedMenu: 'Open to chef suggestions',
    specialRequests: 'Anniversary cake to be served',
    guestCount: 40,
    status: 'open'
  },
  {
    title: 'Corporate Team Building BBQ',
    description: 'Tech startup seeking a BBQ expert for our quarterly team building event. Outdoor venue with grilling facilities available.',
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    duration: 5,
    location: 'Austin, TX',
    budget: 4000,
    cuisineType: ['BBQ', 'American'],
    dietaryRestrictions: ['Vegetarian options', 'Gluten-free options'],
    venueType: 'office',
    mealType: 'lunch',
    beverageService: true,
    alcoholIncluded: false,
    chefAttire: 'casual',
    onsiteCooking: true,
    servingStaff: false,
    setupCleanup: true,
    kitchenAvailability: 'limited',
    parkingAccessibility: 'Parking lot available',
    indoorOutdoor: 'outdoor',
    eventTheme: 'Casual',
    menuFlexibility: 'open',
    presentationStyle: 'buffet',
    proposedMenu: 'Classic BBQ favorites',
    specialRequests: 'Need vegetarian grilling options',
    guestCount: 75,
    status: 'open'
  },
  {
    title: 'Intimate Birthday Dinner',
    description: 'Planning a surprise birthday dinner for my wife. Looking for a chef who can create a romantic 5-course tasting menu.',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    duration: 3,
    location: 'Manhattan, NY',
    budget: 800,
    cuisineType: ['French', 'Fine Dining'],
    dietaryRestrictions: ['Pescatarian'],
    venueType: 'home',
    mealType: 'dinner',
    beverageService: true,
    alcoholIncluded: true,
    chefAttire: 'formal',
    onsiteCooking: true,
    servingStaff: true,
    setupCleanup: true,
    kitchenAvailability: 'full',
    parkingAccessibility: 'Street parking',
    indoorOutdoor: 'indoor',
    eventTheme: 'Romantic',
    menuFlexibility: 'open',
    presentationStyle: 'plated',
    proposedMenu: 'Chef\'s choice tasting menu',
    specialRequests: 'Birthday dessert surprise',
    guestCount: 2,
    status: 'open'
  },
  {
    title: 'Vegan Wedding Reception',
    description: 'All-vegan wedding reception for 150 guests. Need creative plant-based menu that will impress vegans and non-vegans alike.',
    eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    duration: 6,
    location: 'Portland, OR',
    budget: 12000,
    cuisineType: ['Vegan', 'Plant-Based'],
    dietaryRestrictions: ['All vegan', 'Gluten-free options needed'],
    venueType: 'event_hall',
    mealType: 'dinner',
    beverageService: true,
    alcoholIncluded: false,
    chefAttire: 'formal',
    onsiteCooking: true,
    servingStaff: true,
    setupCleanup: true,
    kitchenAvailability: 'full',
    parkingAccessibility: 'Valet parking',
    indoorOutdoor: 'indoor',
    eventTheme: 'Modern',
    menuFlexibility: 'strict',
    presentationStyle: 'buffet',
    proposedMenu: 'Creative plant-based cuisine',
    specialRequests: 'Wedding cake will be provided separately',
    guestCount: 150,
    status: 'open'
  },
  {
    title: 'Diwali Celebration Feast',
    description: 'Hosting a Diwali party and need authentic Indian cuisine. Mix of vegetarian and non-vegetarian dishes required.',
    eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    duration: 4,
    location: 'Seattle, WA',
    budget: 3000,
    cuisineType: ['Indian', 'South Asian'],
    dietaryRestrictions: ['Vegetarian options', 'No beef', 'Mild spice options'],
    venueType: 'home',
    mealType: 'dinner',
    beverageService: true,
    alcoholIncluded: false,
    chefAttire: 'casual',
    onsiteCooking: true,
    servingStaff: false,
    setupCleanup: true,
    kitchenAvailability: 'full',
    parkingAccessibility: 'Street parking',
    indoorOutdoor: 'indoor',
    eventTheme: 'Traditional',
    menuFlexibility: 'open',
    presentationStyle: 'buffet',
    proposedMenu: 'Traditional Diwali feast',
    specialRequests: 'Include traditional sweets',
    guestCount: 60,
    status: 'open'
  },
  {
    title: 'Wine Pairing Dinner',
    description: 'Organizing a wine tasting dinner for our wine club. Need a chef familiar with wine pairings for 6-course meal.',
    eventDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
    duration: 4,
    location: 'Napa Valley, CA',
    budget: 2500,
    cuisineType: ['French', 'European', 'Fine Dining'],
    dietaryRestrictions: ['One vegetarian'],
    venueType: 'home',
    mealType: 'dinner',
    beverageService: false,
    alcoholIncluded: false,
    chefAttire: 'formal',
    onsiteCooking: true,
    servingStaff: true,
    setupCleanup: true,
    kitchenAvailability: 'full',
    parkingAccessibility: 'Private parking',
    indoorOutdoor: 'indoor',
    eventTheme: 'Elegant',
    menuFlexibility: 'open',
    presentationStyle: 'plated',
    proposedMenu: 'Menu to pair with selected wines',
    specialRequests: 'Experience with wine pairings essential',
    guestCount: 20,
    status: 'open'
  }
];

async function populateEvents() {
  try {
    console.log('Creating events...');
    
    // Get or create a host user
    let hostId;
    
    const existingHost = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['host@example.com']
    );
    
    if (existingHost.rows.length > 0) {
      hostId = existingHost.rows[0].id;
    } else {
      console.log('No host user found. Please create a host account first.');
      return;
    }
    
    // Create events
    for (const event of events) {
      try {
        const createdEvent = await storage.createEvent({
          ...event,
          hostId
        });
        
        console.log(`Created event: ${event.title}`);
      } catch (error) {
        console.error(`Error creating event ${event.title}:`, error);
      }
    }
    
    console.log('\nEvents created successfully!');
    console.log('You can now browse events in the Browse Events section.');
    
  } catch (error) {
    console.error('Error populating events:', error);
  } finally {
    await pool.end();
  }
}

// Run the population script
populateEvents();