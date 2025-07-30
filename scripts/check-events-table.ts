import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

async function checkEventsTable() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      ORDER BY ordinal_position
    `);
    
    console.log('Events table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('Error checking table:', error);
  } finally {
    await pool.end();
  }
}

checkEventsTable();