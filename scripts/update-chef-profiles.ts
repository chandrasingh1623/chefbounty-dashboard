import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

// Detailed chef profile updates with real-looking information
const chefUpdates = [
  {
    email: 'maria.gonzalez@example.com',
    name: 'Chef Maria Gonzalez',
    bio: `Award-winning Mexican chef with 15+ years of experience in authentic regional cuisine. Trained in Oaxaca under renowned Chef Alejandro Ruiz. Specializes in traditional mole preparation, handmade tortillas, and contemporary Mexican fusion. Featured in Food & Wine Magazine's "Rising Chefs of 2023". Passionate about sustainable, farm-to-table ingredients and preserving culinary heritage.`,
    location: 'Los Angeles, CA',
    specialties: ['Mexican', 'Latin American', 'Farm-to-Table', 'Vegan Mexican'],
    hourlyRate: '125',
    profilePhoto: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop',
    experience: '15 years',
    languagesSpoken: ['English', 'Spanish'],
    dietaryAccommodations: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free'],
    signatureDishes: ['Mole Negro', 'Cochinita Pibil', 'Vegan Pozole', 'Churros con Cajeta'],
    availableServices: ['Private Dinners', 'Cooking Classes', 'Menu Consultation', 'Event Catering'],
    maxPartySize: 50
  },
  {
    email: 'james.chen@example.com',
    name: 'Chef James Chen',
    bio: `Executive Chef with 20 years of experience in Pan-Asian cuisine. Former head chef at Michelin-starred Koi Restaurant. Expert in Japanese kaiseki, Chinese regional cuisines, and modern Asian fusion. Trained at Le Cordon Bleu Tokyo and worked under Iron Chef Morimoto. Known for artistic plating and innovative flavor combinations using molecular gastronomy techniques.`,
    location: 'San Francisco, CA',
    specialties: ['Japanese', 'Chinese', 'Korean', 'Asian Fusion', 'Sushi', 'Molecular Gastronomy'],
    hourlyRate: '175',
    profilePhoto: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=400&fit=crop',
    experience: '20 years',
    languagesSpoken: ['English', 'Mandarin', 'Japanese', 'Cantonese'],
    dietaryAccommodations: ['Vegetarian', 'Pescatarian', 'Gluten-Free', 'Halal'],
    signatureDishes: ['Omakase Sushi', 'Peking Duck', 'Wagyu Beef Tataki', 'Miso Black Cod'],
    availableServices: ['Private Dining', 'Sushi Bar Experience', 'Corporate Events', 'Cooking Demonstrations'],
    maxPartySize: 40
  },
  {
    email: 'isabella.rossi@example.com',
    name: 'Chef Isabella Rossi',
    bio: `Third-generation Italian chef from Rome, bringing authentic family recipes passed down through generations. Graduate of Alma International School of Italian Cuisine. Specializes in handmade pasta, traditional Roman dishes, and modern Italian cuisine. Winner of James Beard Award for Best Chef Northeast 2022. Regular guest on Food Network's "Ciao Italia".`,
    location: 'New York, NY',
    specialties: ['Italian', 'Mediterranean', 'Pasta Making', 'Pizza', 'Wine Pairing'],
    hourlyRate: '150',
    profilePhoto: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=400&fit=crop',
    experience: '18 years',
    languagesSpoken: ['English', 'Italian', 'French', 'Spanish'],
    dietaryAccommodations: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Kosher'],
    signatureDishes: ['Cacio e Pepe', 'Osso Buco', 'Handmade Ravioli', 'Tiramisu'],
    availableServices: ['Private Dinners', 'Pasta Making Classes', 'Wine Dinners', 'Wedding Catering'],
    maxPartySize: 80
  },
  {
    email: 'michael.thompson@example.com',
    name: 'Chef Michael "Big Mike" Thompson',
    bio: `BBQ pitmaster and Southern cuisine expert with roots in Texas Hill Country. Champion of Memphis in May BBQ Competition (2021, 2022). Specializes in low-and-slow smoking techniques, traditional Texas brisket, and elevated Southern comfort food. Former executive chef at Franklin Barbecue. Author of "Smoke & Soul: Modern BBQ Techniques".`,
    location: 'Austin, TX',
    specialties: ['BBQ', 'Southern', 'Cajun', 'Texan', 'Smoking & Grilling'],
    hourlyRate: '100',
    profilePhoto: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400&h=400&fit=crop',
    experience: '12 years',
    languagesSpoken: ['English'],
    dietaryAccommodations: ['Gluten-Free', 'Dairy-Free'],
    signatureDishes: ['12-Hour Smoked Brisket', 'Memphis Dry Rub Ribs', 'Cajun Fried Chicken', 'Pecan Pie'],
    availableServices: ['BBQ Catering', 'Outdoor Events', 'Smoking Classes', 'Corporate Picnics'],
    maxPartySize: 200
  },
  {
    email: 'sarah.williams@example.com',
    name: 'Chef Sarah Williams',
    bio: `Plant-based culinary innovator and certified nutritionist. Graduate of Natural Gourmet Institute. Specializes in creative vegan cuisine that converts even the most dedicated carnivores. Former head chef at Crossroads Kitchen LA. Author of two bestselling cookbooks on plant-based fine dining. Regular contributor to VegNews Magazine.`,
    location: 'Portland, OR',
    specialties: ['Vegan', 'Plant-Based', 'Raw Food', 'Ayurvedic', 'Gluten-Free Baking'],
    hourlyRate: '110',
    profilePhoto: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400&h=400&fit=crop',
    experience: '10 years',
    languagesSpoken: ['English', 'Spanish'],
    dietaryAccommodations: ['Vegan', 'Gluten-Free', 'Raw', 'Nut-Free', 'Soy-Free'],
    signatureDishes: ['Cashew Cheese Lasagna', 'Raw Rainbow Pad Thai', 'Jackfruit Tacos', 'Chocolate Avocado Mousse'],
    availableServices: ['Private Chef Services', 'Meal Prep', 'Nutrition Workshops', 'Retreat Catering'],
    maxPartySize: 60
  },
  {
    email: 'pierre.dubois@example.com',
    name: 'Chef Pierre Dubois',
    bio: `Classically trained French chef from Lyon with Michelin three-star experience. Former sous chef at Le Bernardin NYC. Graduate of Institut Paul Bocuse. Master of traditional French techniques with modern presentation. Specializes in seasonal tasting menus and wine pairings. Member of Les Maîtres Cuisiniers de France.`,
    location: 'Chicago, IL',
    specialties: ['French', 'Fine Dining', 'Molecular Gastronomy', 'Pastries', 'Wine Pairing'],
    hourlyRate: '200',
    profilePhoto: 'https://images.unsplash.com/photo-1559575003-fb4ee38a747d?w=400&h=400&fit=crop',
    experience: '25 years',
    languagesSpoken: ['English', 'French', 'German'],
    dietaryAccommodations: ['Vegetarian', 'Pescatarian', 'Gluten-Free'],
    signatureDishes: ['Duck Confit', 'Bouillabaisse', 'Soufflé Grand Marnier', 'Foie Gras Terrine'],
    availableServices: ['Tasting Menus', 'Wine Dinners', 'Cooking Masterclasses', 'Luxury Events'],
    maxPartySize: 30
  },
  {
    email: 'aisha.patel@example.com',
    name: 'Chef Aisha Patel',
    bio: `Celebrated Indian chef specializing in regional cuisines from Gujarat to Kerala. Trained at Oberoi Hotels and winner of Food Network's "Chopped Champions". Expert in traditional tandoori cooking, complex spice blending, and modern Indian fusion. Conducts popular spice workshops and authored "The New Indian Kitchen" cookbook.`,
    location: 'Seattle, WA',
    specialties: ['Indian', 'South Asian', 'Street Food', 'Tandoori', 'Indo-Chinese'],
    hourlyRate: '95',
    profilePhoto: 'https://images.unsplash.com/photo-1574966740793-953ad374e8ae?w=400&h=400&fit=crop',
    experience: '14 years',
    languagesSpoken: ['English', 'Hindi', 'Gujarati', 'Tamil'],
    dietaryAccommodations: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Jain'],
    signatureDishes: ['Butter Chicken', 'Dosa Variations', 'Biryani', 'Ras Malai'],
    availableServices: ['Private Dinners', 'Spice Workshops', 'Festival Catering', 'Corporate Events'],
    maxPartySize: 100
  },
  {
    email: 'carlos.martinez@example.com',
    name: 'Chef Carlos Martinez',
    bio: `Master of Spanish cuisine with expertise in traditional paella and modern tapas. Trained in Valencia and Barcelona, with stages at El Celler de Can Roca. Specializes in authentic paella cooked over wood fire, jamón ibérico carving, and contemporary Spanish gastronomy. Featured in Saveur Magazine's "Best New Chefs".`,
    location: 'Miami, FL',
    specialties: ['Spanish', 'Paella', 'Tapas', 'Mediterranean', 'Seafood'],
    hourlyRate: '130',
    profilePhoto: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&h=400&fit=crop',
    experience: '16 years',
    languagesSpoken: ['English', 'Spanish', 'Catalan', 'Portuguese'],
    dietaryAccommodations: ['Gluten-Free', 'Pescatarian', 'Dairy-Free'],
    signatureDishes: ['Paella Valenciana', 'Pulpo a la Gallega', 'Gazpacho', 'Crema Catalana'],
    availableServices: ['Paella Parties', 'Tapas Events', 'Wine Tastings', 'Outdoor Catering'],
    maxPartySize: 150
  }
];

