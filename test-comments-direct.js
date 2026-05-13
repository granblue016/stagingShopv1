// Test comments API directly with correct URL
const BASE_URL = 'http://localhost:8081';

async function testCommentsDirect() {
    console.log('=== DIRECT COMMENTS API TEST ===');
    
    try {
        // Login
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin_test@shopcart.dev',
                password: 'Admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
            console.error('Login failed');
            return;
        }
        
        const token = loginData.token;
        console.log('Login successful');
        
        // Test comments API directly with correct URL
        console.log('Testing GET /api/order-comments/3...');
        const getResponse = await fetch(`${BASE_URL}/api/order-comments/3`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('GET Status:', getResponse.status);
        const getText = await getResponse.text();
        console.log('GET Response:', getText);
        
        // Test POST comments API directly with correct URL
        console.log('\nTesting POST /api/order-comments/3...');
        const postResponse = await fetch(`${BASE_URL}/api/order-comments/3`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: 'This is a test comment for order 3'
            })
        });
        
        console.log('POST Status:', postResponse.status);
        const postText = await postResponse.text();
        console.log('POST Response:', postText);
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testCommentsDirect();
