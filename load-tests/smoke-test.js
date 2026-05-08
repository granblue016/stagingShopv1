import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1000ms (relaxed for smoke test)
  },
};

const FRONTEND_URL = 'http://localhost:8080';
const BACKEND_URL = 'http://localhost:8081';

export default function () {
  // Test 1: Frontend health check
  console.log('Test 1: Frontend health check');
  let frontendRes = http.get(`${FRONTEND_URL}/`);
  check(frontendRes, {
    'frontend status is 200': (r) => r.status === 200,
    'frontend response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || console.error('Frontend health check failed');

  sleep(1);

  // Test 2: Backend GET /api/products
  console.log('Test 2: GET /api/products');
  let productsRes = http.get(`${BACKEND_URL}/api/products`);
  check(productsRes, {
    'products status is 200': (r) => r.status === 200,
    'products response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || console.error('Products test failed');

  sleep(1);

  // Test 3: POST /api/auth/login (Login with user_test)
  console.log('Test 3: POST /api/auth/login');
  let loginRes = http.post(`${BACKEND_URL}/api/auth/login`, JSON.stringify({
    email: 'user_test@shopcart.dev',
    password: 'User123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 1000ms': (r) => r.timings.duration < 1000,
    'login returns token': (r) => r.json('token') !== undefined,
  }) || console.error('Login test failed');

  sleep(1);

  // Test 4: GET /api/products again (verify still works)
  console.log('Test 4: GET /api/products (after login)');
  let productsRes2 = http.get(`${BACKEND_URL}/api/products`);
  check(productsRes2, {
    'products after login status is 200': (r) => r.status === 200,
    'products after login response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || console.error('Products after login test failed');
}
