import { DatabaseStorage } from './storage';
import { generateDemoChef, generateDemoHost, generateDemoEvent, generateDemoBid } from './demo-data-generator';
import { faker } from '@faker-js/faker';

const storage = new DatabaseStorage();

export async function seedDemoData() {
  console.log('🌱 Starting demo data generation...');
  
  try {
    // Check if demo data already exists (skip check for now to allow regeneration)
    // const existingUsers = await storage.getUsers();
    // const demoUsers = existingUsers.filter(user => 
    //   user.email?.includes('@demo.chefbounty.com') || 
    //   user.bio?.includes('DEMO_PROFILE')
    // );
    
    // if (demoUsers.length > 0) {
    //   console.log(`✅ Demo data already exists (${demoUsers.length} demo users found). Skipping generation.`);
    //   return {
    //     message: 'Demo data already exists',
    //     existingDemoUsers: demoUsers.length
    //   };
    // }

    // Generate demo hosts (5-8 hosts)
    console.log('👥 Generating demo hosts...');
    const hosts = [];
    const hostCount = faker.number.int({ min: 5, max: 8 });
    
    for (let i = 0; i < hostCount; i++) {
      const hostData = generateDemoHost();
      const host = await storage.createUser(hostData);
      hosts.push(host);
    }
    console.log(`✅ Created ${hosts.length} demo hosts`);

    // Generate demo chefs (15-20 chefs)
    console.log('👨‍🍳 Generating demo chefs...');
    const chefs = [];
    const chefCount = faker.number.int({ min: 15, max: 20 });
    
    for (let i = 0; i < chefCount; i++) {
      const chefData = generateDemoChef();
      const chef = await storage.createUser(chefData);
      chefs.push(chef);
    }
    console.log(`✅ Created ${chefs.length} demo chefs`);

    // Generate demo events (10-15 events)
    console.log('🎉 Generating demo events...');
    const events = [];
    const eventCount = faker.number.int({ min: 10, max: 15 });
    
    for (let i = 0; i < eventCount; i++) {
      const randomHost = faker.helpers.arrayElement(hosts);
      const eventData = generateDemoEvent(randomHost.id);
      const event = await storage.createEvent(eventData);
      events.push(event);
    }
    console.log(`✅ Created ${events.length} demo events`);

    // Generate demo bids (2-6 bids per event)
    console.log('💰 Generating demo bids...');
    let totalBids = 0;
    
    for (const event of events) {
      const bidCount = faker.number.int({ min: 2, max: 6 });
      const selectedChefs = faker.helpers.arrayElements(chefs, bidCount);
      
      for (const chef of selectedChefs) {
        const bidData = generateDemoBid(event.id, chef.id);
        await storage.createBid(bidData);
        totalBids++;
      }
    }
    console.log(`✅ Created ${totalBids} demo bids`);

    // Generate some notifications for demo purposes
    console.log('🔔 Generating demo notifications...');
    let notificationCount = 0;
    
    // Create notifications for a few chefs and hosts
    const sampleUsers = [...chefs.slice(0, 3), ...hosts.slice(0, 2)];
    
    for (const user of sampleUsers) {
      const notifications = [
        {
          userId: user.id,
          type: user.role === 'chef' ? 'bid_accepted' : 'new_bid',
          title: user.role === 'chef' ? 'Bid Accepted!' : 'New Bid Received',
          message: user.role === 'chef' 
            ? 'Congratulations! Your bid for a recent event has been accepted.'
            : 'A chef has submitted a new bid for one of your events.',
          isRead: faker.datatype.boolean({ probability: 0.3 })
        },
        {
          userId: user.id,
          type: 'new_message',
          title: 'New Message',
          message: 'You have received a new message about an upcoming event.',
          isRead: faker.datatype.boolean({ probability: 0.5 })
        }
      ];
      
      for (const notificationData of notifications) {
        await storage.createNotification(notificationData);
        notificationCount++;
      }
    }
    console.log(`✅ Created ${notificationCount} demo notifications`);

    const summary = {
      hosts: hosts.length,
      chefs: chefs.length,
      events: events.length,
      bids: totalBids,
      notifications: notificationCount,
      totalUsers: hosts.length + chefs.length
    };

    console.log('🎊 Demo data generation completed successfully!');
    console.log('📊 Summary:', summary);
    
    return {
      message: 'Demo data generated successfully',
      ...summary
    };

  } catch (error) {
    console.error('❌ Error generating demo data:', error);
    throw error;
  }
}

export async function clearDemoData() {
  console.log('🧹 Clearing demo data...');
  
  try {
    // This is a simplified approach - in a real app you'd want more sophisticated cleanup
    const users = await storage.getUsers();
    const demoUsers = users.filter(user => 
      user.email?.includes('@demo.chefbounty.com') || 
      user.bio?.includes('DEMO_PROFILE')
    );
    
    console.log(`Found ${demoUsers.length} demo users to clean up`);
    
    // Note: In a production system, you'd want to properly cascade delete
    // related records (events, bids, messages, notifications) first
    
    return {
      message: 'Demo data cleanup would be implemented here',
      demoUsersFound: demoUsers.length
    };
    
  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
    throw error;
  }
}