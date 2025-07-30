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
  },
  {
    email: 'james.chen@example.com',
    name: 'James Chen',
  },
  {
    email: 'isabella.rossi@example.com',
    name: 'Isabella Rossi',
  },
  {
    email: 'michael.thompson@example.com',
    name: 'Michael Thompson',
  },
  {
    email: 'sarah.williams@example.com',
    name: 'Sarah Williams',
  },
  {
    email: 'pierre.dubois@example.com',
    name: 'Pierre Dubois',
  },
  {
    email: 'aisha.patel@example.com',
    name: 'Aisha Patel',
  },
  {
    email: 'carlos.martinez@example.com',
    name: 'Carlos Martinez',
  }
];

async function populateChefs() {
  try {
    console.log('Creating chef profiles...');
    
    for (const chef of chefProfiles) {
      try {
        // Check if user already exists
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE email = $1',
          [chef.email]
        );
        
        if (existingUser.rows.length > 0) {
          console.log(`Chef ${chef.email} already exists, skipping...`);
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
        
        console.log(`Created chef profile for ${chef.name}`);
      } catch (error) {
        console.error(`Error creating chef ${chef.email}:`, error);
      }
    }
    
    console.log('\nChef profiles created!');
    console.log('\nYou can now browse chef profiles by logging in.');
    console.log('\nTest accounts:');
    console.log('- Chefs: [chef-email] / password123');
    
  } catch (error) {
    console.error('Error populating chefs:', error);
  } finally {
    await pool.end();
  }
}

// Run the population script
populateChefs();