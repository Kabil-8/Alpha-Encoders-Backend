# Alpha Encoders — Backend API & CRM Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

The high-performance Express & TypeScript backend engine powering the **Alpha Encoders** digital engineering studio. This service handles commercial proposal quotation management, client inquiry CRM ingestion, verified case study data, registered user directories, and administrative analytics.

---

## ⚡ Core Features

- **Lead & Inquiry Intake Pipeline (`/api/inquiries`)**: Captures prospective client project briefs, budget ranges, required feature scopes, and contact details with real-time status management (`new`, `contacted`, `in_review`, `closed`).
- **Verified Portfolio & Case Study Engine (`/api/projects`)**: Serves technical project case studies (including live links for **TheCustomNest**, **JavaLearn**, and **EduSphere**), performance metrics (Lighthouse 99/100, page speeds), and technology stacks.
- **Client & User CRM Directory (`/api/users`)**: Manages client profiles, project histories, total contract values, direct WhatsApp contacts, and automated pre-filling for proposal quotations.
- **Studio Performance Analytics (`/api/admin/stats`)**: Delivers dynamic studio statistics, conversion rates, and revenue pipeline projections.
- **Admin Authentication (`/api/auth/login`)**: Protected administrative session authentication for managing client records and active projects.
- **JSON Persistent Store**: Fast, lightweight, zero-dependency persistent JSON database located in `data/db.json`.

---

## 📁 Repository Structure

```text
├── data/
│   └── db.json          # Persistent JSON database (inquiries, projects, users, stats)
├── index.ts             # Main Express server application with typed REST routes
├── package.json         # Service dependencies and runner scripts
├── tsconfig.json        # TypeScript configuration (ES2022 / NodeNext)
├── .env.example         # Template for environment variables
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

### 4. Admin Auth & System Metrics
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate administrator credentials |
| `GET` | `/api/admin/stats` | Aggregate inquiries, active projects, and revenue metrics |
| `GET` | `/health` | Service health status check |

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
Default port is `5000`.

### Running Locally
```bash
# Start development server with live watch mode
npm run dev

# Or start in standard execution mode
npm start
```
The API server will listen on `http://localhost:5000`.

---

## ☁️ Deployment

This service can be deployed on any modern Node.js cloud platform:
- **Render**: Connect repository, set build command to `npm install` and start command to `npm start`.
- **Railway**: Automatic Docker / Nixpacks detection with environment variable configuration.
- **Fly.io / AWS ECS**: Containerized deployment with persistent volume mount for `data/db.json`.

---

## 📄 License
MIT © [Alpha Encoders](https://alphaencoders.com) & [Kabil-8](https://github.com/Kabil-8)
