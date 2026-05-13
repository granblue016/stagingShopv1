// Test JSON parsing with DTO
const BASE_URL = 'http://localhost:8081';

async function testJsonParsing() {
    console.log('=== JSON PARSING TEST ===');
    
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
        
        // Test JSON parsing endpoint
        console.log('Testing JSON parsing endpoint...');
        const jsonTestResponse = await fetch(`${BASE_URL}/api/admin/test-json`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                stockQuantity: 150
            })
        });
        
        console.log('JSON Test Status:', jsonTestResponse.status);
        const jsonTestText = await jsonTestResponse.text();
        console.log('JSON Test Response:', jsonTestText);
        
        // Test inventory update
        console.log('\nTesting inventory update...');
        const inventoryResponse = await fetch(`${BASE_URL}/api/admin/inventory/3/stock`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                stockQuantity: 200
            })
        });
        
        console.log('Inventory Status:', inventoryResponse.status);
        const inventoryText = await inventoryResponse.text();
        console.log('Inventory Response:', inventoryText);
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testJsonParsing();
