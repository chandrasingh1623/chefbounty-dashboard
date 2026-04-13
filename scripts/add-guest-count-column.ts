import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

async function addGuestCountColumn() {
  try {
    console.log('Adding guest_count column to events table...');
    
    // Add the column if it doesn't exist
    await pool.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS guest_count INTEGER
    `);
    
    // Update existing events with guest count data based on the script values
    const guestCounts = [
      { title: 'Golden Anniversary Garden Party', guest_count: 65 },
      { title: 'Tech Startup Summer BBQ Bash', guest_count: 120 },
      { title: 'Michelin-Star Anniversary Dinner', guest_count: 2 },
      { title: 'Sustainable Vegan Wedding Reception', guest_count: 175 },
      { title: 'Diwali Festival of Lights Celebration', guest_count: 80 },
      { title: 'Wine Collectors Annual Tasting Dinner', guest_count: 16 },
      { title: 'Celebrity Chef Pop-Up Experience', guest_count: 24 },
      { title: 'Farm-to-Fork Harvest Dinner', guest_count: 100 },
      { title: 'Diplomatic Reception Dinner', guest_count: 50 },
      { title: 'Japanese Tea Ceremony & Kaiseki Dinner', guest_count: 12 }
    ];
    
    for (const event of guestCounts) {
      await pool.query(
        'UPDATE events SET guest_count = $1 WHERE title = $2',
        [event.guest_count, event.title]
      );
      console.log(`✓ Updated ${event.title} with ${event.guest_count} guests`);
    }
    
    console.log('\nGuest count column added and data updated successfully!');
    
  } catch (error) {
    console.error('Error adding guest count column:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
addGuestCountColumn();