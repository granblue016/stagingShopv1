// Test different payload formats for inventory update
const BASE_URL = 'http://localhost:8081';

async function testInventoryPayload() {
    console.log('=== PAYLOAD FORMAT TEST ===');
    
    try {
        // Login first
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
        
        // Test different payload formats
        const payloads = [
            { stockQuantity: 150 },
            { "stockQuantity": "150" },
            { stock: 150 },
            { "stock": "150" },
            { quantity: 150 },
            { stock_quantity: 150 }
        ];
        
        for (let i = 0; i < payloads.length; i++) {
            const payload = payloads[i];
            console.log(`\nTesting payload ${i + 1}:`, payload);
            
            try {
                const putResponse = await fetch(`${BASE_URL}/api/admin/inventory/3/stock`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                
                console.log(`Status: ${putResponse.status}`);
                const responseText = await putResponse.text();
                console.log(`Response: ${responseText}`);
                
                if (putResponse.status === 200) {
                    console.log('✅ SUCCESS! Payload works:', payload);
                    break;
                }
            } catch (error) {
                console.log(`Error with payload ${i + 1}:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testInventoryPayload();
