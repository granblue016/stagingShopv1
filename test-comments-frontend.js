// Test comments API through frontend route translation
const BASE_URL = 'http://localhost:8080'; // Frontend port

async function testCommentsFrontend() {
    console.log('=== FRONTEND COMMENTS API TEST ===');
    
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
        
        const loginText = await loginResponse.text();
        console.log('Login response:', loginResponse.status, loginText);
        
        if (!loginResponse.ok) {
            console.error('Login failed');
            return;
        }
        
        let loginData;
        try {
            loginData = JSON.parse(loginText);
        } catch (e) {
            console.error('Failed to parse login response');
            return;
        }
        
        const token = loginData.token;
        console.log('Login successful');
        
        // Test comments API through frontend route translation
        console.log('Testing GET /api/orders/3/comments through frontend...');
        const getResponse = await fetch(`${BASE_URL}/api/orders/3/comments`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('GET Status:', getResponse.status);
        const getText = await getResponse.text();
        console.log('GET Response:', getText);
        
        // Test POST comments API through frontend route translation
        console.log('\nTesting POST /api/orders/3/comments through frontend...');
        const postResponse = await fetch(`${BASE_URL}/api/orders/3/comments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: 'This is a test comment through frontend route translation'
            })
        });
        
        console.log('POST Status:', postResponse.status);
        const postText = await postResponse.text();
        console.log('POST Response:', postText);
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testCommentsFrontend();
