# ShopCart AI Playbook

A modern, full-stack e-commerce platform with AI-powered review analysis, featuring comprehensive testing, CI/CD automation, and microservices architecture.

## 🏗️ Architecture

### Microservices Model

```
┌─────────────────┐
│   Frontend      │
│  (React/Vite)   │
│   Port: 8080    │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│    Backend      │
│  (Spring Boot)  │
│   Port: 8081    │
└────────┬────────┘
         │ HTTP/gRPC
         ▼
┌─────────────────┐
│  nlp-service    │
│   (Node.js)     │
│   Port: 3001    │
└────────┬────────┘
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   Port: 5432    │
└─────────────────┘
```

### Technology Stack

**Frontend**
- React 18 + TypeScript
- TanStack Router (type-safe routing)
- Tailwind CSS + shadcn/ui
- Vite (build tool)
- Zustand (state management)

**Backend**
- Java 17 + Spring Boot
- PostgreSQL (database)
- Maven (dependency management)

**NLP Service**
- Node.js + TypeScript
- LangChain (AI framework)
- Hugging Face API (sentiment analysis)

**Testing**
- Vitest (frontend unit tests)
- Jest (NLP service tests)
- Playwright (E2E tests)
- K6 (performance testing)

## 🎯 Quality Assurance

### Coverage Metrics

| Service | Statement Coverage | Branch Coverage | Test Count |
|---------|-------------------|----------------|------------|
| Frontend | 62.92% | 43.9% | 121 tests |
| NLP Service | 45.14% | 30.66% | 37 tests |
| E2E | - | - | 8 tests |

### Test Distribution

- **Unit Tests**: 158 total (121 frontend + 37 NLP)
- **E2E Tests**: 8 Playwright tests
- **Performance Tests**: 2 K6 tests (smoke + stress)

## ✨ Key Features

### AI Review Summary
- Real-time sentiment analysis of customer reviews
- Vietnamese language support
- Aspect-based analysis (pin, màn hình, hiệu năng)
- Fake review detection
- Priority-based review ranking

### Stock Validation
- Automatic quantity capping at stock limit
- Prevents overselling across concurrent sessions
- Real-time inventory tracking
- Zero-stock handling

### Firebase Auth Gatekeeper
- Firebase ID Token integration for AI features
- Protected AI routes with authentication checks
- Automatic redirect to login for unauthorized access
- Secure token storage via Zustand persist

### Coupon System
- Percentage and fixed-amount discounts
- Minimum spend requirements
- Usage limit per coupon
- Expiry date validation

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- Java 17
- Maven 3.6+
- PostgreSQL 16

### Multi-Device Setup (Laptop/PC)

**Port Configuration:**
- Frontend: 8080
- Backend: 8081
- NLP Service: 3001
- PostgreSQL: 5432

### 1. Start PostgreSQL

```bash
# Using Docker (recommended)
docker-compose up -d db

# Or local PostgreSQL
# Create database: shopcart_db
```

### 2. Start Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend starts on `http://localhost:8081`

### 3. Start NLP Service

```bash
cd nlp-service
npm install
npm run dev
```

NLP Service starts on `http://localhost:3001`

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:8080`

### 5. Run All Tests

```bash
# Frontend unit tests
cd frontend
npm run test

# NLP service tests
cd nlp-service
npm test

# E2E tests
cd e2e-tests
npx playwright test

# Performance tests
cd performance-tests
k6 run smoke-test.js
```

## 📊 CI/CD

### GitHub Actions Workflows

- **ci.yml**: Frontend unit tests with coverage
- **e2e-tests.yml**: E2E tests with service startup (wait-on for ports 8080, 8081, 3001)

### Resource Optimization

- Frontend tests run with `maxThreads: 1` to prevent CPU overload on low-resource runners
- E2E tests use wait-on to ensure services are ready before execution

## 🐛 Troubleshooting

### Port Conflicts

If ports are already in use:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

### Service Startup Issues

- Ensure PostgreSQL is running before starting backend
- Check NLP service dependencies are installed
- Verify all ports are available before starting services

## 📝 Development Guidelines

1. Run tests before committing
2. Maintain code coverage above 60% (frontend) and 45% (NLP)
3. Follow existing code style and structure
4. Update documentation for new features
5. Use environment variables for configuration

## 📄 License

MIT License
