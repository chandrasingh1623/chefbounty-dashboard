import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

// Detailed event data with realistic information
const events = [
  {
    title: 'Golden Anniversary Garden Party',
    description: `Celebrating 50 years of marriage with an elegant garden party. Looking for a chef who can create a sophisticated menu mixing classic favorites with modern touches. Need someone experienced with outdoor events and able to work with our garden venue's limited kitchen facilities. The couple loves Italian and Mediterranean cuisine.`,
    event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    duration: 5,
    location: 'Beverly Hills, CA',
    budget: 5000,
    cuisine_type: ['Italian', 'Mediterranean', 'Contemporary'],
    dietary_restrictions: ['Vegetarian options needed', 'Gluten-free for 3 guests', 'One severe nut allergy'],
    venue_type: 'home',
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: true,
    chef_attire: 'formal',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    kitchen_availability: 'limited',
    parking_accessibility: 'Valet parking provided, loading zone available',
    indoor_outdoor: 'outdoor',
    event_theme: 'Elegant Garden Party',
    menu_flexibility: 'open',
    presentation_style: 'plated',
    proposed_menu: 'Cocktail hour with passed apps, 4-course seated dinner',
    special_requests: 'Anniversary cake will be provided by family bakery. Need champagne toast setup.',
    guest_count: 65,
    status: 'open'
  },
  {
    title: 'Tech Startup Summer BBQ Bash',
    description: `Our AI startup is hosting our quarterly team celebration. We want to go all out with an authentic Texas-style BBQ but also need great vegetarian/vegan options as 30% of our team doesn't eat meat. Previous caterer fell through, so this is urgent! Outdoor space has professional grills and smokers available.`,
    event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    duration: 6,
    location: 'Austin, TX',
    budget: 8000,
    cuisine_type: ['BBQ', 'Southern', 'American', 'Vegan BBQ'],
    dietary_restrictions: ['30% vegetarian/vegan', 'Gluten-free options', 'Halal options preferred'],
    venue_type: 'office',
    meal_type: 'lunch',
    beverage_service: true,
    alcohol_included: false,
    chef_attire: 'casual',
    onsite_cooking: true,
    serving_staff: false,
    setup_cleanup: true,
    kitchen_availability: 'outdoor_grill',
    parking_accessibility: 'Large parking lot, easy loading access',
    indoor_outdoor: 'outdoor',
    event_theme: 'Casual Team Building',
    menu_flexibility: 'flexible',
    presentation_style: 'buffet',
    proposed_menu: 'Traditional BBQ meats, creative plant-based BBQ, sides, desserts',
    special_requests: 'CEO is vegan - need impressive plant-based options. Live music during event.',
    guest_count: 120,
    status: 'open'
  },
  {
    title: 'Michelin-Star Anniversary Dinner',
    description: `For our 10th wedding anniversary, I want to surprise my wife with an intimate fine dining experience at home. She's a huge foodie and has always dreamed of a private chef experience. Looking for someone with high-end restaurant experience who can create a memorable 7-course tasting menu with wine pairings.`,
    event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    duration: 4,
    location: 'Manhattan, NY',
    budget: 2000,
    cuisine_type: ['French', 'Modern European', 'Fine Dining'],
    dietary_restrictions: ['No shellfish (allergy)', 'Prefer sustainable seafood'],
    venue_type: 'home',
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: true,
    chef_attire: 'formal',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    kitchen_availability: 'full',
    parking_accessibility: 'Building has loading dock, doorman will assist',
    indoor_outdoor: 'indoor',
    event_theme: 'Romantic Fine Dining',
    menu_flexibility: 'open',
    presentation_style: 'plated',
    proposed_menu: "Chef's choice tasting menu with seasonal ingredients",
    special_requests: 'Rose petals, candles, and romantic ambiance. Champagne for toast.',
    guest_count: 2,
    status: 'open'
  },
  {
    title: 'Sustainable Vegan Wedding Reception',
    description: `We're having an eco-conscious wedding and need a chef who shares our values. All food must be plant-based, locally sourced, and organic when possible. The venue is a restored barn with a full commercial kitchen. We want to show our guests that vegan food can be absolutely delicious and elegant!`,
    event_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    duration: 7,
    location: 'Portland, OR',
    budget: 15000,
    cuisine_type: ['Vegan', 'Farm-to-Table', 'Contemporary', 'Plant-Based Fine Dining'],
    dietary_restrictions: ['100% vegan', 'Gluten-free options essential', 'No soy for several guests'],
    venue_type: 'event_hall',
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: false,
    chef_attire: 'formal',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    kitchen_availability: 'full',
    parking_accessibility: 'Large parking area, accessible pathways',
    indoor_outdoor: 'both',
    event_theme: 'Eco-Elegant Wedding',
    menu_flexibility: 'strict',
    presentation_style: 'stations',
    proposed_menu: 'Cocktail hour, seated dinner with multiple courses, late night snacks',
    special_requests: 'Compostable serviceware only. Display cards noting local farms.',
    guest_count: 175,
    status: 'open'
  },
  {
    title: 'Diwali Festival of Lights Celebration',
    description: `Hosting my first Diwali party in our new home! Want to combine traditional dishes from different regions of India with some modern fusion elements. My mother-in-law is visiting from Mumbai and is very particular about authenticity. Need someone who truly understands Indian flavors and can handle spice levels from mild to extra hot!`,
    event_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    duration: 5,
    location: 'Seattle, WA',
    budget: 4500,
    cuisine_type: ['Indian', 'South Asian', 'Indo-Chinese', 'Indian Street Food'],
    dietary_restrictions: ['Mostly vegetarian', 'Jain options needed', 'Kids menu with mild spices'],
    venue_type: 'home',
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: false,
    chef_attire: 'traditional',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    kitchen_availability: 'full',
    parking_accessibility: 'Street parking, driveway for loading',
    indoor_outdoor: 'both',
    event_theme: 'Traditional Festival',
    menu_flexibility: 'moderate',
    presentation_style: 'buffet',
    proposed_menu: 'Chat station, main course buffet, dessert display',
    special_requests: 'Live dosa station would be amazing! Traditional sweets display.',
    guest_count: 80,
    status: 'open'
  },
  {
    title: 'Wine Collectors Annual Tasting Dinner',
    description: `Our wine club is opening some exceptional vintage bottles and need a chef who understands wine pairing at the highest level. Members are serious food and wine enthusiasts who have dined at the world's best restaurants. Previous chefs have included alumni from French Laundry and Le Bernardin.`,
    event_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    duration: 5,
    location: 'Napa Valley, CA',
    budget: 6000,
    cuisine_type: ['French', 'California Cuisine', 'Fine Dining', 'Seasonal'],
    dietary_restrictions: ['One pescatarian', 'Gluten-free needed', 'No pork'],
    venue_type: 'home',
    meal_type: 'dinner',
    beverage_service: false,
    alcohol_included: false,
    chef_attire: 'formal',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    kitchen_availability: 'full',
    parking_accessibility: 'Private parking, circular driveway',
    indoor_outdoor: 'indoor',
    event_theme: 'Wine Pairing Excellence',
    menu_flexibility: 'structured',
    presentation_style: 'plated',
    proposed_menu: '8 courses paired with specific wines (list provided)',
    special_requests: 'Chef must work with sommelier. Timing crucial for wine service.',
    guest_count: 16,
    status: 'open'
  },
  {
    title: 'Celebrity Chef Pop-Up Experience',
    description: `Looking to create a buzzworthy pop-up dining experience in my downtown loft. Want Instagram-worthy presentations and molecular gastronomy elements. The goal is to create something that will get social media attention and potentially attract food bloggers and critics. Budget is flexible for the right chef.`,
    event_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    duration: 6,
    location: 'Los Angeles, CA',
    budget: 10000,
    cuisine_type: ['Molecular Gastronomy', 'Fusion', 'Contemporary', 'Experimental'],
    dietary_restrictions: ['Must accommodate various diets', 'Allergen-conscious'],
    venue_type: 'home',
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: true,
    chef_attire: 'custom',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    kitchen_availability: 'full',
    parking_accessibility: 'Valet service arranged',
    indoor_outdoor: 'indoor',
    event_theme: 'Avant-Garde Dining',
    menu_flexibility: 'creative',
    presentation_style: 'artistic',
    proposed_menu: '10+ course tasting with cocktail pairings',
    special_requests: 'Need "wow factor" dishes. Open kitchen so guests can watch.',
    guest_count: 24,
    status: 'open'
  },
  {
    title: 'Farm-to-Fork Harvest Dinner',
    description: `Hosting a harvest celebration at our organic farm. All produce will come from our gardens, and we have connections with local ranchers for meat. Want a chef who appreciates hyperlocal sourcing and can create a menu that showcases the season's bounty. Rustic elegance is the goal.`,
    event_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    duration: 5,
    location: 'Sonoma County, CA',
    budget: 7500,
    cuisine_type: ['Farm-to-Table', 'Californian', 'Seasonal', 'Mediterranean'],
    dietary_restrictions: ['Accommodate all diets', 'Focus on vegetables'],
    venue_type: 'outdoor',
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: true,
    chef_attire: 'casual_elegant',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    kitchen_availability: 'limited',
    parking_accessibility: 'Field parking, some walking required',
    indoor_outdoor: 'outdoor',
    event_theme: 'Harvest Celebration',
    menu_flexibility: 'seasonal',
    presentation_style: 'family_style',
    proposed_menu: 'Multi-course dinner featuring estate produce',
    special_requests: 'Long table setup in the vineyard. Fire pit for dessert course.',
    guest_count: 100,
    status: 'open'
  },
  {
    title: 'Diplomatic Reception Dinner',
    description: `Hosting international diplomats and need a chef who can execute multiple cuisines flawlessly. Menu should be sophisticated but not controversial - avoiding certain ingredients for diplomatic reasons. Experience with formal protocol and dietary restrictions essential. Security clearance may be required.`,
    event_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    duration: 4,
    location: 'Washington, DC',
    budget: 12000,
    cuisine_type: ['International', 'Continental', 'Diplomatic Cuisine'],
    dietary_restrictions: ['Halal', 'Kosher', 'Vegetarian', 'Multiple allergies'],
    venue_type: 'event_hall',
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: false,
    chef_attire: 'formal',
    onsite_cooking: true,
    serving_staff: true,
    setup_cleanup: true,
    kitchen_availability: 'full',
    parking_accessibility: 'Secure parking, advance list required',
    indoor_outdoor: 'indoor',
    event_theme: 'Formal Diplomatic',
    menu_flexibility: 'structured',
    presentation_style: 'plated',
    proposed_menu: 'Reception canapes, formal seated dinner',
    special_requests: 'Menu must be approved in advance. No pork, shellfish, or alcohol in food.',
    guest_count: 50,
    status: 'open'
  },
  {
    title: 'Molecular Gastronomy Workshop & Dinner',
    description: `Want to hire a chef to teach a small group molecular gastronomy techniques, then prepare an innovative dinner using those techniques. Participants are serious home cooks looking to learn advanced techniques. Need someone who's both a skilled chef and good teacher.`,
    event_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    duration: 6,
    location: 'Chicago, IL',
    budget: 3500,
    cuisine_type: ['Molecular Gastronomy', 'Educational', 'Modern Cuisine'],
    dietary_restrictions: ['Vegetarian options', 'Gluten-free participant'],
    venue_type: 'home',
    meal_type: 'dinner',
    beverage_service: true,
    alcohol_included: true,
    chef_attire: 'professional',
    onsite_cooking: true,
    serving_staff: false,
    setup_cleanup: true,
    kitchen_availability: 'full',
    parking_accessibility: 'Street parking available',
    indoor_outdoor: 'indoor',
    event_theme: 'Educational Dining',
    menu_flexibility: 'structured',
    presentation_style: 'interactive',
    proposed_menu: 'Hands-on workshop followed by tasting menu',
    special_requests: 'Need equipment for molecular techniques. Recipe cards for participants.',
    guest_count: 8,
    status: 'open'
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
            host_id, title, description, event_date, duration, location, budget,
            cuisine_type, dietary_restrictions, venue_type, meal_type,
            beverage_service, alcohol_included, chef_attire, onsite_cooking,
            serving_staff, setup_cleanup, kitchen_availability, parking_accessibility,
            indoor_outdoor, event_theme, menu_flexibility, presentation_style,
            proposed_menu, special_requests, guest_count, status
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
          ) RETURNING id`,
          [
            hostId, event.title, event.description, event.event_date, event.duration,
            event.location, event.budget, event.cuisine_type, event.dietary_restrictions,
            event.venue_type, event.meal_type, event.beverage_service, event.alcohol_included,
            event.chef_attire, event.onsite_cooking, event.serving_staff, event.setup_cleanup,
            event.kitchen_availability, event.parking_accessibility, event.indoor_outdoor,
            event.event_theme, event.menu_flexibility, event.presentation_style,
            event.proposed_menu, event.special_requests, event.guest_count, event.status
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