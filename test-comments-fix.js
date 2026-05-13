// Test comments API fix for POST /api/order-comments (without orderId in path)
const BASE_URL = 'http://localhost:8081';

async function testCommentsFix() {
    console.log('=== COMMENTS API FIX TEST ===');
    
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
        console.log('✅ Login successful');
        
        // Test 1: POST /api/order-comments (with orderId in body)
        console.log('\n1. Testing POST /api/order-comments (with orderId in body)...');
        const postResponse1 = await fetch(`${BASE_URL}/api/order-comments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: 3,
                content: 'Test comment via POST /api/order-comments with orderId in body'
            })
        });
        
        console.log('POST Status:', postResponse1.status);
        const postText1 = await postResponse1.text();
        console.log('POST Response:', postText1);
        
        // Test 2: POST /api/order-comments/3 (with orderId in path)
        console.log('\n2. Testing POST /api/order-comments/3 (with orderId in path)...');
        const postResponse2 = await fetch(`${BASE_URL}/api/order-comments/3`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: 'Test comment via POST /api/order-comments/3 with orderId in path'
            })
        });
        
        console.log('POST Status:', postResponse2.status);
        const postText2 = await postResponse2.text();
        console.log('POST Response:', postText2);
        
        // Test 3: GET comments to see all comments
        console.log('\n3. Testing GET /api/order-comments/3...');
        const getResponse = await fetch(`${BASE_URL}/api/order-comments/3`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('GET Status:', getResponse.status);
        const getText = await getResponse.text();
        console.log('GET Response:', getText);
        
        // Wait a bit for AI analytics to process
        console.log('\n4. Waiting 5 seconds for AI analytics to process...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('\n=== TEST SUMMARY ===');
        if (postResponse1.status === 200) {
            console.log('✅ POST /api/order-comments (body) works');
        } else {
            console.log('❌ POST /api/order-comments (body) failed');
        }
        
        if (postResponse2.status === 200) {
            console.log('✅ POST /api/order-comments/3 (path) works');
        } else {
            console.log('❌ POST /api/order-comments/3 (path) failed');
        }
        
        if (getResponse.status === 200) {
            console.log('✅ GET comments works');
        } else {
            console.log('❌ GET comments failed');
        }
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testCommentsFix();
