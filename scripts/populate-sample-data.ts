import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import bcrypt from 'bcrypt';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

// Sample chef data
const chefProfiles = [
  {
    email: 'maria.gonzalez@example.com',
    name: 'Maria Gonzalez',
    bio: 'Passionate Mexican chef with 15 years of experience bringing authentic flavors from Oaxaca to your table.',
    location: 'Los Angeles, CA',
    specialties: ['Mexican', 'Latin American', 'Vegan Options'],
    hourlyRate: '85',
    experience: '15 years',
    languagesSpoken: ['English', 'Spanish'],
    dietaryAccommodations: ['Vegan', 'Vegetarian', 'Gluten-Free'],
    rating: 4.9,
    profilePhoto: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400'
  },
  {
    email: 'james.chen@example.com',
    name: 'James Chen',
    bio: 'Award-winning fusion chef specializing in modern Asian cuisine with a California twist.',
    location: 'San Francisco, CA',
    specialties: ['Asian Fusion', 'Japanese', 'Chinese', 'Korean'],
    hourlyRate: '120',
    experience: '20 years',
    languagesSpoken: ['English', 'Mandarin', 'Japanese'],
    dietaryAccommodations: ['Vegetarian', 'Pescatarian', 'Nut-Free'],
    rating: 4.8,
    profilePhoto: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400'
  },
  {
    email: 'isabella.rossi@example.com',
    name: 'Isabella Rossi',
    bio: 'Third-generation Italian chef from Rome, bringing traditional family recipes and modern techniques together.',
    location: 'New York, NY',
    specialties: ['Italian', 'Mediterranean', 'Pasta Making', 'Pizza'],
    hourlyRate: '95',
    experience: '18 years',
    languagesSpoken: ['English', 'Italian', 'French'],
    dietaryAccommodations: ['Vegetarian', 'Vegan', 'Gluten-Free'],
    rating: 5.0,
    profilePhoto: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400'
  },
  {
    email: 'michael.thompson@example.com',
    name: 'Michael Thompson',
    bio: 'BBQ pitmaster and Southern cuisine expert. From Texas brisket to Carolina pulled pork, I bring the best of American BBQ.',
    location: 'Austin, TX',
    specialties: ['BBQ', 'Southern', 'American', 'Smoking & Grilling'],
    hourlyRate: '75',
    experience: '12 years',
    languagesSpoken: ['English'],
    dietaryAccommodations: ['Gluten-Free'],
    rating: 4.7,
    profilePhoto: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400'
  },
  {
    email: 'sarah.williams@example.com',
    name: 'Sarah Williams',
    bio: 'Plant-based chef and nutritionist creating innovative vegan dishes that even meat lovers enjoy.',
    location: 'Portland, OR',
    specialties: ['Vegan', 'Plant-Based', 'Raw Food', 'Healthy Cuisine'],
    hourlyRate: '90',
    experience: '10 years',
    languagesSpoken: ['English'],
    dietaryAccommodations: ['Vegan', 'Gluten-Free', 'Raw', 'Nut-Free'],
    rating: 4.9,
    profilePhoto: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400'
  },
  {
    email: 'pierre.dubois@example.com',
    name: 'Pierre Dubois',
    bio: 'Classically trained French chef from Lyon. Michelin experience with a focus on seasonal, local ingredients.',
    location: 'Chicago, IL',
    specialties: ['French', 'Fine Dining', 'European', 'Pastries'],
    hourlyRate: '150',
    experience: '25 years',
    languagesSpoken: ['English', 'French'],
    dietaryAccommodations: ['Vegetarian', 'Pescatarian'],
    rating: 4.9,
    profilePhoto: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400'
  },
  {
    email: 'aisha.patel@example.com',
    name: 'Aisha Patel',
    bio: 'Bringing the vibrant flavors of India to your events. Specialist in regional Indian cuisines from street food to royal feasts.',
    location: 'Seattle, WA',
    specialties: ['Indian', 'South Asian', 'Street Food', 'Vegetarian'],
    hourlyRate: '80',
    experience: '14 years',
    languagesSpoken: ['English', 'Hindi', 'Gujarati'],
    dietaryAccommodations: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal'],
    rating: 4.8,
    profilePhoto: 'https://images.unsplash.com/photo-1574966740793-953ad374e8ae?w=400'
  },
  {
    email: 'carlos.martinez@example.com',
    name: 'Carlos Martinez',
    bio: 'Paella master and Spanish cuisine expert. From tapas to elaborate seafood dishes, experience the taste of Spain.',
    location: 'Miami, FL',
    specialties: ['Spanish', 'Paella', 'Tapas', 'Seafood'],
    hourlyRate: '100',
    experience: '16 years',
    languagesSpoken: ['English', 'Spanish', 'Catalan'],
    dietaryAccommodations: ['Gluten-Free', 'Pescatarian'],
    rating: 4.7,
    profilePhoto: 'https://images.unsplash.com/photo-1559575003-fb4ee38a747d?w=400'
  }
];

