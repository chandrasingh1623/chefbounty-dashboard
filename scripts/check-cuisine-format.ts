import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

async function checkCuisineFormat() {
  try {
    const result = await pool.query(
      `SELECT id, title, cuisine_type FROM events LIMIT 5`
    );
    
    console.log('Cuisine type format in database:');
    result.rows.forEach(row => {
      console.log(`\nEvent: ${row.title}`);
      console.log(`Cuisine type raw:`, row.cuisine_type);
      console.log(`Type:`, typeof row.cuisine_type);
      console.log(`Is Array:`, Array.isArray(row.cuisine_type));
    });
    
  } catch (error) {
    console.error('Error checking cuisine format:', error);
  } finally {
    await pool.end();
  }
}

checkCuisineFormat();