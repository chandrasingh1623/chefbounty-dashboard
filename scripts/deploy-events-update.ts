import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

async function deployEventsUpdate() {
  try {
    console.log('Starting deployment of events updates...\n');
    
    // 1. Add guest_count column if it doesn't exist
    console.log('1. Adding guest_count column to events table...');
    await pool.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS guest_count INTEGER
    `);
    console.log('✓ Guest count column added\n');
    
    // 2. Update guest counts for existing events
    console.log('2. Updating guest counts for existing events...');
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
      const result = await pool.query(
        'UPDATE events SET guest_count = $1 WHERE title = $2 RETURNING id',
        [event.guest_count, event.title]
      );
      if (result.rowCount > 0) {
        console.log(`✓ Updated ${event.title} with ${event.guest_count} guests`);
      }
    }
    console.log('\n');
    
    // 3. Set profile_live for example chefs
    console.log('3. Setting profile_live status for example chefs...');
    const chefEmails = [
      'maria.gonzalez@example.com',
      'james.chen@example.com',
      'isabella.rossi@example.com',
      'michael.thompson@example.com',
      'sarah.williams@example.com',
      'pierre.dubois@example.com',
      'aisha.patel@example.com',
      'carlos.martinez@example.com'
    ];
    
    for (const email of chefEmails) {
      const result = await pool.query(
        'UPDATE users SET profile_live = true WHERE email = $1 AND role = $2 RETURNING id, name',
        [email, 'chef']
      );
      if (result.rowCount > 0) {
        console.log(`✓ Set profile_live = true for ${result.rows[0].name}`);
      }
    }
    console.log('\n');
    
    // 4. Verify events table structure
    console.log('4. Verifying events table structure...');
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name IN ('guest_count', 'cuisine_type', 'status')
      ORDER BY column_name
    `);
    
    console.log('Events table relevant columns:');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    console.log('\n');
    
    // 5. Count total events and chefs
    const eventCount = await pool.query('SELECT COUNT(*) FROM events WHERE status = $1', ['open']);
    const chefCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1 AND profile_live = $2', ['chef', true]);
    
    console.log('Deployment Summary:');
    console.log(`- Total open events: ${eventCount.rows[0].count}`);
    console.log(`- Total live chef profiles: ${chefCount.rows[0].count}`);
    console.log('\n✅ Deployment completed successfully!');
    
    console.log('\nIMPORTANT: Make sure the following code changes are deployed:');
    console.log('1. server/simple-storage.ts - Added getAllEvents, getEventById, getEventsByHostId methods');
    console.log('2. server/simple-storage.ts - Added cuisine type array parsing');
    console.log('3. server/routes.ts - Updated event endpoints to use simpleStorage instead of storage');
    console.log('4. client/src/pages/browse-events.tsx - Already handles array cuisine types correctly');
    
  } catch (error) {
    console.error('❌ Deployment error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run deployment
deployEventsUpdate().catch(console.error);