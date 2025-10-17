// Simple test script to verify API endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');

    // Test health check
    console.log('1. Testing health check...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check:', health.data.message);

    // Test profiles endpoint
    console.log('\n2. Testing profiles endpoint...');
    const profiles = await axios.get(`${API_BASE}/profiles`);
    console.log('✅ Profiles:', profiles.data.length, 'profiles found');

    // Test events endpoint
    console.log('\n3. Testing events endpoint...');
    const events = await axios.get(`${API_BASE}/events`);
    console.log('✅ Events:', events.data.length, 'events found');

    console.log('\n🎉 All API tests passed!');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
