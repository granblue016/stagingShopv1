// Test admin endpoints
const BASE_URL = 'http://localhost:8081';

async function testAdminEndpoints() {
    console.log('=== ADMIN ENDPOINTS TEST ===');
    
    try {
        // Test 1: Test endpoint without authentication
        console.log('1. Testing /api/admin/test without authentication...');
        const testResponse = await fetch(`${BASE_URL}/api/admin/test`);
        console.log('Status:', testResponse.status);
        const testText = await testResponse.text();
        console.log('Response:', testText);
        
        // Test 2: Login and get token
        console.log('\n2. Login to get token...');
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
        console.log('Login Status:', loginResponse.status);
        
        if (!loginResponse.ok) {
            console.error('Login failed');
            return;
        }
        
        const token = loginData.token;
        console.log('Token received');
        
        // Test 3: Test endpoint with authentication
        console.log('\n3. Testing /api/admin/test WITH authentication...');
        const testResponse2 = await fetch(`${BASE_URL}/api/admin/test`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Status:', testResponse2.status);
        const testText2 = await testResponse2.text();
        console.log('Response:', testText2);
        
        // Test 4: Test inventory update
        console.log('\n4. Testing /api/admin/inventory/3/stock...');
        const inventoryResponse = await fetch(`${BASE_URL}/api/admin/inventory/3/stock`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                stockQuantity: 150
            })
        });
        console.log('Status:', inventoryResponse.status);
        const inventoryText = await inventoryResponse.text();
        console.log('Response:', inventoryText);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testAdminEndpoints();
