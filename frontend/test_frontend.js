// Simple test script to check frontend API connectivity
const API_BASE_URL = 'http://127.0.0.1:8000/api/';

async function testAPI() {
    
    try {
        // Test 1: Check if API is reachable
        const response = await fetch(`${API_BASE_URL}mentor/public/`);
        if (response.ok) {
        } else {
        }
    } catch (error) {
    }
    
    try {
        // Test 2: Check CORS
        const response = await fetch(`${API_BASE_URL}mentor/public/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
        } else {
        }
    } catch (error) {
    }
    
}

// Run the test
testAPI(); 