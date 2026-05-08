# ShopCart AI Playbook

A modern, full-stack e-commerce platform built with cutting-edge technologies, featuring comprehensive testing, CI/CD automation, and code coverage tracking.

## 🚀 Tech Stack

### Frontend
- **React 18** - UI framework with TypeScript
- **TanStack Router** - Type-safe routing
- **Tailwind CSS** - Utility-first styling
- **Vite** - Build tool and dev server
- **Istanbul** - Code coverage instrumentation

### Backend
- **Java 17** - Runtime environment
- **Spring Boot** - Application framework
- **PostgreSQL** - Database
- **Maven** - Dependency management
- **JaCoCo** - Java code coverage

### Testing & Quality
- **Playwright** - E2E testing framework
- **GitHub Actions** - CI/CD automation
- **Docker** - Containerization

## 📋 Prerequisites

- Node.js 18+
- Java 17
- Maven 3.6+
- PostgreSQL 16
- Docker (optional, for containerized setup)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/shopcart-playbook.git
cd shopcart-playbook
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)

```bash
docker-compose up -d db
```

#### Option B: Local PostgreSQL

Create a database named `shopcart_db` with your PostgreSQL instance.

### 3. Backend Setup

```bash
cd backend

# Configure database connection in src/main/resources/application.properties
# SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/shopcart_db
# SPRING_DATASOURCE_USERNAME=postgres
# SPRING_DATASOURCE_PASSWORD=admin

# Build and run
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8081`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:8080`

## 🧪 Testing

### Run E2E Tests

```bash
cd e2e-tests

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps chromium

# Run all tests
npx playwright test

# Run with coverage mode
VITE_COVERAGE=true npx playwright test
```

### Run Backend Tests

```bash
cd backend
mvn test
```

### Run Frontend Unit Tests

```bash
cd frontend
npm run test
```

## 📊 Coverage

### Frontend Coverage

To generate coverage reports for the frontend:

```bash
# Set environment variable
export VITE_COVERAGE=true

# Run tests
cd e2e-tests
npx playwright test

# View coverage report
open ../frontend/coverage/index.html
```

**Note:** Coverage is only enabled when `VITE_COVERAGE=true` to prevent hydration errors in development mode.

### Backend Coverage

```bash
cd backend
mvn test
mvn jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

## 🔄 CI/CD

### GitHub Actions Workflow

The project uses GitHub Actions for automated testing and deployment:

- **Trigger:** Push to `main` or `develop` branches, pull requests
- **Jobs:**
  - Backend unit & integration tests with JaCoCo coverage
  - Frontend unit tests
  - E2E tests with Playwright and Istanbul coverage
  - Docker image builds (on main branch)

### Artifacts

After each CI run, the following artifacts are available for download:
- Backend coverage reports (JaCoCo)
- Frontend coverage reports (Istanbul)
- Playwright test reports and traces
- Backend and frontend logs

## 🔐 Security Hardening

### GitHub Secrets Configuration

To secure the CI/CD pipeline, configure the following secrets in your GitHub repository:

**Steps to add secrets:**
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `your-secure-password` |
| `POSTGRES_DB` | PostgreSQL database name | `shopcart_db` |
| `DOCKER_USERNAME` | Docker Hub username | `your-docker-username` |
| `DOCKER_PASSWORD` | Docker Hub password/token | `your-docker-token` |

## 📁 Project Structure

```
shopcart-playbook/
├── backend/                 # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   └── ...
├── frontend/                # React frontend
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
├── e2e-tests/              # Playwright E2E tests
│   ├── tests/
│   ├── pages/
│   └── playwright.config.ts
├── nlp-service/            # NLP microservice
├── .github/
│   └── workflows/          # CI/CD workflows
│       ├── ci.yml
│       └── e2e-tests.yml
└── README.md
```

## 🎯 Test Coverage Status

- **E2E Tests:** 7/7 passing ✓
- **Backend Coverage:** JaCoCo reports
- **Frontend Coverage:** Istanbul reports (conditional on VITE_COVERAGE=true)

## 🐛 Troubleshooting

### Port Conflicts
- Frontend: 8080 (configurable in `frontend/vite.config.ts`)
- Backend: 8081 (configurable in `backend/src/main/resources/application.properties`)
- PostgreSQL: 5432

### Common Issues

**Frontend not loading:**
- Ensure backend is running on port 8081
- Check browser console for hydration errors (should not occur with current config)

**Tests failing:**
- Verify all services are running (backend, frontend, database)
- Check port alignments in `e2e-tests/playwright.config.ts`

**Coverage not generating:**
- Ensure `VITE_COVERAGE=true` is set before running tests
- Verify Istanbul plugin is not causing hydration errors

## 📝 Development Guidelines

1. **Always run tests before committing**
2. **Keep coverage configuration conditional** to prevent development issues
3. **Use GitHub Secrets for sensitive data** in CI/CD
4. **Follow the existing code style** and structure
5. **Update documentation** when adding new features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by best practices in e-commerce development
- Community contributions and feedback

---

**Status:** ✅ Production Ready - All tests passing, CI/CD configured, security hardened.