async function updateChefProfiles() {
  try {
    console.log('Updating chef profiles with detailed information...\n');
    
    for (const chef of chefUpdates) {
      try {
        // First, get the user ID
        const userResult = await pool.query(
          'SELECT id FROM users WHERE email = $1',
          [chef.email]
        );
        
        if (userResult.rows.length === 0) {
          console.log(`Chef ${chef.email} not found, skipping...`);
          continue;
        }
        
        const userId = userResult.rows[0].id;
        
        // Update basic fields that exist in the users table
        await pool.query(
          `UPDATE users 
           SET name = $1
           WHERE id = $2`,
          [chef.name, userId]
        );
        
        console.log(`✓ Updated profile for ${chef.name}`);
        console.log(`  - Bio: ${chef.bio.substring(0, 80)}...`);
        console.log(`  - Location: ${chef.location}`);
        console.log(`  - Hourly Rate: $${chef.hourlyRate}/hour`);
        console.log(`  - Specialties: ${chef.specialties.join(', ')}`);
        console.log(`  - Languages: ${chef.languagesSpoken.join(', ')}`);
        console.log('');
        
      } catch (error) {
        console.error(`Error updating ${chef.email}:`, error);
      }
    }
    
    console.log('\nChef profiles updated successfully!');
    console.log('\nNote: Due to database schema limitations, only the name field was updated.');
    console.log('The complete profile data is available in the getAllChefs() method which provides:');
    console.log('- Professional bios and backgrounds');
    console.log('- Real profile photos');
    console.log('- Detailed specialties and services');
    console.log('- Signature dishes and dietary accommodations');
    
  } catch (error) {
    console.error('Error updating profiles:', error);
  } finally {
    await pool.end();
  }
}

// Run the update script
updateChefProfiles();