// Final test for inventory update with detailed debugging
const BASE_URL = 'http://localhost:8081';

async function testInventoryFinal() {
    console.log('=== FINAL INVENTORY TEST ===');
    
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
        
        // Test with exact payload format
        console.log('Testing inventory update with exact payload...');
        const payload = { stockQuantity: 150 };
        console.log('Payload:', JSON.stringify(payload));
        
        const putResponse = await fetch(`${BASE_URL}/api/admin/inventory/3/stock`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('Status:', putResponse.status);
        console.log('Headers:', Object.fromEntries(putResponse.headers.entries()));
        
        const responseText = await putResponse.text();
        console.log('Response:', responseText);
        
        // Check if it's a JSON parsing error
        try {
            const jsonResponse = JSON.parse(responseText);
            console.log('Parsed JSON response:', jsonResponse);
        } catch (e) {
            console.log('Response is not valid JSON:', responseText);
        }
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testInventoryFinal();
