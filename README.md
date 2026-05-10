# ShopCart AI

E-commerce platform with AI-powered review analysis.

## Prerequisites

- Node.js 18+
- Java 17
- Maven 3.6+
- PostgreSQL 16

## Quick Start

```bash
# Windows (PowerShell)
.\start-all.bat

# Or manually start all services:
# Terminal 1: PostgreSQL (create database "shopcart_db")
# Terminal 2: cd backend && mvn spring-boot:run
# Terminal 3: cd nlp-service && npm install && npm run dev
# Terminal 4: cd frontend && npm install && npm run dev
```

## Test Accounts

- **Admin:** admin_test@shopcart.dev / Admin123
- **User:** user_test@shopcart.dev / User123

## Running Tests

```bash
# Frontend tests
cd frontend && npm run test

# NLP Service tests (demo mode - 37/37 passing)
cd nlp-service && npm test

# E2E tests
cd e2e-tests && npx playwright test

# Backend tests
cd backend && mvn test
```

## Viewing Reports

```bash
# Frontend coverage
cd frontend && npm run test:coverage
# Open frontend/coverage/index.html

# E2E report
cd e2e-tests && npx playwright test --reporter=html
# Open e2e-tests/playwright-report/index.html

# Backend coverage
cd backend && mvn test jacoco:report
# Open backend/target/site/jacoco/index.html
```

## Reset Database

```bash
.\reset-database.bat
# Then run: .\start-all.bat
```

## Directory Structure

```
shopcart-playbook/
├── frontend/          # React/TypeScript frontend (121 tests)
├── backend/           # Java/Spring Boot backend (31 tests)
├── nlp-service/       # Node.js sentiment analysis (37 tests)
├── e2e-tests/         # Playwright E2E tests (16 tests)
├── performance-tests/ # K6 performance tests
└── .github/           # CI/CD workflows
```

## Port Configuration

- Frontend: 8080
- Backend: 8081
- NLP Service: 3001
- PostgreSQL: 5432

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite, TanStack Router, Zustand, Tailwind CSS
- **Backend:** Java 17, Spring Boot, PostgreSQL, Maven
- **NLP:** Node.js, Hugging Face Inference API
- **Testing:** Vitest, Jest, Playwright, K6
