// Debug orders to find valid order for commenting
const BASE_URL = 'http://localhost:8081';

async function debugOrders() {
    console.log('=== DEBUG ORDERS ===');
    
    try {
        // Login
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin_test@shopcart.dev',
                password: 'Admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Login successful');
        
        // Get orders
        const ordersResponse = await fetch(`${BASE_URL}/api/admin/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const orders = await ordersResponse.json();
        console.log(`Found ${orders.length} orders:`);
        
        orders.forEach((order, index) => {
            console.log(`Order ${index + 1}:`);
            console.log(`  ID: ${order.orderId || order.id}`);
            console.log(`  Status: ${order.status}`);
            console.log(`  Total: ${order.total || order.totalAmount}`);
            console.log(`  Email: ${order.customerEmail || order.email}`);
            console.log('---');
        });
        
        // Find a paid order for commenting
        const paidOrder = orders.find(order => 
            order.status === 'paid' || order.status === 'delivered' || order.status === 'shipped'
        );
        
        if (paidOrder) {
            console.log(`✅ Found valid order for commenting: ID ${paidOrder.orderId || paidOrder.id}, Status: ${paidOrder.status}`);
            return paidOrder.orderId || paidOrder.id;
        } else {
            console.log('⚠️ No paid orders found, using order ID 3');
            return 3;
        }
        
    } catch (error) {
        console.error('Debug error:', error);
        return 3;
    }
}

debugOrders();
