# Space Debris Tracking, Collision Risk & Mitigation Management System

## Overview
Web application for tracking space debris/satellites, computing collision risk (conjunction analysis), and recommending avoidance maneuvers.

**Stack (as required):** React.js + Node.js + Java (OOPS) + MySQL (DBMS)

## Quick Start (2-Week Build)

### Prerequisites
- Docker & Docker Compose
- MySQL client (optional)

### 1. Clone & Setup
```bash
git clone <your-repo-url>
cd space-debris-system
cp backend/node-api/.env.example backend/node-api/.env
# Edit .env with your DB credentials if needed
```

### 2. Run with Docker Compose
```bash
docker-compose up --build
```

### 3. Access
- **Frontend:** http://localhost:3000
- **Node API:** http://localhost:5000
- **Java Risk Engine:** http://localhost:8081

### 4. Demo Login Credentials
| Username | Password | Role |
|----------|----------|------|
| admin | admin | ADMIN |
| analyst | analyst | ANALYST |
| operator | operator | OPERATOR |

## Architecture

```
Browser (React.js)
      │ HTTPS
      ▼
┌─────────────────┐
│  Node.js API    │◀── JWT Auth
│  Gateway        │
└────────┬────────┘
         │
   ┌─────┴─────┐
   ▼           ▼
Java Service  Node.js Service
(Risk Engine) (Ingest/Auth)
   │           │
   └────┬──────┘
        ▼
   MySQL (DBMS)
```

### Data Flow
1. **TLE Ingestion:** Node.js fetches TLE data from CelesTrak → stores in MySQL → queues to Java
2. **Orbit Propagation:** Java SGP4-like propagator → ephemeris in MySQL
3. **Conjunction Detection:** Java pairwise screening → PoC calculation → risk classification
4. **Mitigation:** Delta-v calculator → maneuver planning
5. **Frontend:** React + CesiumJS 3D globe + dashboard + alerts

## Project Structure
```
space-debris-system/
├── database/
│   └── schema.sql              # MySQL DDL
├── backend/
│   ├── java-risk-engine/       # Java Spring Boot (OOPS core)
│   │   ├── src/main/java/com/spacedebris/
│   │   │   ├── model/          # JPA entities (SpaceObject, TleRecord, Ephemeris, Conjunction, Maneuver, Alert)
│   │   │   ├── repo/           # Spring Data JPA repositories
│   │   │   ├── service/        # OrbitPropagation, Conjunction, Risk, Maneuver services
│   │   │   └── controller/     # REST controllers
│   │   └── pom.xml
│   └── node-api/               # Node.js Express API Gateway
│       ├── src/
│       │   ├── config/         # DB connection
│       │   ├── controllers/    # Auth, Space controllers
│       │   ├── middleware/     # JWT auth, RBAC
│       │   ├── routes/         # Auth, Objects, Risk, Mitigation, Ingest
│       │   └── services/       # TLE ingest, Java client
│       ├── server.js
│       ├── package.json
│       └── .env.example
├── frontend/
│   └── react-app/              # React.js + CesiumJS
│       ├── src/
│       │   ├── context/        # AuthContext
│       │   ├── components/     # Navbar
│       │   ├── pages/          # Dashboard, Globe, Conjunctions, Mitigation, Alerts, Login
│       │   └── services/       # API client
│       └── package.json
└── docker-compose.yml
```

## 2-Week Execution Plan

| Week | Member A (Java Backend) | Member B (Node.js API) | Member C (React Frontend) |
|------|------------------------|------------------------|---------------------------|
| 1 | Java entities, repos, SGP4 propagator, risk engine, controllers | Express setup, MySQL connection, JWT auth, routes, TLE ingest | React setup, AuthContext, API service, Login page, layout |
| 2 | Conjunction scanning, PoC, mitigation API, testing | WebSocket alerts, integration with Java engine, testing | Dashboard, CesiumJS globe, Conjunctions, Mitigation, Alerts pages |

## Free Tools Used
- **CI/CD:** GitHub Actions
- **Container:** Docker Compose
- **Auth:** JWT (Node.js) - self-hosted option: Keycloak
- **Monitoring:** Prometheus + Grafana
- **Security:** OWASP ZAP
- **Visualization:** CesiumJS (Apache 2.0)
- **Load Test:** k6
- **DB Admin:** MySQL Workbench / DBeaver

## API Endpoints

### Node.js API (Port 5000)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user
- `GET /api/objects` - List space objects
- `GET /api/conjunctions` - Active conjunctions
- `POST /api/conjunctions/:id/acknowledge` - Acknowledge conjunction
- `GET /api/maneuvers` - Planned maneuvers
- `GET /api/alerts` - Alerts
- `POST /api/ingest/tle` - Ingest TLE data
- `POST /api/risk/scan` - Trigger conjunction scan
- `GET /api/risk/objects/:id/ephemeris` - Ephemeris data
- `POST /api/risk/calculate-dv` - Delta-v calculation

### Java Risk Engine (Port 8081)
- `GET /api/risk/conjunctions` - Conjunction list
- `GET /api/risk/objects` - Space objects
- `POST /api/mitigation/maneuvers` - Plan maneuver

## License
MIT
