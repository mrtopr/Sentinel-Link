# 🎬 SentinelLink - Project Walkthrough

This document provides a step-by-step demo script for presenting SentinelLink at the hackathon. Follow this guide to showcase all key features.

---

## 🚀 Quick Start Demo

**Live URLs:**
- Frontend: https://sentinel-link-xxys.vercel.app
- Backend Health: https://sentinellink-backend.onrender.com/health

**Demo Credentials:**
- Email: `admin@sentinellink.com`
- Password: `admin123`

---

## 📱 Demo Flow 1: Citizen Experience

### Step 1: Landing Page
1. Open the homepage
2. **Highlight:**
   - Clean, modern UI with real-time stats
   - "Report Now" and "Explore Live" CTAs
   - Responsive design (resize browser to show mobile view)

### Step 2: Report an Incident
1. Click **"Report Now"** or navigate to `/report`
2. Fill out the form:
   - Select incident type (e.g., "Fire Outbreak")
   - Add description: "Smoke visible from building on 5th floor"
   - Select severity (HIGH)
   - Allow location access OR click on map to select location
   - Optionally upload an image/video
3. Submit the report
4. **Highlight:**
   - Auto-geolocation detection
   - Interactive map for manual location selection
   - Media upload with preview
   - **Helpline numbers displayed after submission**

### Step 3: View Live Incidents
1. Navigate to **Incidents** page (`/incidents`)
2. **Highlight:**
   - Real-time incident cards with images
   - Severity badges (HIGH/MEDIUM/LOW)
   - Status badges (VERIFIED, IN_PROGRESS, RESOLVED)
   - **Active/Resolved tabs** to filter incidents
   - Time-based filtering (Last 24 Hours, 7 Days, etc.)
   - Type-based filtering

### Step 4: Upvote/Verify Incident
1. Click on any incident card to open details modal
2. Click **"Confirm Incident"** button
3. **Highlight:**
   - Community verification system
   - Upvote count increases
   - After threshold (default: 3), status changes to VERIFIED automatically

### Step 5: Map View
1. Navigate to **Map View** (`/map`)
2. **Highlight:**
   - Interactive Leaflet map with incident markers
   - Color-coded markers by severity
   - Click on marker to see incident details
   - Radius filter slider
   - Only **active incidents** shown (resolved filtered out)
   - Click "View on Map" from incident modal → centers on that location

---

## 🛡️ Demo Flow 2: Admin Experience

### Step 1: Admin Login
1. Click **"Go to Dashboard"** in navbar
2. Enter credentials:
   - Email: `admin@sentinellink.com`
   - Password: `admin123`
3. **Highlight:**
   - JWT-based authentication
   - Protected routes (try accessing `/admin/dashboard` without login)

### Step 2: Admin Dashboard Overview
1. View the command center dashboard
2. **Highlight:**
   - Real-time KPI cards (Total, Pending, Active, Resolved)
   - Live incident feed with status management
   - Socket.IO real-time updates (new incidents appear automatically)

### Step 3: Manage Incidents
1. Find an incident in the list
2. **Actions available:**
   - Change status: REPORTED → VERIFIED → IN_PROGRESS → RESOLVED
   - Update severity level
   - Delete incident
3. **Highlight:**
   - Status changes reflect immediately on frontend
   - Socket.IO broadcasts updates to all connected clients

### Step 4: Emergency Broadcast (if available)
1. Show the broadcast feature
2. **Highlight:**
   - System-wide alerts to all connected users
   - Real-time notification banner

### Step 5: Logout
1. Click logout button
2. Confirm redirect to login page
3. Confirm protected routes are inaccessible

---

## 🔧 Technical Highlights to Mention

### Real-Time Architecture
```
User Reports Incident
       ↓
Backend saves to PostgreSQL
       ↓
Socket.IO emits 'incident:new'
       ↓
All connected clients update instantly
```

### Duplicate Detection
- Flags incidents within **200 meters** and **10 minutes** of similar reports
- Prevents spam and duplicate submissions during emergencies
- Tagged as `[POTENTIAL DUPLICATE]` for admin review

### Community Verification
- Upvote system allows citizens to verify reports
- After **3 upvotes**, status auto-upgrades to VERIFIED
- Prevents false reports from overwhelming the system

### Responsive Design
- Works on desktop, tablet, and mobile
- Mobile-first approach for on-the-go reporting

---

## 🎯 Key Talking Points

1. **Problem Statement:**
   - Gap between citizens reporting emergencies and authorities responding
   - Lack of centralized, real-time incident visibility

2. **Our Solution:**
   - Real-time incident reporting with geolocation
   - Community-driven verification
   - Admin dashboard for authorities
   - Live map visualization

3. **Technical Innovation:**
   - Socket.IO for real-time updates
   - Duplicate detection algorithm
   - Cloudinary for efficient media handling
   - PostgreSQL + Prisma for robust data management

4. **Scalability:**
   - Stateless backend for horizontal scaling
   - WebSocket rooms for efficient broadcasting
   - Media offloaded to CDN (Cloudinary)

5. **Future Scope:**
   - AI-based severity prediction
   - Push notifications
   - Role-based responder accounts
   - Multi-city deployment

---

## ⏱️ Suggested Demo Timeline (5 min)

| Time | Section |
|------|---------|
| 0:00 - 0:30 | Problem statement & solution overview |
| 0:30 - 1:30 | Citizen flow: Report incident |
| 1:30 - 2:30 | View incidents & map |
| 2:30 - 3:30 | Admin dashboard & management |
| 3:30 - 4:30 | Technical architecture explanation |
| 4:30 - 5:00 | Future scope & Q&A |

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend not responding | Check Render deployment, may need to wake up (free tier) |
| Login not working | Verify credentials, check browser console for errors |
| Map not loading | Check if location permissions are granted |
| Images not uploading | Verify Cloudinary configuration |

---
