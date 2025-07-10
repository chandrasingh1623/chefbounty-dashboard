// Simple script to generate demo data
const fetch = require('node-fetch');

async function generateDemoData() {
  try {
    console.log('🌱 Generating demo data...');
    
    const response = await fetch('http://localhost:5000/api/demo/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Demo data generated successfully:');
    console.log(`- ${result.hosts} host profiles`);
    console.log(`- ${result.chefs} chef profiles`);
    console.log(`- ${result.events} events`);
    console.log(`- ${result.bids} bids`);
    console.log(`- ${result.notifications} notifications`);
    
  } catch (error) {
    console.error('❌ Error generating demo data:', error.message);
  }
}

generateDemoData();