// Sample events data
const events = [
  {
    title: '50th Anniversary Celebration',
    description: 'Looking for an experienced chef to create an elegant dinner menu for my parents\' golden anniversary. Expecting 40 guests.',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    time: '18:00',
    location: 'Beverly Hills, CA',
    guestCount: 40,
    budget: 3500,
    cuisineType: 'Italian',
    dietaryRestrictions: ['Vegetarian options needed', 'One guest with nut allergy'],
    eventType: 'Anniversary Party',
    serviceStyle: 'Plated Dinner'
  },
  {
    title: 'Corporate Team Building BBQ',
    description: 'Tech startup seeking a BBQ expert for our quarterly team building event. Outdoor venue with grilling facilities available.',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    time: '12:00',
    location: 'Austin, TX',
    guestCount: 75,
    budget: 4000,
    cuisineType: 'BBQ',
    dietaryRestrictions: ['Vegetarian options', 'Gluten-free options'],
    eventType: 'Corporate Event',
    serviceStyle: 'Buffet'
  },
  {
    title: 'Intimate Birthday Dinner',
    description: 'Planning a surprise birthday dinner for my wife. Looking for a chef who can create a romantic 5-course tasting menu.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    time: '19:00',
    location: 'Manhattan, NY',
    guestCount: 2,
    budget: 800,
    cuisineType: 'French',
    dietaryRestrictions: ['Pescatarian'],
    eventType: 'Birthday',
    serviceStyle: 'Plated Dinner'
  },
  {
    title: 'Vegan Wedding Reception',
    description: 'All-vegan wedding reception for 150 guests. Need creative plant-based menu that will impress vegans and non-vegans alike.',
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    time: '17:00',
    location: 'Portland, OR',
    guestCount: 150,
    budget: 12000,
    cuisineType: 'Vegan',
    dietaryRestrictions: ['All vegan', 'Gluten-free options needed'],
    eventType: 'Wedding',
    serviceStyle: 'Buffet'
  },
  {
    title: 'Diwali Celebration Feast',
    description: 'Hosting a Diwali party and need authentic Indian cuisine. Mix of vegetarian and non-vegetarian dishes required.',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    time: '18:30',
    location: 'Seattle, WA',
    guestCount: 60,
    budget: 3000,
    cuisineType: 'Indian',
    dietaryRestrictions: ['Vegetarian options', 'No beef', 'Mild spice options'],
    eventType: 'Cultural Celebration',
    serviceStyle: 'Buffet'
  },
  {
    title: 'Wine Pairing Dinner',
    description: 'Organizing a wine tasting dinner for our wine club. Need a chef familiar with wine pairings for 6-course meal.',
    date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
    time: '19:30',
    location: 'Napa Valley, CA',
    guestCount: 20,
    budget: 2500,
    cuisineType: 'French',
    dietaryRestrictions: ['One vegetarian'],
    eventType: 'Private Dinner',
    serviceStyle: 'Plated Dinner'
  },
  {
    title: 'Kids Birthday Party',
    description: 'My son is turning 10! Need a chef who can make fun, kid-friendly food that parents will enjoy too. Pizza making activity would be great!',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    time: '14:00',
    location: 'San Francisco, CA',
    guestCount: 25,
    budget: 1200,
    cuisineType: 'Italian',
    dietaryRestrictions: ['Dairy-free options', 'No peanuts'],
    eventType: 'Birthday',
    serviceStyle: 'Buffet'
  },
  {
    title: 'Paella Night Fundraiser',
    description: 'Charity fundraiser featuring authentic Spanish paella. Need a chef who can prepare paella for 100+ people outdoors.',
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    time: '17:00',
    location: 'Miami, FL',
    guestCount: 120,
    budget: 5000,
    cuisineType: 'Spanish',
    dietaryRestrictions: ['Seafood-free option needed', 'Vegetarian option'],
    eventType: 'Fundraiser',
    serviceStyle: 'Buffet'
  }
];

