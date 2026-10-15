# Alpha Encoders — Backend API & CRM Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)](https://mongoosejs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

The high-performance Express & TypeScript backend engine powering the **Alpha Encoders** digital engineering studio. This service provides persistent MongoDB Atlas cloud storage alongside automatic local JSON snapshot caching for commercial proposal quotations, client CRM leads, verified case study portfolios, and studio performance analytics.

---

## ⚡ Core Features

- **MongoDB Atlas Cloud Database**: Direct connection to MongoDB Atlas cluster (`cluster0.cuqbzoa.mongodb.net/edusphere`) with Mongoose ODM and auto-seeding.
- **Dedicated Collections**:
  - `alpha_inquiries`: Ingestion pipeline for prospective client scopes, budgets, and contact briefs.
  - `alpha_projects`: Verified digital engineering case studies (**TheCustomNest**, **JavaLearn**, **EduSphere**, Computer Science Research).
  - `alpha_users`: Client CRM directory with lifetime value tracking, WhatsApp integration, and engagement history.
  - `alpha_quotations`: Commercial proposal quotations with deliverables, milestones, and tax calculations.
- **Resilient Hybrid Persistence**:
  - Primary: Live cloud operations on MongoDB Atlas.
  - Fallback: Automatic local `data/db.json` cache ensuring 100% server uptime even if internet connectivity or remote database temporarily fluctuates.
- **Proposal Quotation API (`/api/quotations`)**: Cloud-saved commercial proposals with unique quote IDs, payment milestone schedules (50/30/20), and multi-currency rates.
- **Studio Performance Analytics (`/api/admin/stats`)**: Real-time conversion metrics, active client counts, and revenue pipeline projections.
- **Administrative Authentication (`/api/auth/login`)**: Protected session authentication for the admin studio.

---

## 📁 Repository Structure

```text
├── data/
│   └── db.json          # Persistent local snapshot cache
├── index.ts             # Express application with Mongoose schemas & typed REST routes
├── package.json         # Dependencies (Express, Mongoose, CORS, Dotenv, TypeScript, tsx)
├── tsconfig.json        # TypeScript configuration (ES2022 / NodeNext)
├── .env.example         # Template for environment variables (including MONGODB_URI)
└── README.md            # Comprehensive service documentation
```

---

## 🛠️ REST API Reference

### 1. Inquiries & Lead Capture
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/inquiries` | Retrieve all client inquiries |
| `POST` | `/api/inquiries` | Submit a new project brief / scope |
| `PUT` | `/api/inquiries/:id` | Update inquiry status or administrative notes |
| `DELETE` | `/api/inquiries/:id` | Delete an inquiry record |

### 2. Portfolio Projects & Case Studies
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects` | List all verified digital engineering projects |
| `POST` | `/api/projects` | Create a new case study record |
| `PUT` | `/api/projects/:id` | Update project details, URLs, or metrics |
| `DELETE` | `/api/projects/:id` | Remove a case study from the portfolio |

### 3. Client & User CRM Directory
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/users` | List all registered clients and partners |
| `POST` | `/api/users` | Register a new client profile |
| `PUT` | `/api/users/:id` | Update client contact details or project history |
| `DELETE` | `/api/users/:id` | Delete a client profile |

### 4. Commercial Quotations & Proposals
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/quotations` | List all cloud-stored proposal quotations |
| `POST` | `/api/quotations` | Save or update a commercial proposal |
| `GET` | `/api/quotations/:id` | Retrieve quotation by reference ID |

### 5. Admin Auth & System Metrics
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate administrator credentials |
| `GET` | `/api/admin/stats` | Aggregate inquiries, active projects, and revenue metrics |
| `GET` | `/api/health` | Health check with live MongoDB Atlas connection status |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/Kabil-8/Alpha-Encoders-Backend.git
cd Alpha-Encoders-Backend

# Install dependencies
npm install
```

### Environment Configuration
```bash
cp .env.example .env
```

Your `.env` file contains:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://projectalphateam308_db_user:6dUMWkCu3MYsGcis@cluster0.cuqbzoa.mongodb.net/edusphere?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
ADMIN_SESSION_SECRET=alpha_encoders_secret_key_2026
```

### Running Locally
```bash
# Start development server with live watch mode
npm run dev

# Or start in standard execution mode
npm start
```
The API server will listen on `http://localhost:5000` and automatically connect to MongoDB Atlas.

---

## ☁️ Deployment

This service can be deployed on any modern Node.js cloud platform:
- **Render**: Connect repository, set build command to `npm install` and start command to `npm start`. Add `MONGODB_URI` in Environment Settings.
- **Railway**: Automatic Docker / Nixpacks detection with environment variable configuration.
- **Fly.io / AWS ECS**: Containerized deployment with environment variable injection.

---

## 📄 License
MIT © [Alpha Encoders](https://alphaencoders.com) & [Kabil-8](https://github.com/Kabil-8)
