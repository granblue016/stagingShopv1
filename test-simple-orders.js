// Simple test for getAllOrders only
const BASE_URL = 'http://localhost:8081';

async function testGetAllOrders() {
    console.log('Testing admin login...');
    try {
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
        console.log('Login response:', loginResponse.status, loginData);
        
        if (!loginResponse.ok || !loginData.token) {
            console.error('Login failed');
            return;
        }
        
        const token = loginData.token;
        console.log('Testing getAllOrders only...');
        
        // Test with curl-like headers
        const ordersResponse = await fetch(`${BASE_URL}/api/admin/orders`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('Orders response status:', ordersResponse.status);
        console.log('Orders response headers:', Object.fromEntries(ordersResponse.headers.entries()));
        
        if (ordersResponse.status === 500) {
            console.log('Got 500 error, checking if there are any orders in database...');
            // Try to get orders count first
            const countResponse = await fetch(`${BASE_URL}/api/admin/orders/count`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Count response status:', countResponse.status);
            if (countResponse.ok) {
                const countData = await countResponse.json();
                console.log('Orders count:', countData);
            }
        }
        
        const ordersText = await ordersResponse.text();
        console.log('Orders response raw text:', ordersText);
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testGetAllOrders();