async function populateData() {
  try {
    console.log('Starting to populate sample data...');
    
    // Create chef accounts
    console.log('Creating chef profiles...');
    const chefIds = [];
    
    for (const chef of chefProfiles) {
      try {
        // Check if user already exists
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE email = $1',
          [chef.email]
        );
        
        if (existingUser.rows.length > 0) {
          console.log(`Chef ${chef.email} already exists, skipping...`);
          chefIds.push(existingUser.rows[0].id);
          continue;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        // Insert user - only use existing columns
        const result = await pool.query(
          `INSERT INTO users (email, password, role, name)
          VALUES ($1, $2, $3, $4)
          RETURNING id`,
          [
            chef.email,
            hashedPassword,
            'chef',
            chef.name
          ]
        );
        
        chefIds.push(result.rows[0].id);
        console.log(`Created chef profile for ${chef.name}`);
      } catch (error) {
        console.error(`Error creating chef ${chef.email}:`, error);
      }
    }
    
    // Create host account if doesn't exist
    console.log('\nCreating host account...');
    let hostId;
    
    const existingHost = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['host@example.com']
    );
    
    if (existingHost.rows.length > 0) {
      hostId = existingHost.rows[0].id;
      console.log('Host account already exists');
    } else {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const hostResult = await pool.query(
        `INSERT INTO users (email, password, role, name)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        ['host@example.com', hashedPassword, 'host', 'Event Host']
      );
      hostId = hostResult.rows[0].id;
      console.log('Created host account');
    }
    
    // Create events
    console.log('\nCreating events...');
    
    for (const event of events) {
      try {
        const result = await pool.query(
          `INSERT INTO events (
            host_id, title, description, date, time, location,
            guest_count, budget, cuisine_type, dietary_restrictions,
            event_type, service_style, status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING id`,
          [
            hostId,
            event.title,
            event.description,
            event.date,
            event.time,
            event.location,
            event.guestCount,
            event.budget,
            event.cuisineType,
            event.dietaryRestrictions,
            event.eventType,
            event.serviceStyle,
            'open',
            new Date()
          ]
        );
        
        console.log(`Created event: ${event.title}`);
        
        // Create a few bids for each event
        const numBids = Math.floor(Math.random() * 3) + 1; // 1-3 bids per event
        for (let i = 0; i < numBids && i < chefIds.length; i++) {
          const bidAmount = event.budget * (0.8 + Math.random() * 0.3); // 80-110% of budget
          const chefId = chefIds[Math.floor(Math.random() * chefIds.length)];
          
          try {
            await pool.query(
              `INSERT INTO bids (event_id, chef_id, amount, message, status)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                result.rows[0].id,
                chefId,
                Math.round(bidAmount),
                'I would love to cater your event! I have extensive experience with this type of cuisine and can accommodate all your dietary requirements.',
                'pending'
              ]
            );
          } catch (bidError) {
            // Ignore duplicate bid errors
          }
        }
      } catch (error) {
        console.error(`Error creating event ${event.title}:`, error);
      }
    }
    
    console.log('\nSample data population completed!');
    console.log('\nYou can now browse:');
    console.log('- Chef profiles in Browse Chefs');
    console.log('- Events in Browse Events');
    console.log('\nTest accounts:');
    console.log('- Host: host@example.com / password123');
    console.log('- Chefs: [chef-email] / password123');
    
  } catch (error) {
    console.error('Error populating data:', error);
  } finally {
    await pool.end();
  }
}

// Run the population script
populateData();