-- Migration: Add Events and Chef Profiles
-- Date: 2025-09-04
-- Description: Adds guest_count column to events and populates example data

-- 1. Add guest_count column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS guest_count INTEGER;

-- 2. Update guest counts for existing events (if they match our example titles)
UPDATE events SET guest_count = 65 WHERE title = 'Golden Anniversary Garden Party';
UPDATE events SET guest_count = 120 WHERE title = 'Tech Startup Summer BBQ Bash';
UPDATE events SET guest_count = 2 WHERE title = 'Michelin-Star Anniversary Dinner';
UPDATE events SET guest_count = 175 WHERE title = 'Sustainable Vegan Wedding Reception';
UPDATE events SET guest_count = 80 WHERE title = 'Diwali Festival of Lights Celebration';
UPDATE events SET guest_count = 16 WHERE title = 'Wine Collectors Annual Tasting Dinner';
UPDATE events SET guest_count = 24 WHERE title = 'Celebrity Chef Pop-Up Experience';
UPDATE events SET guest_count = 100 WHERE title = 'Farm-to-Fork Harvest Dinner';
UPDATE events SET guest_count = 50 WHERE title = 'Diplomatic Reception Dinner';
UPDATE events SET guest_count = 12 WHERE title = 'Japanese Tea Ceremony & Kaiseki Dinner';

-- 3. Set profile_live for example chef profiles
UPDATE users SET profile_live = true 
WHERE role = 'chef' 
AND email IN (
  'maria.gonzalez@example.com',
  'james.chen@example.com',
  'isabella.rossi@example.com',
  'michael.thompson@example.com',
  'sarah.williams@example.com',
  'pierre.dubois@example.com',
  'aisha.patel@example.com',
  'carlos.martinez@example.com'
);

-- 4. Add index on events.status for performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- 5. Add index on users.profile_live for chef queries
CREATE INDEX IF NOT EXISTS idx_users_profile_live ON users(profile_live) WHERE role = 'chef';