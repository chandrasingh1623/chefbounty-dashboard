# Deployment Notes - Events and Chefs Update

## Overview
This deployment adds realistic example events and chef profiles to populate the Browse sections of the platform.

## Database Changes

### 1. Events Table
- Added `guest_count` column (INTEGER)
- Populated 10 example events with realistic data
- Events use PostgreSQL array type for `cuisine_type` field

### 2. Users Table  
- Set `profile_live = true` for 8 example chef profiles
- Chef profiles already have detailed information in the getAllChefs() method

## Code Changes

### Backend (server/)

1. **server/simple-storage.ts**
   - Added `getAllEvents()` method to fetch events from PostgreSQL
   - Added `getEventById()` method  
   - Added `getEventsByHostId()` method
   - Added cuisine type array parsing to convert PostgreSQL format `{"Italian","Mediterranean"}` to JavaScript arrays
   - All methods include `guest_count` field

2. **server/routes.ts**
   - Updated `/api/events` to use `simpleStorage.getAllEvents()`
   - Updated `/api/events/browse` to use `simpleStorage.getAllEvents()`
   - Updated `/api/events/:id` to use `simpleStorage.getEventById()`
   - Updated `/api/events/host/:hostId` to use `simpleStorage.getEventsByHostId()`

### Frontend (client/)
- No changes needed - browse-events.tsx already handles array cuisine types correctly
- Guest count displays properly with actual numbers

## Deployment Steps

1. **Run the deployment script**:
   ```bash
   npx tsx scripts/deploy-events-update.ts
   ```
   This script will:
   - Add guest_count column if missing
   - Update guest counts for all example events
   - Set profile_live = true for example chefs
   - Verify the database structure

2. **Deploy code changes**:
   - Push all changes to your repository
   - Deploy the updated server code with the new simpleStorage methods

3. **Verify deployment**:
   - Check Browse Events shows 10 events with proper cuisine formatting
   - Check Browse Chefs shows 8 chef profiles
   - Verify guest counts display as numbers (e.g., "65 people")
   - Verify cuisine types display without brackets (e.g., "Italian, Mediterranean")

## Example Data Created

### Events (10 total)
- Golden Anniversary Garden Party - Beverly Hills, $5000, 65 guests
- Tech Startup Summer BBQ Bash - Austin, $8000, 120 guests  
- Michelin-Star Anniversary Dinner - Manhattan, $2000, 2 guests
- Sustainable Vegan Wedding Reception - Portland, $15000, 175 guests
- Diwali Festival Celebration - Seattle, $4500, 80 guests
- Wine Collectors Tasting Dinner - Napa Valley, $6000, 16 guests
- Celebrity Chef Pop-Up - Los Angeles, $10000, 24 guests
- Farm-to-Fork Harvest Dinner - Sonoma, $7500, 100 guests
- Diplomatic Reception - Washington DC, $12000, 50 guests
- Japanese Tea Ceremony - San Francisco, $5500, 12 guests

### Chefs (8 profiles)
- Chef Maria Gonzalez - Mexican/Latin cuisine, Los Angeles
- Chef James Chen - Pan-Asian/Japanese, San Francisco  
- Chef Isabella Rossi - Italian/Mediterranean, New York
- Chef Michael Thompson - BBQ/Southern, Austin
- Chef Sarah Williams - Vegan/Plant-based, Portland
- Chef Pierre Dubois - French/Fine Dining, Chicago
- Chef Aisha Patel - Indian/South Asian, Seattle
- Chef Carlos Martinez - Spanish/Paella, Miami

## Rollback Plan
If issues occur:
1. Remove guest_count column: `ALTER TABLE events DROP COLUMN guest_count;`
2. Set all chef profiles to not live: `UPDATE users SET profile_live = false WHERE role = 'chef';`
3. Revert code changes to use Neon storage instead of simpleStorage