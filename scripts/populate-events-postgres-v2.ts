import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

// Detailed event data matching the actual schema
const events = [
  {
    title: 'Golden Anniversary Garden Party',
    description: `Celebrating 50 years of marriage with an elegant garden party. Looking for a chef who can create a sophisticated menu mixing classic favorites with modern touches. Need someone experienced with outdoor events and able to work with our garden venue's limited kitchen facilities. The couple loves Italian and Mediterranean cuisine.`,
    event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    duration: 5,
    location: 'Beverly Hills, CA',
    budget: 5000,
    cuisine_type: ['Italian', 'Mediterranean', 'Contemporary'],
    venue_type: 'home',
    status: 'open',
    event_image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
    allergies: ['Nuts', 'Gluten'],
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: true,
    chef_attire: 'formal',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    special_equipment: ['Outdoor grills', 'Portable warmers'],
    kitchen_availability: 'limited',
    parking_accessibility: 'Valet parking provided, loading zone available',
    indoor_outdoor: 'outdoor',
    event_theme: 'Elegant Garden Party',
    live_cooking: false,
    guest_dress_code: 'Cocktail attire',
    guest_count: 65,
    dietary_requirements: 'Vegetarian options needed, gluten-free for 3 guests',
    service_style: 'plated'
  },
  {
    title: 'Tech Startup Summer BBQ Bash',
    description: `Our AI startup is hosting our quarterly team celebration. We want to go all out with an authentic Texas-style BBQ but also need great vegetarian/vegan options as 30% of our team doesn't eat meat. Previous caterer fell through, so this is urgent! Outdoor space has professional grills and smokers available.`,
    event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    duration: 6,
    location: 'Austin, TX',
    budget: 8000,
    cuisine_type: ['BBQ', 'Southern', 'American', 'Vegan'],
    venue_type: 'office',
    status: 'open',
    event_image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    allergies: ['Gluten', 'Soy'],
    meal_type: 'lunch',
    beverage_service: true,
    alcohol_included: false,
    chef_attire: 'casual',
    onsite_cooking: true,
    serving_staff: false,
    setup_cleanup: true,
    special_equipment: ['Smokers', 'Large grills'],
    kitchen_availability: 'none',
    parking_accessibility: 'Large parking lot, easy loading access',
    indoor_outdoor: 'outdoor',
    event_theme: 'Casual Team Building',
    live_cooking: true,
    guest_dress_code: 'Casual',
    guest_count: 120,
    dietary_requirements: '30% vegetarian/vegan, gluten-free options needed',
    service_style: 'buffet'
  },
  {
    title: 'Michelin-Star Anniversary Dinner',
    description: `For our 10th wedding anniversary, I want to surprise my wife with an intimate fine dining experience at home. She's a huge foodie and has always dreamed of a private chef experience. Looking for someone with high-end restaurant experience who can create a memorable 7-course tasting menu with wine pairings.`,
    event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    duration: 4,
    location: 'Manhattan, NY',
    budget: 2000,
    cuisine_type: ['French', 'Modern European', 'Fine Dining'],
    venue_type: 'home',
    status: 'open',
    event_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    allergies: ['Shellfish'],
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: true,
    chef_attire: 'formal',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    special_equipment: [],
    kitchen_availability: 'full',
    parking_accessibility: 'Building has loading dock, doorman will assist',
    indoor_outdoor: 'indoor',
    event_theme: 'Romantic Fine Dining',
    live_cooking: false,
    guest_dress_code: 'Formal',
    guest_count: 2,
    dietary_requirements: 'No shellfish due to allergy',
    service_style: 'plated'
  },
  {
    title: 'Sustainable Vegan Wedding Reception',
    description: `We're having an eco-conscious wedding and need a chef who shares our values. All food must be plant-based, locally sourced, and organic when possible. The venue is a restored barn with a full commercial kitchen. We want to show our guests that vegan food can be absolutely delicious and elegant!`,
    event_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    duration: 7,
    location: 'Portland, OR',
    budget: 15000,
    cuisine_type: ['Vegan', 'Farm-to-Table', 'Contemporary'],
    venue_type: 'event_hall',
    status: 'open',
    event_image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    allergies: ['Gluten', 'Soy', 'Nuts'],
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: false,
    chef_attire: 'formal',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    special_equipment: [],
    kitchen_availability: 'full',
    parking_accessibility: 'Large parking area, accessible pathways',
    indoor_outdoor: 'both',
    event_theme: 'Eco-Elegant Wedding',
    live_cooking: false,
    guest_dress_code: 'Semi-formal',
    guest_count: 175,
    dietary_requirements: '100% vegan, gluten-free options essential',
    service_style: 'stations'
  },
  {
    title: 'Diwali Festival of Lights Celebration',
    description: `Hosting my first Diwali party in our new home! Want to combine traditional dishes from different regions of India with some modern fusion elements. My mother-in-law is visiting from Mumbai and is very particular about authenticity. Need someone who truly understands Indian flavors and can handle spice levels from mild to extra hot!`,
    event_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    duration: 5,
    location: 'Seattle, WA',
    budget: 4500,
    cuisine_type: ['Indian', 'South Asian', 'Indo-Chinese'],
    venue_type: 'home',
    status: 'open',
    event_image: 'https://images.unsplash.com/photo-1609619385002-f40c59df826f?w=800',
    allergies: ['Peanuts'],
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: false,
    chef_attire: 'traditional',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    special_equipment: ['Tandoor (if possible)', 'Multiple burners'],
    kitchen_availability: 'full',
    parking_accessibility: 'Street parking, driveway for loading',
    indoor_outdoor: 'both',
    event_theme: 'Traditional Festival',
    live_cooking: true,
    guest_dress_code: 'Traditional Indian attire encouraged',
    guest_count: 80,
    dietary_requirements: 'Mostly vegetarian, Jain options needed',
    service_style: 'buffet'
  },
  {
    title: 'Wine Collectors Annual Tasting Dinner',
    description: `Our wine club is opening some exceptional vintage bottles and need a chef who understands wine pairing at the highest level. Members are serious food and wine enthusiasts who have dined at the world's best restaurants. Previous chefs have included alumni from French Laundry and Le Bernardin.`,
    event_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    duration: 5,
    location: 'Napa Valley, CA',
    budget: 6000,
    cuisine_type: ['French', 'California Cuisine', 'Fine Dining'],
    venue_type: 'home',
    status: 'open',
    event_image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
    allergies: [],
    meal_type: 'dinner',
    beverage_service: false,
    alcohol_included: false,
    chef_attire: 'formal',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    special_equipment: [],
    kitchen_availability: 'full',
    parking_accessibility: 'Private parking, circular driveway',
    indoor_outdoor: 'indoor',
    event_theme: 'Wine Pairing Excellence',
    live_cooking: false,
    guest_dress_code: 'Business formal',
    guest_count: 16,
    dietary_requirements: 'One pescatarian, no pork',
    service_style: 'plated'
  },
  {
    title: 'Celebrity Chef Pop-Up Experience',
    description: `Looking to create a buzzworthy pop-up dining experience in my downtown loft. Want Instagram-worthy presentations and molecular gastronomy elements. The goal is to create something that will get social media attention and potentially attract food bloggers and critics. Budget is flexible for the right chef.`,
    event_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    duration: 6,
    location: 'Los Angeles, CA',
    budget: 10000,
    cuisine_type: ['Molecular Gastronomy', 'Fusion', 'Contemporary'],
    venue_type: 'home',
    status: 'open',
    event_image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
    allergies: [],
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: true,
    chef_attire: 'custom',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    special_equipment: ['Molecular gastronomy equipment', 'Specialized tools'],
    kitchen_availability: 'full',
    parking_accessibility: 'Valet service arranged',
    indoor_outdoor: 'indoor',
    event_theme: 'Avant-Garde Dining',
    live_cooking: true,
    guest_dress_code: 'Trendy/Fashion-forward',
    guest_count: 24,
    dietary_requirements: 'Must accommodate various diets',
    service_style: 'tasting_menu'
  },
  {
    title: 'Farm-to-Fork Harvest Dinner',
    description: `Hosting a harvest celebration at our organic farm. All produce will come from our gardens, and we have connections with local ranchers for meat. Want a chef who appreciates hyperlocal sourcing and can create a menu that showcases the season's bounty. Rustic elegance is the goal.`,
    event_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    duration: 5,
    location: 'Sonoma County, CA',
    budget: 7500,
    cuisine_type: ['Farm-to-Table', 'Californian', 'Seasonal'],
    venue_type: 'outdoor',
    status: 'open',
    event_image: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=800',
    allergies: [],
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: true,
    chef_attire: 'casual',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    special_equipment: ['Wood-fired ovens', 'Outdoor grills'],
    kitchen_availability: 'limited',
    parking_accessibility: 'Field parking, some walking required',
    indoor_outdoor: 'outdoor',
    event_theme: 'Harvest Celebration',
    live_cooking: true,
    guest_dress_code: 'Smart casual',
    guest_count: 100,
    dietary_requirements: 'Accommodate all diets, focus on vegetables',
    service_style: 'family_style'
  },
  {
    title: 'Diplomatic Reception Dinner',
    description: `Hosting international diplomats and need a chef who can execute multiple cuisines flawlessly. Menu should be sophisticated but not controversial - avoiding certain ingredients for diplomatic reasons. Experience with formal protocol and dietary restrictions essential. Security clearance may be required.`,
    event_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    duration: 4,
    location: 'Washington, DC',
    budget: 12000,
    cuisine_type: ['International', 'Continental'],
    venue_type: 'event_hall',
    status: 'open',
    event_image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
    allergies: ['Multiple'],
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: false,
    chef_attire: 'formal',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    special_equipment: [],
    kitchen_availability: 'full',
    parking_accessibility: 'Secure parking, advance list required',
    indoor_outdoor: 'indoor',
    event_theme: 'Formal Diplomatic',
    live_cooking: false,
    guest_dress_code: 'Black tie',
    guest_count: 50,
    dietary_requirements: 'Halal, Kosher, Vegetarian, Multiple allergies',
    service_style: 'plated'
  },
  {
    title: 'Japanese Tea Ceremony & Kaiseki Dinner',
    description: `Planning an authentic Japanese cultural evening with tea ceremony followed by traditional kaiseki dinner. Need a chef with deep understanding of Japanese culinary traditions, seasonal ingredients, and proper presentation. Our guests include Japanese business partners who will appreciate authenticity.`,
    event_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
    duration: 5,
    location: 'San Francisco, CA',
    budget: 5500,
    cuisine_type: ['Japanese', 'Traditional', 'Kaiseki'],
    venue_type: 'home',
    status: 'open',
    event_image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800',
    allergies: ['Shellfish'],
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: true,
    chef_attire: 'traditional',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    special_equipment: ['Traditional Japanese cookware'],
    kitchen_availability: 'full',
    parking_accessibility: 'Garage parking available',
    indoor_outdoor: 'indoor',
    event_theme: 'Traditional Japanese',
    live_cooking: false,
    guest_dress_code: 'Business formal',
    guest_count: 12,
    dietary_requirements: 'No shellfish for one guest',
    service_style: 'kaiseki'
  }
];

