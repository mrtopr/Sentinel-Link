# 🚨 SentinelLink (Anginat) - Emergency Response Coordination Platform

**SentinelLink** (codenamed *Anginat*) is a real-time incident reporting and resource coordination platform designed to bridge the gap between citizens reporting emergencies and authorities responding to them.

Built for a **Hackathon**, the platform leverages real-time communication, geospatial visualization, community validation, and automated duplicate detection to streamline emergency response.

![Live Feed Status](https://img.shields.io/badge/Status-Live-green)
![Tech Stack](https://img.shields.io/badge/Stack-PERN-blue)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## 🌐 Live Deployment

> ⚠️ **Note:** This is a hackathon demo environment deployed for evaluation and testing purposes.

### 🔗 Application

- **Frontend (Vercel):** [https://sentinel-link-xxys.vercel.app](https://sentinel-link-xxys.vercel.app)
- **Backend API (Render):** [https://sentinellink-backend.onrender.com](https://sentinellink-backend.onrender.com)
- **API Health Check:** [https://sentinellink-backend.onrender.com/health](https://sentinellink-backend.onrender.com/health)

### 💻 Source Code

- **Frontend Repository:** [SentinelLink-Frontend](https://github.com/mrtopr/SentinelLink-Frontend)
- **Backend Repository:** [SentinelLink-Backend](https://github.com/mrtopr/SentinelLink-Backend)

---

## ✨ Key Features

### 🌍 For Citizens

- **🚨 Instant Reporting**  
  Report incidents such as Fire, Accident, Medical Emergency, and other critical events with location detection and media uploads.

- **🗺️ Live Map View**  
  Visualize ongoing incidents in real time using an interactive map and heatmap.

- **👍 Community Validation**  
  Citizens can upvote reported incidents to help verify their authenticity and significance.

- **📱 Responsive Design**  
  Mobile-first interface designed for quick emergency reporting from any device.

---

### 🛡️ For Authorities (Admin)

- **📊 Command Dashboard**  
  Centralized view of active incidents, severity levels, statuses, and emergency trends.

- **⚡ Real-Time Updates**  
  Receive instant notifications through Socket.IO whenever new incidents are reported or existing incidents are updated.

- **🛠️ Incident Management**  
  Verify, resolve, flag, update, or delete reported incidents.

- **🔍 Duplicate Detection**  
  Automatically flag potentially duplicate reports based on geographical and temporal proximity.

  **Default detection parameters:**
  - Distance: `200 meters`
  - Time Window: `10 minutes`

- **📢 Emergency Broadcast**  
  Trigger system-wide emergency alerts for all connected users.

---

## 🛠️ Technology Stack

| Component | Technologies |
| --- | --- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS |
| **Maps** | Leaflet |
| **Real-Time Client** | Socket.IO Client |
| **Backend** | Node.js, Express |
| **ORM** | Prisma ORM |
| **Database** | PostgreSQL |
| **Real-Time Server** | Socket.IO |
| **Media Storage** | Cloudinary |
| **Development** | TypeScript, ESLint |
| **Frontend Deployment** | Vercel |
| **Backend Deployment** | Render |

---

## 🧠 System Architecture & Scalability

### Architecture Overview

SentinelLink follows a modern client-server architecture combining **REST APIs** with **WebSocket-based real-time communication**.

```text
┌─────────────────────────────┐
│       Citizen / Admin       │
│        Web Browser          │
└──────────────┬──────────────┘
               │
          HTTPS / WSS
               │
               ▼
┌─────────────────────────────┐
│       React Frontend        │
│   Vite + TypeScript         │
│   Tailwind + Leaflet        │
└──────────────┬──────────────┘
               │
       REST API + Socket.IO
               │
               ▼
┌─────────────────────────────┐
│      Node.js Backend        │
│        Express API          │
│         Socket.IO           │
└──────────┬─────────┬────────┘
           │         │
           ▼         ▼
┌────────────────┐  ┌────────────────┐
│   PostgreSQL   │  │   Cloudinary   │
│    + Prisma    │  │ Media Storage  │
└────────────────┘  └────────────────┘
```

### How It Works

- Frontend communicates with the backend using **REST APIs** and **WebSockets**.
- Backend handles authentication, incident processing, duplicate detection, and real-time updates.
- **PostgreSQL** stores structured incident, user, and verification data.
- **Prisma ORM** provides type-safe database access.
- **Cloudinary** handles media uploads and storage.
- **Socket.IO** ensures low-latency communication between citizens and authorities.
- **Leaflet** powers interactive geospatial incident visualization.

---

## 📈 Scalability Considerations

SentinelLink was designed with future scalability in mind.

- **Stateless Backend**  
  Enables horizontal scaling across multiple backend instances.

- **WebSocket Rooms**  
  Reduce unnecessary broadcast traffic by targeting relevant connected clients.

- **Duplicate Detection**  
  Helps reduce redundant emergency reports during high-traffic events.

- **Cloud Media Storage**  
  Media files are offloaded to Cloudinary instead of being stored directly on the application server.

- **Database Indexing**  
  Time and geolocation-related fields can be indexed for efficient incident queries.

- **Modular Architecture**  
  Backend services and frontend components can be extended independently.

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed or configured:

- Node.js `v18+`
- npm
- PostgreSQL
- Cloudinary Account
- Git

---

## 1️⃣ Clone the Repository

Clone the project:

```bash
git clone https://github.com/mrtopr/SentinelLink.git
cd SentinelLink
```

The repository contains both the frontend and backend:

```text
SentinelLink/
├── backend/
├── frontend/
├── README.md
└── WALKTHROUGH.md
```

---

## 2️⃣ Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=3000

DATABASE_URL="postgresql://user:password@localhost:5432/anginat_db"

JWT_SECRET="super_secret_key_change_me"

CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
```

> ⚠️ **Security:** Never commit your `.env` file or production credentials to GitHub.

### Run Prisma Migrations

```bash
npx prisma migrate dev --name init
```

Generate the Prisma client:

```bash
npx prisma generate
```

### Start the Backend

```bash
npm run dev
```

The backend should now be running at:

```text
http://localhost:3000
```

---

## 3️⃣ Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Start the Frontend

```bash
npm run dev
```

The frontend should now be running at:

```text
http://localhost:5173
```

---

# 📡 API Reference

### Base URL

```text
/api
```

---

## 🚨 Incident APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/incidents` | Retrieve incidents with optional filters |
| `POST` | `/incidents` | Report a new incident using `multipart/form-data` |
| `GET` | `/incidents/:id` | Retrieve details of a specific incident |
| `PATCH` | `/incidents/:id/status` | Update incident status (Admin) |
| `PATCH` | `/incidents/:id/severity` | Update incident severity (Admin) |
| `DELETE` | `/incidents/:id` | Delete an incident (Admin) |

---

## 🔐 Authentication APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/login` | Authenticate an administrator |

---

## 📊 Statistics APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/incidents/stats` | Retrieve aggregate incident metrics |

---

# 🔐 Demo Credentials

> ⚠️ Demo credentials are intended only for hackathon evaluation and testing.

If authentication is required during evaluation:

```text
Admin Email: admin@sentinellink.com
Password: admin123
```

> **Security Note:** These credentials should be removed or replaced before any production deployment.

---

# 🔄 Real-Time Communication

SentinelLink uses **Socket.IO** to synchronize emergency information between citizens and authorities.

### Typical Real-Time Flow

```text
Citizen Reports Incident
          │
          ▼
Backend Processes Report
          │
          ├──► Store in PostgreSQL
          │
          ├──► Check for Duplicates
          │
          └──► Upload Media to Cloudinary
                       │
                       ▼
                Socket.IO Event
                       │
                       ▼
              Authority Dashboard
                       │
                       ▼
                 Live UI Update
```

This allows authorities to receive new emergency reports without manually refreshing the dashboard.

---

# 🔍 Duplicate Detection

During large-scale emergencies, multiple citizens may report the same event.

SentinelLink attempts to identify duplicate reports using:

- Geographic distance
- Report timestamps
- Incident proximity

### Default Configuration

```text
Maximum Distance: 200 meters
Maximum Time Difference: 10 minutes
```

Reports falling within these thresholds can be flagged as potential duplicates for authority review.

---

# 📂 Project Structure

```text
SentinelLink/
│
├── backend/
│   ├── prisma/
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── data/
│   │
│   ├── .env
│   └── package.json
│
├── README.md
└── WALKTHROUGH.md
```

---

# 🔮 Future Scope & Enhancements

## 🤖 AI & Automation

- AI-based incident classification
- Automatic severity prediction
- Image-based emergency detection
- Intelligent duplicate detection
- Automated authority assignment

## 🚑 Emergency Response

- Role-based responder accounts
- Police department integration
- Fire department integration
- Ambulance and medical responder integration
- Nearby responder assignment
- Emergency resource tracking

## 📢 Notifications

- Web Push notifications
- Firebase Cloud Messaging (FCM)
- SMS emergency alerts
- Location-based alerts
- Regional emergency broadcasts

## 🌍 Large-Scale Deployment

- Multi-city support
- District-level dashboards
- State-level command centers
- Regional incident analytics
- Disaster management authority integration

## 🔐 Security & Integrity

- Role-Based Access Control (RBAC)
- Detailed audit logs
- Rate limiting
- Advanced authentication
- Blockchain-based incident integrity and audit trails

---

# 🤝 Contributing

Contributions are welcome!

### 1. Fork the Repository

Create your own fork of the project.

### 2. Create a Feature Branch

```bash
git checkout -b feature/amazing-feature
```

### 3. Commit Your Changes

```bash
git add .
git commit -m "Add amazing feature"
```

### 4. Push Your Branch

```bash
git push origin feature/amazing-feature
```

### 5. Open a Pull Request

Submit a pull request describing your changes.

---

# 📄 License

This project is distributed under the **MIT License**.

---

<div align="center">

# 🚨 SentinelLink

### Report Faster. Respond Smarter. Save Lives.

**Built with ❤️ for the Hackathon**

</div>
