import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
  },
};

const BASE_URL = 'http://localhost:8081';

export default function () {
  // Test 1: GET /api/products (Check homepage)
  console.log('Test 1: GET /api/products');
  let productsRes = http.get(`${BASE_URL}/api/products`);
  check(productsRes, {
    'products status is 200': (r) => r.status === 200,
    'products response time < 500ms': (r) => r.timings.duration < 500,
  }) || console.error('Products test failed');

  sleep(1);

  // Test 2: POST /api/auth/login (Login with user_test)
  console.log('Test 2: POST /api/auth/login');
  let loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'user_test@shopcart.dev',
    password: 'User123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 500ms': (r) => r.timings.duration < 500,
    'login returns token': (r) => r.json('token') !== undefined,
  }) || console.error('Login test failed');

  sleep(1);

  // Test 3: GET /api/products again (verify still works)
  console.log('Test 3: GET /api/products (after login)');
  let productsRes2 = http.get(`${BASE_URL}/api/products`);
  check(productsRes2, {
    'products after login status is 200': (r) => r.status === 200,
    'products after login response time < 500ms': (r) => r.timings.duration < 500,
  }) || console.error('Products after login test failed');
}
