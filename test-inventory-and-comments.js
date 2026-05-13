// Comprehensive test script for inventory stock update and comment analytics
const BASE_URL = 'http://localhost:8081';

async function testInventoryAndComments() {
    console.log('=== COMPREHENSIVE TEST: INVENTORY & COMMENT ANALYTICS ===');
    
    try {
        // Step 1: Login as admin
        console.log('\n1. Testing admin login...');
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
            console.error('❌ Login failed');
            return;
        }
        
        const token = loginData.token;
        console.log('✅ Login successful, token:', token);
        
        // Step 2: Test inventory stock update with detailed debugging
        console.log('\n2. Testing inventory stock update...');
        console.log('Testing PUT /api/admin/inventory/3/stock');
        
        // First check current product info
        console.log('Getting current product 3 info...');
        const getProductResponse = await fetch(`${BASE_URL}/api/products/3`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (getProductResponse.ok) {
            const productData = await getProductResponse.json();
            console.log('Current product 3:', productData);
        }
        
        // Test OPTIONS preflight
        console.log('Testing OPTIONS preflight...');
        const optionsResponse = await fetch(`${BASE_URL}/api/admin/inventory/3/stock`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:8080',
                'Access-Control-Request-Method': 'PUT',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
        });
        
        console.log('OPTIONS response status:', optionsResponse.status);
        console.log('OPTIONS response headers:', Object.fromEntries(optionsResponse.headers.entries()));
        
        // Test PUT request with different payloads
        console.log('Testing PUT request with stockQuantity...');
        const putResponse = await fetch(`${BASE_URL}/api/admin/inventory/3/stock`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:8080'
            },
            body: JSON.stringify({
                stockQuantity: 150
            })
        });
        
        console.log('PUT response status:', putResponse.status);
        console.log('PUT response headers:', Object.fromEntries(putResponse.headers.entries()));
        
        const putText = await putResponse.text();
        console.log('PUT response body:', putText);
        
        // Test with alternative payload format
        console.log('Testing PUT with alternative payload...');
        const putResponse2 = await fetch(`${BASE_URL}/api/admin/inventory/3/stock`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:8080'
            },
            body: JSON.stringify({
                stock: 200
            })
        });
        
        console.log('PUT alternative response status:', putResponse2.status);
        const putText2 = await putResponse2.text();
        console.log('PUT alternative response body:', putText2);
        
        // Step 3: Test comments and AI analytics for order 3
        console.log('\n3. Testing comments and AI analytics for order 3...');
        
        // Get order details first
        console.log('Getting order 3 details...');
        const orderResponse = await fetch(`${BASE_URL}/api/orders/3`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            console.log('Order 3 details:', orderData);
        }
        
        // Get comments for order 3
        console.log('Getting comments for order 3...');
        const commentsResponse = await fetch(`${BASE_URL}/api/orders/3/comments`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Comments response status:', commentsResponse.status);
        if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            console.log('Order 3 comments:', commentsData);
            
            // Check if comments have AI analytics
            if (commentsData && commentsData.length > 0) {
                commentsData.forEach((comment, index) => {
                    console.log(`Comment ${index + 1}:`, {
                        id: comment.id,
                        content: comment.content,
                        sentiment: comment.sentiment,
                        sentimentScore: comment.sentimentScore,
                        keywords: comment.keywords,
                        aiAnalysis: comment.aiAnalysis
                    });
                });
            }
        } else {
            const commentsError = await commentsResponse.text();
            console.log('Comments error:', commentsError);
        }
        
        // Test adding a new comment to see AI analytics
        console.log('Testing add new comment to check AI analytics...');
        const addCommentResponse = await fetch(`${BASE_URL}/api/orders/3/comments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: 'This product is amazing! Great quality and fast shipping. Very satisfied with my purchase.'
            })
        });
        
        console.log('Add comment response status:', addCommentResponse.status);
        if (addCommentResponse.ok) {
            const newComment = await addCommentResponse.json();
            console.log('New comment with AI analytics:', newComment);
        } else {
            const addCommentError = await addCommentResponse.text();
            console.log('Add comment error:', addCommentError);
        }
        
        // Step 4: Test all products to check inventory
        console.log('\n4. Testing all products inventory...');
        const allProductsResponse = await fetch(`${BASE_URL}/api/products`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (allProductsResponse.ok) {
            const allProducts = await allProductsResponse.json();
            console.log('All products inventory:');
            allProducts.forEach(product => {
                console.log(`Product ${product.id}: ${product.name} - Stock: ${product.stockQuantity}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

testInventoryAndComments();
