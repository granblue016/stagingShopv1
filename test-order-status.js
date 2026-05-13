// Test script for order status update
const BASE_URL = 'http://localhost:8081';

async function testOrderStatusUpdate() {
    console.log('Testing admin login...');
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
        console.log('Login response:', loginResponse.status, loginData);
        
        if (!loginResponse.ok || !loginData.token) {
            console.error('Login failed');
            return;
        }
        
        const token = loginData.token;
        console.log('Login successful, token:', token);
        
        // Step 2: Test OPTIONS preflight request
        console.log('Testing OPTIONS preflight request...');
        const optionsResponse = await fetch(`${BASE_URL}/api/admin/orders/3/status`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:8080',
                'Access-Control-Request-Method': 'PATCH',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
        });
        
        console.log('OPTIONS response status:', optionsResponse.status);
        console.log('OPTIONS response headers:', Object.fromEntries(optionsResponse.headers.entries()));
        
        // Step 3: Test PATCH request to update order status
        console.log('Testing PATCH request to update order status...');
        const patchResponse = await fetch(`${BASE_URL}/api/admin/orders/3/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:8080'
            },
            body: JSON.stringify({
                status: 'paid'
            })
        });
        
        console.log('PATCH response status:', patchResponse.status);
        console.log('PATCH response headers:', Object.fromEntries(patchResponse.headers.entries()));
        
        const patchData = await patchResponse.text();
        console.log('PATCH response body:', patchData);
        
        // Step 4: Verify order status was updated
        console.log('Verifying order status update...');
        const ordersResponse = await fetch(`${BASE_URL}/api/admin/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            const order3 = ordersData.find(order => order.orderId === '3');
            console.log('Order 3 status after update:', order3?.status);
        }
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testOrderStatusUpdate();
