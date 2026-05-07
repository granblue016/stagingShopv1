import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metric for successful cart additions
const addCartSuccessRate = new Rate('add_cart_success_rate');

export let options = {
  stages: [
    { duration: '30s', target: 2 },   // Ramp up to 2 users
    { duration: '1m', target: 5 },   // Ramp up to 5 users
    { duration: '1m', target: 10 },  // Ramp up to 10 users
    { duration: '2m', target: 10 },  // Stay at 10 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.1'],     // Error rate should be less than 10%
    add_cart_success_rate: ['rate>0.9'],  // 90%+ success rate for add to cart
  },
};

const BASE_URL = 'http://localhost:8080';

export function setup() {
  // Get the list of products to use in tests
  let response = http.get(`${BASE_URL}/api/products`);
  if (response.status !== 200) {
    throw new Error('Failed to fetch products');
  }
  
  let products = response.json();
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error('No products available for testing');
  }
  
  // Store first 5 products for testing
  __ENV.TEST_PRODUCTS = JSON.stringify(products.slice(0, 5));
  console.log(`Loaded ${products.length} products for testing`);
}

export default function () {
  let products = JSON.parse(__ENV.TEST_PRODUCTS || '[]');
  
  if (products.length === 0) {
    console.error('No products available for testing');
    return;
  }

  // Randomly select a product
  let product = products[Math.floor(Math.random() * products.length)];
  
  // Step 1: Visit homepage
  let homeResponse = http.get(`${BASE_URL}/`, {
    tags: { name: 'homepage' },
  });
  
  check(homeResponse, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage response time < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(Math.random() * 2 + 1); // 1-3s thinking time

  // Step 2: Visit product page
  let productResponse = http.get(`${BASE_URL}/product/${product.id}`, {
    tags: { name: 'product_detail' },
  });
  
  check(productResponse, {
    'product page status is 200': (r) => r.status === 200,
    'product page response time < 1.5s': (r) => r.timings.duration < 1500,
    'product name found': (r) => r.body.includes(product.name),
  });

  sleep(Math.random() * 3 + 2); // 2-5s reading product details

  // Step 3: Add to cart (simulate API call)
  let cartPayload = JSON.stringify({
    productId: product.id,
    quantity: Math.floor(Math.random() * 3) + 1, // 1-3 items
  });

  let addCartResponse = http.post(`${BASE_URL}/api/cart/add`, cartPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'add_to_cart' },
  });
  
  let addCartSuccess = check(addCartResponse, {
    'add to cart status is 200 or 401': (r) => r.status === 200 || r.status === 401, // 401 if not logged in
    'add to cart response time < 2s': (r) => r.timings.duration < 2000,
  });

  addCartSuccessRate.add(addCartSuccess);

  sleep(Math.random() * 2 + 1); // 1-3s before next action

  // Step 4: Visit cart page
  let cartResponse = http.get(`${BASE_URL}/cart`, {
    tags: { name: 'cart_page' },
  });
  
  check(cartResponse, {
    'cart page status is 200': (r) => r.status === 200,
    'cart page response time < 1.5s': (r) => r.timings.duration < 1500,
  });

  sleep(Math.random() * 3 + 2); // 2-5s reviewing cart
}

export function teardown() {
  console.log('Performance test completed');
}
