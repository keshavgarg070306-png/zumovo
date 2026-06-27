# 📈 Zumovo — Trading Signal Tracking Application

A full-stack cryptocurrency trading signal tracker built with **Spring Boot 3** (Java 17) and **React** (TypeScript). Create, monitor, and evaluate trading signals with real-time price data from the Binance API, automated signal status evaluation, and a stunning dark-themed trading dashboard with heavy animations.

## Architecture Overview

The application follows a layered architecture with a clear separation of concerns. The **Spring Boot backend** exposes RESTful endpoints through `SignalController` and `AuthController`, which delegate to a **service layer** (`SignalService`, `BinancePriceService`) containing all business logic for signal creation, validation, status evaluation, and ROI calculation. The service layer interacts with **PostgreSQL** via Spring Data JPA repositories, while **Redis** caches live price data from the Binance public ticker API (fetched using reactive `WebClient`) to prevent rate limiting. A **Spring Scheduler** polls every 10 seconds to evaluate all OPEN signals against live market prices, automatically transitioning them to TARGET_HIT, STOPLOSS_HIT, or EXPIRED states. **JWT-based security** protects all API endpoints except authentication and Swagger documentation. Database schema evolution is managed by **Flyway migrations**. The **React frontend** communicates with the backend through an Axios-based API service, rendering a Bloomberg Terminal-inspired dark dashboard with Framer Motion animations, live price tickers, animated ROI gauges, and real-time status updates.

---

## 🛠️ Tech Stack

| Layer        | Technology                                                    |
|-------------|--------------------------------------------------------------|
| Backend     | Java 17, Spring Boot 3.2, Spring Security, Spring WebFlux    |
| Database    | PostgreSQL 16 with Flyway migrations                         |
| Caching     | Redis 7                                                      |
| API Docs    | springdoc-openapi (Swagger UI)                               |
| Frontend    | React 18, TypeScript, Vite, Framer Motion, Recharts          |
| External    | Binance Public API (live crypto prices)                      |
| DevOps      | Docker, Docker Compose                                       |
| Testing     | JUnit 5, Mockito                                             |

---

## 🚀 Quick Start

### Prerequisites

- **Java 17** (JDK)
- **Maven 3.9+**
- **Node.js 18+** & npm
- **PostgreSQL 16** (or Docker)
- **Redis 7** (or Docker)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
cd Zumovo

# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up --build

# Access the application:
# Frontend:  http://localhost:5173
# Backend:   http://localhost:8080
# Swagger:   http://localhost:8080/swagger-ui.html
```

### Option 2: Manual Setup

#### 1. Database Setup

```sql
-- Connect to PostgreSQL and create the database
CREATE DATABASE trading_signals;
```

#### 2. Backend

```bash
cd backend

# Configure database connection in src/main/resources/application.yml
# Default: postgresql://localhost:5432/trading_signals (user: postgres, pass: postgres)

# Build and run
mvn clean install
mvn spring-boot:run
```

The backend starts at **http://localhost:8080**

#### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend starts at **http://localhost:5173**

---

## 📋 PostgreSQL Configuration

| Property   | Default Value                                      |
|------------|---------------------------------------------------|
| URL        | `jdbc:postgresql://localhost:5432/trading_signals` |
| Username   | `postgres`                                        |
| Password   | `postgres`                                        |
| Port       | `5432`                                            |
| Database   | `trading_signals`                                 |

To customize, edit `backend/src/main/resources/application.yml` or set environment variables:

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://your-host:5432/your-db
export SPRING_DATASOURCE_USERNAME=your-user
export SPRING_DATASOURCE_PASSWORD=your-password
```

---

## 📖 API Documentation (Swagger)

Once the backend is running, access the interactive API documentation at:

> **🔗 http://localhost:8080/swagger-ui.html**

---

## 🔌 API Endpoints

| Method   | Endpoint                    | Description              | Auth Required |
|----------|-----------------------------|--------------------------|---------------|
| `POST`   | `/api/auth/register`        | Register new user        | ❌            |
| `POST`   | `/api/auth/login`           | Login & get JWT token    | ❌            |
| `POST`   | `/api/signals`              | Create new signal        | ✅            |
| `GET`    | `/api/signals`              | List all signals         | ✅            |
| `GET`    | `/api/signals/{id}`         | Get signal details       | ✅            |
| `DELETE` | `/api/signals/{id}`         | Delete a signal          | ✅            |
| `GET`    | `/api/signals/{id}/status`  | Quick status check       | ✅            |

### Example: Create a Signal

```bash
curl -X POST http://localhost:8080/api/signals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "symbol": "BTCUSDT",
    "direction": "BUY",
    "entryPrice": 65000.00,
    "stopLoss": 63000.00,
    "targetPrice": 70000.00,
    "entryTime": "2024-01-15T10:00:00",
    "expiryTime": "2024-01-16T10:00:00"
  }'
