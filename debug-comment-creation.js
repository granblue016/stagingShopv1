// Debug comment creation issue
const BASE_URL = 'http://localhost:8081';

async function debugCommentCreation() {
    console.log('=== DEBUG COMMENT CREATION ===');
    
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
        
        // Test comment creation with different order IDs
        const orderIds = [1, 2, 3];
        
        for (const orderId of orderIds) {
            console.log(`\n--- Testing Order ID: ${orderId} ---`);
            
            // Check order status first
            try {
                const orderResponse = await fetch(`${BASE_URL}/api/admin/orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const orders = await orderResponse.json();
                const order = orders.find(o => (o.orderId || o.id) === orderId);
                
                if (order) {
                    console.log(`Order Status: ${order.status}`);
                    
                    if (order.status === 'delivered' || order.status === 'DELIVERED' || order.status === 'paid' || order.status === 'PAID') {
                        console.log('✅ Order status allows commenting');
                        
                        // Try to create comment
                        const commentResponse = await fetch(`${BASE_URL}/api/order-comments`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                orderId: orderId,
                                content: `Debug test comment for order ${orderId} - ${new Date().toISOString()}`
                            })
                        });
                        
                        console.log(`Comment Response Status: ${commentResponse.status}`);
                        
                        if (commentResponse.ok) {
                            const result = await commentResponse.json();
                            console.log('✅ Comment created successfully');
                            console.log(`Comment ID: ${result.comment.id}`);
                            return orderId; // Return successful order ID
                        } else {
                            const errorText = await commentResponse.text();
                            console.log(`❌ Comment creation failed: ${errorText}`);
                        }
                    } else {
                        console.log('❌ Order status does not allow commenting');
                    }
                } else {
                    console.log('❌ Order not found');
                }
            } catch (error) {
                console.log(`❌ Error checking order ${orderId}:`, error.message);
            }
        }
        
        console.log('\n=== Testing direct API calls ===');
        
        // Test with known working order ID 3
        console.log('Testing with order ID 3...');
        
        const testResponse = await fetch(`${BASE_URL}/api/order-comments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: 3,
                content: `Final debug test - ${new Date().toISOString()}`
            })
        });
        
        console.log(`Final Test Status: ${testResponse.status}`);
        const finalText = await testResponse.text();
        console.log(`Final Test Response: ${finalText}`);
        
    } catch (error) {
        console.error('Debug error:', error);
    }
}

debugCommentCreation();
