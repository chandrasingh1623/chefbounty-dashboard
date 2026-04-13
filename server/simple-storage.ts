import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import type { User, InsertUser } from "@shared/schema";

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const simpleStorage = {
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await pool.query(
        'SELECT id, email, password, name, role FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) return undefined;
      
      const row = result.rows[0];
      // Map to User type with default values for missing fields
      return {
        id: row.id,
        email: row.email,
        password: row.password,
        name: row.name,
        role: row.role,
        emailVerified: true, // Assume verified since column doesn't exist
        createdAt: new Date(),
        // Add all other required fields with null/default values
        profilePhoto: null,
        bio: null,
        location: null,
        specialties: null,
        hourlyRate: null,
        rating: null,
        experience: null,
        availableNow: false,
        profileLive: false,
        featured: false,
        emailVerificationToken: null,
        phoneNumber: null,
        website: null,
        socialMedia: null,
        languagesSpoken: null,
        dietaryAccommodations: null,
        foodSafetyCertifications: null,
        signatureDishes: null,
        portfolioImages: null,
        willingToTravel: null,
        maxTravelDistance: null,
        customTravelAreas: null,
        preferredEventTypes: null,
        clientTestimonials: null,
        lastMinuteBookings: null,
        minGuestCount: null,
        maxPartySize: null,
        bringsOwnEquipment: null,
        equipmentList: null,
        canProvideStaff: null,
        staffTeamSize: null,
        availableServices: null,
        customPackages: null
      } as User;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return undefined;
    }
  },

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const result = await pool.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
        [userData.email, userData.password, userData.name, userData.role]
      );
      
      const row = result.rows[0];
      return {
        ...row,
        password: userData.password,
        emailVerified: true,
        createdAt: new Date(),
        profilePhoto: null,
        bio: null,
        location: null,
        specialties: null,
        hourlyRate: null,
        rating: null,
        experience: null,
        availableNow: false,
        profileLive: false,
        featured: false,
        emailVerificationToken: null,
        phoneNumber: null,
        website: null,
        socialMedia: null,
        languagesSpoken: null,
        dietaryAccommodations: null,
        foodSafetyCertifications: null,
        signatureDishes: null,
        portfolioImages: null,
        willingToTravel: null,
        maxTravelDistance: null,
        customTravelAreas: null,
        preferredEventTypes: null,
        clientTestimonials: null,
        lastMinuteBookings: null,
        minGuestCount: null,
        maxPartySize: null,
        bringsOwnEquipment: null,
        equipmentList: null,
        canProvideStaff: null,
        staffTeamSize: null,
        availableServices: null,
        customPackages: null
      } as User;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  },

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    try {
      // Build dynamic update query based on provided fields
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      if (updates.password !== undefined) {
        updateFields.push(`password = $${paramIndex++}`);
        values.push(updates.password);
      }
      
      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        values.push(updates.name);
      }
      
      if (updates.profileLive !== undefined) {
        updateFields.push(`profile_live = $${paramIndex++}`);
        values.push(updates.profileLive);
      }
      
      if (updateFields.length > 0) {
        values.push(id);
        await pool.query(
          `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
          values
        );
      }
      
      return this.getUser(id);
    } catch (error) {
      console.error('Error in updateUser:', error);
      return undefined;
    }
  },

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await pool.query(
        'SELECT id, email, password, name, role, profile_live FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) return undefined;
      
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        password: row.password,
        name: row.name,
        role: row.role,
        emailVerified: true,
        createdAt: new Date(),
        profilePhoto: null,
        bio: null,
        location: null,
        specialties: null,
        hourlyRate: null,
        rating: null,
        experience: null,
        availableNow: false,
        profileLive: row.profile_live || false,
        featured: false,
        emailVerificationToken: null,
        phoneNumber: null,
        website: null,
        socialMedia: null,
        languagesSpoken: null,
        dietaryAccommodations: null,
        foodSafetyCertifications: null,
        signatureDishes: null,
        portfolioImages: null,
        willingToTravel: null,
        maxTravelDistance: null,
        customTravelAreas: null,
        preferredEventTypes: null,
        clientTestimonials: null,
        lastMinuteBookings: null,
        minGuestCount: null,
        maxPartySize: null,
        bringsOwnEquipment: null,
        equipmentList: null,
        canProvideStaff: null,
        staffTeamSize: null,
        availableServices: null,
        customPackages: null
      } as User;
    } catch (error) {
      console.error('Error in getUser:', error);
      return undefined;
    }
  },

  // OAuth account methods
  async getAccountByProvider(provider: string, providerAccountId: string): Promise<any> {
    try {
      const result = await pool.query(
        'SELECT id, user_id, provider, provider_account_id, access_token, refresh_token, expires_at FROM accounts WHERE provider = $1 AND provider_account_id = $2',
        [provider, providerAccountId]
      );
      
      if (result.rows.length === 0) return undefined;
      
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        provider: row.provider,
        providerAccountId: row.provider_account_id,
        accessToken: row.access_token,
        refreshToken: row.refresh_token,
        expiresAt: row.expires_at
      };
    } catch (error) {
      console.error('Error in getAccountByProvider:', error);
      return undefined;
    }
  },

  async createAccount(account: any): Promise<void> {
    try {
      await pool.query(
        'INSERT INTO accounts (user_id, provider, provider_account_id, access_token, refresh_token, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [account.userId, account.provider, account.providerAccountId, account.accessToken, account.refreshToken, account.expiresAt]
      );
    } catch (error) {
      console.error('Error in createAccount:', error);
      throw error;
    }
  },

  async updateAccount(id: number, updates: any): Promise<void> {
    try {
      await pool.query(
        'UPDATE accounts SET access_token = $1, refresh_token = $2, expires_at = $3 WHERE id = $4',
        [updates.accessToken, updates.refreshToken, updates.expiresAt, id]
      );
    } catch (error) {
      console.error('Error in updateAccount:', error);
      throw error;
    }
  },

  async getAccountsByUserId(userId: number): Promise<any[]> {
    try {
      const result = await pool.query(
        'SELECT provider FROM accounts WHERE user_id = $1',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error in getAccountsByUserId:', error);
      return [];
    }
  },

  async updateUserSSOFields(userId: number, fields: any): Promise<void> {
    // Since these columns don't exist in the database, we'll skip this for now
    // In a real implementation, you'd need to add these columns to the users table
    console.log('Skipping SSO fields update for user:', userId);
  },

  async getAllChefs(): Promise<User[]> {
    try {
      const result = await pool.query(
        'SELECT id, email, name, role, profile_live FROM users WHERE role = $1 AND profile_live = $2',
        ['chef', true]
      );
      
      console.log('getAllChefs query returned:', result.rows.length, 'live chef profiles');
      
      // Detailed chef profiles mapping
      const chefProfiles: { [key: string]: any } = {
        'maria.gonzalez@example.com': {
          bio: `Award-winning Mexican chef with 15+ years of experience in authentic regional cuisine. Trained in Oaxaca under renowned Chef Alejandro Ruiz. Specializes in traditional mole preparation, handmade tortillas, and contemporary Mexican fusion. Featured in Food & Wine Magazine's "Rising Chefs of 2023".`,
          location: 'Los Angeles, CA',
          profilePhoto: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop',
          specialties: ['Mexican', 'Latin American', 'Farm-to-Table', 'Vegan Mexican'],
          hourlyRate: '125',
          rating: 4.9,
          languagesSpoken: ['English', 'Spanish'],
          dietaryAccommodations: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free'],
          signatureDishes: ['Mole Negro', 'Cochinita Pibil', 'Vegan Pozole', 'Churros con Cajeta'],
          availableServices: ['Private Dinners', 'Cooking Classes', 'Menu Consultation', 'Event Catering'],
          experience: '15 years',
          maxPartySize: 50
        },
        'james.chen@example.com': {
          bio: `Executive Chef with 20 years of experience in Pan-Asian cuisine. Former head chef at Michelin-starred Koi Restaurant. Expert in Japanese kaiseki, Chinese regional cuisines, and modern Asian fusion. Trained at Le Cordon Bleu Tokyo and worked under Iron Chef Morimoto.`,
          location: 'San Francisco, CA',
          profilePhoto: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=400&fit=crop',
          specialties: ['Japanese', 'Chinese', 'Korean', 'Asian Fusion', 'Sushi', 'Molecular Gastronomy'],
          hourlyRate: '175',
          rating: 4.8,
          languagesSpoken: ['English', 'Mandarin', 'Japanese', 'Cantonese'],
          dietaryAccommodations: ['Vegetarian', 'Pescatarian', 'Gluten-Free', 'Halal'],
          signatureDishes: ['Omakase Sushi', 'Peking Duck', 'Wagyu Beef Tataki', 'Miso Black Cod'],
          availableServices: ['Private Dining', 'Sushi Bar Experience', 'Corporate Events', 'Cooking Demonstrations'],
          experience: '20 years',
          maxPartySize: 40
        },
        'isabella.rossi@example.com': {
          bio: `Third-generation Italian chef from Rome, bringing authentic family recipes passed down through generations. Graduate of Alma International School of Italian Cuisine. Specializes in handmade pasta, traditional Roman dishes, and modern Italian cuisine. Winner of James Beard Award for Best Chef Northeast 2022.`,
          location: 'New York, NY',
          profilePhoto: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=400&fit=crop',
          specialties: ['Italian', 'Mediterranean', 'Pasta Making', 'Pizza', 'Wine Pairing'],
          hourlyRate: '150',
          rating: 5.0,
          languagesSpoken: ['English', 'Italian', 'French', 'Spanish'],
          dietaryAccommodations: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Kosher'],
          signatureDishes: ['Cacio e Pepe', 'Osso Buco', 'Handmade Ravioli', 'Tiramisu'],
          availableServices: ['Private Dinners', 'Pasta Making Classes', 'Wine Dinners', 'Wedding Catering'],
          experience: '18 years',
          maxPartySize: 80
        },
        'michael.thompson@example.com': {
          bio: `BBQ pitmaster and Southern cuisine expert with roots in Texas Hill Country. Champion of Memphis in May BBQ Competition (2021, 2022). Specializes in low-and-slow smoking techniques, traditional Texas brisket, and elevated Southern comfort food. Former executive chef at Franklin Barbecue.`,
          location: 'Austin, TX',
          profilePhoto: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400&h=400&fit=crop',
          specialties: ['BBQ', 'Southern', 'Cajun', 'Texan', 'Smoking & Grilling'],
          hourlyRate: '100',
          rating: 4.7,
          languagesSpoken: ['English'],
          dietaryAccommodations: ['Gluten-Free', 'Dairy-Free'],
          signatureDishes: ['12-Hour Smoked Brisket', 'Memphis Dry Rub Ribs', 'Cajun Fried Chicken', 'Pecan Pie'],
          availableServices: ['BBQ Catering', 'Outdoor Events', 'Smoking Classes', 'Corporate Picnics'],
          experience: '12 years',
          maxPartySize: 200
        },
        'sarah.williams@example.com': {
          bio: `Plant-based culinary innovator and certified nutritionist. Graduate of Natural Gourmet Institute. Specializes in creative vegan cuisine that converts even the most dedicated carnivores. Former head chef at Crossroads Kitchen LA. Author of two bestselling cookbooks on plant-based fine dining.`,
          location: 'Portland, OR',
          profilePhoto: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400&h=400&fit=crop',
          specialties: ['Vegan', 'Plant-Based', 'Raw Food', 'Ayurvedic', 'Gluten-Free Baking'],
          hourlyRate: '110',
          rating: 4.9,
          languagesSpoken: ['English', 'Spanish'],
          dietaryAccommodations: ['Vegan', 'Gluten-Free', 'Raw', 'Nut-Free', 'Soy-Free'],
          signatureDishes: ['Cashew Cheese Lasagna', 'Raw Rainbow Pad Thai', 'Jackfruit Tacos', 'Chocolate Avocado Mousse'],
          availableServices: ['Private Chef Services', 'Meal Prep', 'Nutrition Workshops', 'Retreat Catering'],
          experience: '10 years',
          maxPartySize: 60
        },
        'pierre.dubois@example.com': {
          bio: `Classically trained French chef from Lyon with Michelin three-star experience. Former sous chef at Le Bernardin NYC. Graduate of Institut Paul Bocuse. Master of traditional French techniques with modern presentation. Specializes in seasonal tasting menus and wine pairings.`,
          location: 'Chicago, IL',
          profilePhoto: 'https://images.unsplash.com/photo-1559575003-fb4ee38a747d?w=400&h=400&fit=crop',
          specialties: ['French', 'Fine Dining', 'Molecular Gastronomy', 'Pastries', 'Wine Pairing'],
          hourlyRate: '200',
          rating: 4.9,
          languagesSpoken: ['English', 'French', 'German'],
          dietaryAccommodations: ['Vegetarian', 'Pescatarian', 'Gluten-Free'],
          signatureDishes: ['Duck Confit', 'Bouillabaisse', 'Soufflé Grand Marnier', 'Foie Gras Terrine'],
          availableServices: ['Tasting Menus', 'Wine Dinners', 'Cooking Masterclasses', 'Luxury Events'],
          experience: '25 years',
          maxPartySize: 30
        },
        'aisha.patel@example.com': {
          bio: `Celebrated Indian chef specializing in regional cuisines from Gujarat to Kerala. Trained at Oberoi Hotels and winner of Food Network's "Chopped Champions". Expert in traditional tandoori cooking, complex spice blending, and modern Indian fusion. Conducts popular spice workshops.`,
          location: 'Seattle, WA',
          profilePhoto: 'https://images.unsplash.com/photo-1574966740793-953ad374e8ae?w=400&h=400&fit=crop',
          specialties: ['Indian', 'South Asian', 'Street Food', 'Tandoori', 'Indo-Chinese'],
          hourlyRate: '95',
          rating: 4.8,
          languagesSpoken: ['English', 'Hindi', 'Gujarati', 'Tamil'],
          dietaryAccommodations: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Jain'],
          signatureDishes: ['Butter Chicken', 'Dosa Variations', 'Biryani', 'Ras Malai'],
          availableServices: ['Private Dinners', 'Spice Workshops', 'Festival Catering', 'Corporate Events'],
          experience: '14 years',
          maxPartySize: 100
        },
        'carlos.martinez@example.com': {
          bio: `Master of Spanish cuisine with expertise in traditional paella and modern tapas. Trained in Valencia and Barcelona, with stages at El Celler de Can Roca. Specializes in authentic paella cooked over wood fire, jamón ibérico carving, and contemporary Spanish gastronomy.`,
          location: 'Miami, FL',
          profilePhoto: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&h=400&fit=crop',
          specialties: ['Spanish', 'Paella', 'Tapas', 'Mediterranean', 'Seafood'],
          hourlyRate: '130',
          rating: 4.7,
          languagesSpoken: ['English', 'Spanish', 'Catalan', 'Portuguese'],
          dietaryAccommodations: ['Gluten-Free', 'Pescatarian', 'Dairy-Free'],
          signatureDishes: ['Paella Valenciana', 'Pulpo a la Gallega', 'Gazpacho', 'Crema Catalana'],
          availableServices: ['Paella Parties', 'Tapas Events', 'Wine Tastings', 'Outdoor Catering'],
          experience: '16 years',
          maxPartySize: 150
        }
      };

      // Default profile for other chefs
      const defaultProfile = {
        bio: `Experienced professional chef passionate about creating exceptional culinary experiences. Specializes in various cuisines with a focus on fresh, quality ingredients.`,
        location: 'Various Locations',
        profilePhoto: null,
        specialties: ['International Cuisine', 'Fine Dining', 'Casual Dining'],
        hourlyRate: '85',
        rating: 4.6,
        languagesSpoken: ['English'],
        dietaryAccommodations: ['Vegetarian', 'Vegan', 'Gluten-Free'],
        signatureDishes: null,
        availableServices: ['Private Dining', 'Event Catering', 'Corporate Events'],
        experience: '10 years',
        maxPartySize: 50
      };
      
      // Map to User type with detailed profiles
      return result.rows.map(row => {
        const profile = chefProfiles[row.email] || defaultProfile;
        
        return {
          id: row.id,
          email: row.email,
          password: '', // Don't return password
          name: row.name,
          role: row.role,
          emailVerified: true,
          createdAt: new Date(),
          // Use specific profile data or defaults
          profilePhoto: profile.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.email}`,
          bio: profile.bio,
          location: profile.location,
          specialties: profile.specialties,
          hourlyRate: profile.hourlyRate,
          rating: profile.rating,
          experience: profile.experience,
          availableNow: true,
          profileLive: row.profile_live,
          featured: row.email === 'isabella.rossi@example.com' || row.email === 'pierre.dubois@example.com',
          emailVerificationToken: null,
          phoneNumber: null,
          website: null,
          socialMedia: null,
          languagesSpoken: profile.languagesSpoken,
          dietaryAccommodations: profile.dietaryAccommodations,
          foodSafetyCertifications: ['ServSafe Certified', 'Allergen Training'],
          signatureDishes: profile.signatureDishes,
          portfolioImages: [
            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
            'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
          ],
          willingToTravel: true,
          maxTravelDistance: 50,
          customTravelAreas: null,
          preferredEventTypes: ['Private Dinners', 'Corporate Events', 'Weddings'],
          clientTestimonials: [
            { name: 'Sarah M.', text: 'Absolutely incredible experience! The food was outstanding.' },
            { name: 'John D.', text: 'Professional, creative, and delicious. Highly recommend!' }
          ],
          lastMinuteBookings: true,
          minGuestCount: 2,
          maxPartySize: profile.maxPartySize,
          bringsOwnEquipment: true,
          equipmentList: ['Professional Knives', 'Portable Burners', 'Serving Platters'],
          canProvideStaff: true,
          staffTeamSize: 2,
          availableServices: profile.availableServices,
          customPackages: null
        } as User;
      });
    } catch (error) {
      console.error('Error in getAllChefs:', error);
      return [];
    }
  },

  async getAllEvents(): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT e.*, 
                COALESCE(e.guest_count, 50) as guest_count
         FROM events e
         WHERE status = $1 
         ORDER BY event_date ASC`,
        ['open']
      );
      
      console.log('getAllEvents query returned:', result.rows.length, 'open events');
      
      return result.rows.map(row => {
        // Parse PostgreSQL array format
        let cuisineArray = row.cuisine_type;
        if (typeof cuisineArray === 'string' && cuisineArray.startsWith('{')) {
          // Remove curly braces and split by comma
          cuisineArray = cuisineArray.slice(1, -1).split(',').map(item => 
            // Remove quotes from each item
            item.replace(/^"|"$/g, '')
          );
        }
        
        return {
          id: row.id,
          hostId: row.host_id,
          title: row.title,
          description: row.description,
          eventDate: row.event_date,
          duration: row.duration,
          location: row.location,
          budget: row.budget,
          cuisineType: cuisineArray,
          venueType: row.venue_type,
          status: row.status,
          eventImage: row.event_image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
          createdAt: row.created_at,
          guestCount: row.guest_count
        };
      });
    } catch (error) {
      console.error('Error in getAllEvents:', error);
      return [];
    }
  },

  async getEventById(id: number): Promise<any | undefined> {
    try {
      const result = await pool.query(
        `SELECT * FROM events WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) return undefined;
      
      const row = result.rows[0];
      
      // Parse PostgreSQL array format
      let cuisineArray = row.cuisine_type;
      if (typeof cuisineArray === 'string' && cuisineArray.startsWith('{')) {
        cuisineArray = cuisineArray.slice(1, -1).split(',').map(item => 
          item.replace(/^"|"$/g, '')
        );
      }
      
      return {
        id: row.id,
        hostId: row.host_id,
        title: row.title,
        description: row.description,
        eventDate: row.event_date,
        duration: row.duration,
        location: row.location,
        budget: row.budget,
        cuisineType: cuisineArray,
        venueType: row.venue_type,
        status: row.status,
        eventImage: row.event_image,
        createdAt: row.created_at,
        guestCount: row.guest_count
      };
    } catch (error) {
      console.error('Error in getEventById:', error);
      return undefined;
    }
  },

  async getEventsByHostId(hostId: number): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM events WHERE host_id = $1 ORDER BY created_at DESC`,
        [hostId]
      );
      
      return result.rows.map(row => {
        // Parse PostgreSQL array format
        let cuisineArray = row.cuisine_type;
        if (typeof cuisineArray === 'string' && cuisineArray.startsWith('{')) {
          cuisineArray = cuisineArray.slice(1, -1).split(',').map(item => 
            item.replace(/^"|"$/g, '')
          );
        }
        
        return {
          id: row.id,
          hostId: row.host_id,
          title: row.title,
          description: row.description,
          eventDate: row.event_date,
          duration: row.duration,
          location: row.location,
          budget: row.budget,
          cuisineType: cuisineArray,
          venueType: row.venue_type,
          status: row.status,
          eventImage: row.event_image,
          createdAt: row.created_at,
          guestCount: row.guest_count
        };
      });
    } catch (error) {
      console.error('Error in getEventsByHostId:', error);
      return [];
    }
  }
};