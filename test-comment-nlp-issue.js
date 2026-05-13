// Test comment creation and NLP processing issue
const BASE_URL = 'http://localhost:8081';

async function testCommentNlpIssue() {
    console.log('=== COMMENT & NLP ISSUE TEST ===');
    
    try {
        // 1. Login
        console.log('1. Testing admin login...');
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
            console.error('❌ Login failed');
            return;
        }
        
        const token = loginData.token;
        console.log('✅ Login successful');
        
        // 2. Check existing comments before adding new one
        console.log('\n2. Checking existing comments...');
        const getBeforeResponse = await fetch(`${BASE_URL}/api/order-comments/3`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('GET Before Status:', getBeforeResponse.status);
        const beforeComments = await getBeforeResponse.json();
        console.log('Comments before:', JSON.stringify(beforeComments, null, 2));
        
        // 3. Add new comment
        console.log('\n3. Adding new comment...');
        const postResponse = await fetch(`${BASE_URL}/api/order-comments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: 3,
                content: 'NEW TEST COMMENT - This should appear and be processed by NLP service!'
            })
        });
        
        console.log('POST Status:', postResponse.status);
        const postResult = await postResponse.json();
        console.log('POST Result:', JSON.stringify(postResult, null, 2));
        
        // 4. Check comments immediately after adding
        console.log('\n4. Checking comments immediately after adding...');
        const getAfterResponse = await fetch(`${BASE_URL}/api/order-comments/3`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('GET After Status:', getAfterResponse.status);
        const afterComments = await getAfterResponse.json();
        console.log('Comments after:', JSON.stringify(afterComments, null, 2));
        
        // 5. Wait for NLP processing
        console.log('\n5. Waiting 5 seconds for NLP processing...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 6. Check comments again after NLP processing
        console.log('\n6. Checking comments after NLP processing...');
        const getFinalResponse = await fetch(`${BASE_URL}/api/order-comments/3`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('GET Final Status:', getFinalResponse.status);
        const finalComments = await getFinalResponse.json();
        console.log('Comments final:', JSON.stringify(finalComments, null, 2));
        
        // 7. Analysis
        console.log('\n=== ANALYSIS ===');
        const beforeCount = Array.isArray(beforeComments) ? beforeComments.length : 0;
        const afterCount = Array.isArray(afterComments) ? afterComments.length : 0;
        const finalCount = Array.isArray(finalComments) ? finalComments.length : 0;
        
        console.log(`Comment count - Before: ${beforeCount}, After: ${afterCount}, Final: ${finalCount}`);
        
        if (afterCount > beforeCount) {
            console.log('✅ Comment was saved to database');
        } else {
            console.log('❌ Comment was NOT saved to database');
        }
        
        if (finalCount >= afterCount) {
            console.log('✅ Comments are persistent');
        } else {
            console.log('❌ Comments disappeared');
        }
        
        // 8. Check NLP service logs (we'll see these in backend logs)
        console.log('\n8. Check backend logs for NLP processing...');
        console.log('Look for: "DEBUG: Sending comment to AI analytics..."');
        console.log('Look for: "DEBUG: AI analytics completed: ..."');
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testCommentNlpIssue();
