// Simple test script to check frontend API connectivity
const API_BASE_URL = 'http://127.0.0.1:8000/api/';

async function testAPI() {
    console.log('🔍 Testing Frontend API Connectivity...');
    console.log('=' * 40);
    
    try {
        // Test 1: Check if API is reachable
        console.log('🧪 Testing API reachability...');
        const response = await fetch(`${API_BASE_URL}mentor/public/`);
        if (response.ok) {
            console.log('✅ API is reachable');
        } else {
            console.log(`❌ API returned status: ${response.status}`);
        }
    } catch (error) {
        console.log('❌ API connection failed:', error.message);
    }
    
    try {
        // Test 2: Check CORS
        console.log('🧪 Testing CORS...');
        const response = await fetch(`${API_BASE_URL}mentor/public/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            console.log('✅ CORS is working');
        } else {
            console.log(`❌ CORS issue: ${response.status}`);
        }
    } catch (error) {
        console.log('❌ CORS test failed:', error.message);
    }
    
    console.log('=' * 40);
    console.log('📊 Frontend API test completed');
}

// Run the test
testAPI(); 