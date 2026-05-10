# ShopCart AI

E-commerce platform with AI-powered review analysis. Distributed system architecture with REST API communication.

## Prerequisites

- Node.js 18+
- Java 17
- Maven 3.6+
- PostgreSQL 16

## Installation

### 1. Start PostgreSQL

```bash
# Local PostgreSQL: create database "shopcart_db"
```

### 2. Start Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs on `http://localhost:8081`

### 3. Start NLP Service

```bash
cd nlp-service
npm install
npm run dev
```

NLP Service runs on `http://localhost:3001`

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:8080`

## Test Accounts

### Admin Account
- **Email:** admin_test@shopcart.dev
- **Password:** Admin123
- **Role:** ADMIN

### User Account
- **Email:** user_test@shopcart.dev
- **Password:** User123
- **Role:** USER

## Recent Improvements

### Coupon Management System (Latest)
- **Advanced Coupon Conditions:** Added minSpend, maxDiscount, usageLimit, usedCount fields
- **Enhanced Admin Form:** Coupon creation now supports minimum spend, max discount, and usage limits
- **Smart Validation:** coupon-utils.ts validates all conditions before applying coupons
- **Sample Data:** 3 pre-seeded coupons with full conditions (SAVE10, FIXED20, VIP20)

### Admin Analytics Enhancement
- **Chart Details Modal:** Added emoji icons, percentages, descriptions, and actionable recommendations
- **All Reviews Table:** Complete review list with search, filter, and clickable details
- **Data Context:** Charts now pass total values for percentage calculation

### Automatic Data Seeding
- **Smart Seeding:** Auto-creates users, products, orders, reviews, and coupons on startup
- **Test Accounts:** admin_test@shopcart.dev / Admin123 and user_test@shopcart.dev / User123
- **Sample Data:** 3 products, 2 orders, 3 reviews, 3 coupons with realistic conditions

### API Updates
- **Enhanced Endpoints:** `/api/admin/coupons` now accepts all new coupon fields
- **Security:** All admin endpoints protected with role-based access control

### Start All Services (Quick Start)

```bash
# Windows (PowerShell)
.\start-all.bat

# Or manually start all services in separate terminals:
# Terminal 1: PostgreSQL
# Terminal 2: cd backend && mvn spring-boot:run
# Terminal 3: cd nlp-service && npm run dev
# Terminal 4: cd frontend && npm run dev
```

### Reset Database

If you need to reset the database (e.g., after schema changes like adding new Coupon fields):

```bash
# Option 1: Using reset-database.bat (requires psql in PATH)
.\reset-database.bat
# Then run: .\start-all.bat

# Option 2: Using pgAdmin or other database tool
# 1. Open pgAdmin
# 2. Connect to PostgreSQL
# 3. Drop database "shopcart_db"
# 4. Create new database "shopcart_db"
# 5. Run: .\start-all.bat

# Option 3: Temporary DDL auto-create (not recommended for production)
# Edit backend/src/main/resources/application.properties
# Change: spring.jpa.hibernate.ddl-auto=update
# To: spring.jpa.hibernate.ddl-auto=create-drop
# Run backend once to recreate schema, then change back to "update"
```

## Running Tests

### Frontend Unit Tests

```bash
cd frontend
npm run test
```

### NLP Service Tests

```bash
cd nlp-service
npm test
```

### E2E Tests

```bash
cd e2e-tests
npx playwright test
```

### Performance Tests

```bash
cd performance-tests
k6 run smoke-test.js
```

## Viewing Reports

### Vitest Coverage Report

```bash
cd frontend
npm run test:coverage
# Open frontend/coverage/index.html in browser
```

### Playwright HTML Report

```bash
cd e2e-tests
npx playwright test --reporter=html
# Open e2e-tests/playwright-report/index.html in browser
```

### JaCoCo Backend Coverage

```bash
cd backend
mvn test jacoco:report
# Open backend/target/site/jacoco/index.html in browser
```

### CI/CD Reports

Truy cập GitHub repository → Tab "Actions" → Chọn workflow để xem

## Directory Structure

```
shopcart-playbook/
├── frontend/              # React/TypeScript frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── lib/           # Utilities (api-service, coupon-utils, etc.)
│   │   ├── stores/        # State management (auth-store, cart-store)
│   │   └── test/          # Vitest unit tests (121 tests)
│   └── package.json
├── backend/               # Java/Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       └── java/.../shopcart/backend/
│   │           ├── controller/
│   │           ├── service/
│   │           └── repository/
│   └── src/test/          # JUnit unit tests (31 tests)
├── nlp-service/           # Node.js NLP service
│   ├── sentiment-analyzer.ts
│   └── sentiment-analyzer.test.ts  # Jest tests (37 tests)
├── e2e-tests/             # Playwright E2E tests
│   └── tests/             # E2E test specs (16 tests)
├── performance-tests/     # K6 performance tests
├── .github/               # CI/CD workflows
│   └── workflows/
│       ├── ci.yml         # Frontend unit tests
│       └── e2e-tests.yml  # E2E tests
└── README.md
```

## Port Configuration

- Frontend: 8080
- Backend: 8081
- NLP Service: 3001
- PostgreSQL: 5432

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite, TanStack Router, Zustand, Tailwind CSS, Vitest
- **Backend:** Java 17, Spring Boot, PostgreSQL, Maven, JPA/Hibernate
- **NLP Service:** Node.js, TypeScript, Hugging Face Inference API, Jest
- **Testing:** Vitest (121 tests), Jest (37 tests), Playwright (16 tests), K6 (2 tests)
- **CI/CD:** GitHub Actions
