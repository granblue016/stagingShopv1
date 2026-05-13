// Simple test for inventory update only
const BASE_URL = 'http://localhost:8081';

async function testInventorySimple() {
    console.log('=== SIMPLE INVENTORY TEST ===');
    
    try {
        // Step 1: Login
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
        console.log('Login:', loginResponse.status);
        
        if (!loginResponse.ok) {
            console.error('Login failed');
            return;
        }
        
        const token = loginData.token;
        
        // Step 2: Test inventory update with minimal payload
        console.log('Testing inventory update...');
        const putResponse = await fetch(`${BASE_URL}/api/admin/inventory/3/stock`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                stockQuantity: 150
            })
        });
        
        console.log('PUT Status:', putResponse.status);
        const putText = await putResponse.text();
        console.log('PUT Response:', putText);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testInventorySimple();
