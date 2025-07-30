import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

async function createEventsTable() {
  try {
    console.log('Creating events table in PostgreSQL...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        host_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date TIMESTAMP,
        duration INTEGER,
        location VARCHAR(255),
        budget INTEGER,
        cuisine_type TEXT[],
        dietary_restrictions TEXT[],
        venue_type VARCHAR(100),
        meal_type VARCHAR(100),
        beverage_service BOOLEAN DEFAULT false,
        alcohol_included BOOLEAN DEFAULT false,
        chef_attire VARCHAR(100),
        onsite_cooking BOOLEAN DEFAULT false,
        serving_staff BOOLEAN DEFAULT false,
        setup_cleanup BOOLEAN DEFAULT false,
        kitchen_availability VARCHAR(100),
        parking_accessibility TEXT,
        indoor_outdoor VARCHAR(100),
        event_theme VARCHAR(100),
        menu_flexibility VARCHAR(100),
        presentation_style VARCHAR(100),
        proposed_menu TEXT,
        special_requests TEXT,
        guest_count INTEGER,
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Events table created successfully!');
    
  } catch (error) {
    console.error('Error creating events table:', error);
  } finally {
    await pool.end();
  }
}

// Run the create table script
createEventsTable();