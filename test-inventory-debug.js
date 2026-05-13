// Debug test for inventory update
const BASE_URL = 'http://localhost:8081';

async function testInventoryDebug() {
    console.log('=== DEBUG INVENTORY TEST ===');
    
    try {
        // Test without authentication first
        console.log('Testing inventory update WITHOUT authentication...');
        const putResponse = await fetch(`${BASE_URL}/api/admin/inventory/3/stock`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                stockQuantity: 150
            })
        });
        
        console.log('PUT Status (no auth):', putResponse.status);
        const putText = await putResponse.text();
        console.log('PUT Response (no auth):', putText);
        
        // Test with authentication
        console.log('\nTesting with authentication...');
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
        
        if (loginResponse.ok && loginData.token) {
            const token = loginData.token;
            console.log('Token received, testing inventory update...');
            
            const putResponse2 = await fetch(`${BASE_URL}/api/admin/inventory/3/stock`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    stockQuantity: 200
                })
            });
            
            console.log('PUT Status (with auth):', putResponse2.status);
            const putText2 = await putResponse2.text();
            console.log('PUT Response (with auth):', putText2);
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testInventoryDebug();