async function populateEvents() {
  try {
    console.log('Starting to populate events in PostgreSQL...\n');
    
    // First, ensure we have a host user
    let hostId;
    const hostEmail = 'events.host@example.com';
    
    // Check if host exists
    const existingHost = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [hostEmail]
    );
    
    if (existingHost.rows.length > 0) {
      hostId = existingHost.rows[0].id;
      console.log('Using existing host user');
    } else {
      // Create a host user
      const hostResult = await pool.query(
        `INSERT INTO users (email, password, name, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id`,
        [hostEmail, 'hashed_password', 'Event Host', 'host']
      );
      hostId = hostResult.rows[0].id;
      console.log('Created new host user');
    }
    
    // Insert each event
    for (const event of events) {
      try {
        const result = await pool.query(
          `INSERT INTO events (
            host_id, title, description, cuisine_type, event_date, duration,
            location, budget, venue_type, status, event_image
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          ) RETURNING id`,
          [
            hostId, event.title, event.description, event.cuisine_type,
            event.event_date, event.duration, event.location, event.budget,
            event.venue_type, event.status, event.event_image
          ]
        );
        
        console.log(`✓ Created event: ${event.title}`);
        console.log(`  - Location: ${event.location}`);
        console.log(`  - Budget: $${event.budget}`);
        console.log(`  - Guests: ${event.guest_count}`);
        console.log(`  - Date: ${event.event_date.toLocaleDateString()}\n`);
      } catch (error) {
        console.error(`Error creating event "${event.title}":`, error);
      }
    }
    
    // Get count of all events
    const countResult = await pool.query('SELECT COUNT(*) FROM events');
    console.log(`\nTotal events in database: ${countResult.rows[0].count}`);
    console.log('\nEvents populated successfully!');
    
  } catch (error) {
    console.error('Error populating events:', error);
  } finally {
    await pool.end();
  }
}

// Run the population script
populateEvents();