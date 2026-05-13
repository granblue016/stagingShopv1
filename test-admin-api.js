// Simple test script to debug admin API calls
const BASE_URL = 'http://localhost:8081';

async function testAdminLogin() {
    console.log('Testing admin login...');
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin_test@shopcart.dev',
                password: 'Admin123'
            })
        });
        
        const data = await response.json();
        console.log('Login response:', response.status, data);
        
        if (response.ok && data.token) {
            console.log('Login successful, token:', data.token);
            return data.token;
        } else {
            console.error('Login failed');
            return null;
        }
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
}

async function testAdminOrders(token) {
    console.log('Testing admin orders API...');
    try {
        const response = await fetch(`${BASE_URL}/api/admin/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Orders response:', response.status, data);
        return response.ok;
    } catch (error) {
        console.error('Orders error:', error);
        return false;
    }
}

async function testInventoryUpdate(token) {
    console.log('Testing inventory update API...');
    try {
        const response = await fetch(`${BASE_URL}/api/admin/inventory/1`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                stockQuantity: 100
            })
        });
        
        const data = await response.json();
        console.log('Inventory response:', response.status, data);
        return response.ok;
    } catch (error) {
        console.error('Inventory error:', error);
        return false;
    }
}

async function runTests() {
    const token = await testAdminLogin();
    if (token) {
        await testAdminOrders(token);
        await testInventoryUpdate(token);
    }
}

runTests();
