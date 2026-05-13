// Detailed debug script for admin orders API
const BASE_URL = 'http://localhost:8081';

async function testAdminOrdersDetailed() {
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
        console.log('Testing admin orders API with detailed headers...');
        
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
        
        const ordersText = await ordersResponse.text();
        console.log('Orders response raw text:', ordersText);
        
        try {
            const ordersData = JSON.parse(ordersText);
            console.log('Orders parsed data:', ordersData);
        } catch (e) {
            console.log('Could not parse as JSON, raw response shown above');
        }
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testAdminOrdersDetailed();