```

---

## 📊 Business Logic

### Signal Status Evaluation

| Direction | Target Hit Condition         | Stop Loss Condition          |
|-----------|------------------------------|------------------------------|
| **BUY**   | `currentPrice ≥ targetPrice` | `currentPrice ≤ stopLoss`    |
| **SELL**  | `currentPrice ≤ targetPrice` | `currentPrice ≥ stopLoss`    |

- **Final States**: Once a signal reaches `TARGET_HIT` or `STOPLOSS_HIT`, it cannot change.
- **Expiry**: If `currentTime > expiryTime` and no target/stoploss hit → `EXPIRED`.

### ROI Calculation

| Direction | Formula                                         |
|-----------|------------------------------------------------|
| **BUY**   | `(currentPrice − entryPrice) / entryPrice × 100` |
| **SELL**  | `(entryPrice − currentPrice) / entryPrice × 100` |

ROI is rounded to **2 decimal places**.

### Validation Rules

| Direction | Price Ordering Rule                     |
|-----------|-----------------------------------------|
| **BUY**   | `stopLoss < entryPrice < targetPrice`   |
| **SELL**  | `targetPrice < entryPrice < stopLoss`   |

- Expiry time must be after entry time
- Entry time can be up to 24 hours in the past

---

## 🧪 Running Tests

```bash
cd backend
mvn test
```

Tests cover:
- ✅ ROI calculation (BUY/SELL, positive/negative)
- ✅ Signal status transitions (OPEN → TARGET_HIT/STOPLOSS_HIT/EXPIRED)
- ✅ Final state immutability
- ✅ Input validation and error responses
- ✅ Controller endpoint behavior

---

## 📁 Project Structure

```
Zumovo/
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       ├── main/
│       │   ├── java/com/zumovo/trading/
│       │   │   ├── TradingSignalApplication.java
│       │   │   ├── config/          # Redis, WebClient, Security configs
│       │   │   ├── controller/      # REST controllers
│       │   │   ├── dto/             # Request/Response DTOs
│       │   │   ├── entity/          # JPA entities
│       │   │   ├── enums/           # SignalDirection, SignalStatus
│       │   │   ├── exception/       # Global exception handler
│       │   │   ├── repository/      # Spring Data JPA repositories
│       │   │   ├── security/        # JWT auth components
│       │   │   └── service/         # Business logic services
│       │   └── resources/
│       │       ├── application.yml
│       │       ├── application-docker.yml
│       │       └── db/migration/    # Flyway SQL migrations
│       └── test/                    # JUnit 5 + Mockito tests
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css              # Global dark theme styles
│       ├── types/                 # TypeScript interfaces
│       ├── services/              # API service (Axios)
│       ├── context/               # Auth context
│       ├── components/            # Reusable UI components
│       └── pages/                 # Dashboard, CreateSignal, SignalDetail
│
├── docker-compose.yml
└── README.md
```

---

## 🎨 Frontend Features

- 🌑 **Dark Trading Theme** — Bloomberg Terminal meets crypto exchange aesthetic
- ✨ **Heavy Animations** — Framer Motion page transitions, staggered lists, micro-interactions
- 📊 **Live Price Tickers** — Real-time Binance price updates with color-coded changes
- 🎯 **Animated ROI Gauge** — Semi-circular gauge with sweeping needle animation
- 📈 **Price Progress Bar** — Visual representation of price between stop loss and target
- ⏱️ **Countdown Timer** — Live countdown to signal expiry
- 💎 **Glassmorphism Cards** — Translucent card UI with backdrop blur
- 🔴🟢🟡 **Glowing Status Badges** — Animated pulse (OPEN), flash (TARGET_HIT), glow (STOPLOSS_HIT)
- 🦴 **Skeleton Loaders** — Shimmer loading placeholders
- 🔔 **Toast Notifications** — Signal status change alerts

---

## 📝 License

This project is for educational and demonstration purposes.
