const axios = require('axios');

// Test direct API access to backend
async function testBackendAPI() {
  try {
    const response = await axios.get('http://localhost:5000/api/hello');
    console.log('API test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error testing API:', error.message);
    return null;
  }
}

// Run the test
testBackendAPI();
