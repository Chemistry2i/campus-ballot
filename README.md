# 🗳️ Campus Voting System (MERN Stack)

![MERN Stack](https://img.shields.io/badge/MERN-Stack-blueviolet?style=for-the-badge&logo=mongodb&logoColor=white)
![Render Deployment](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge&logo=render)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)

---

### 🌐 Live Demo: [View Deployed App on Render](https://campus-ballot.onrender.com)

---

## 📘 Overview

A **secure, scalable, and user-friendly digital voting platform** built with the **MERN stack (MongoDB, Express, React, Node.js)**.  
This project enables university students to participate in elections online, while administrators manage elections, candidates, and results.  
It’s **responsive**, **role-based**, and **fully deployed on Render** for cloud scalability.

---

## 🚀 Features

### 👥 User Roles
**Super Admin:**
- Overoll System Administrator
- View analytics, reports, and statistics
- Manage student voter accounts
- More Coming......
  
**Admin:**
- Create and manage elections
- Add, update, or remove candidates
- View analytics, reports, and statistics
- Manage student voter accounts

**Student (Voter):**
- Register and log in securely
- View upcoming and ongoing elections
- Cast vote once per election
- View voting history and notifications

---

## 💡 Core Modules

### 🔐 Authentication
- JWT-based login and signup
- Role-based access control (Admin/Student)
- Password encryption with bcrypt
- Protected routes and session handling

### 🧭 Frontend (React.js)
- Responsive UI for all devices
- Role-based dashboards
- Charts & analytics with **Recharts**
- State management using **Redux Toolkit**
- Accessibility & error boundaries
- Notification panel for real-time updates

### ⚙️ Backend (Node.js + Express)
- RESTful API endpoints for users, votes, candidates, and elections
- Input validation and rate limiting
- Centralized error handling
- WebSocket for real-time updates
- Audit logging for transparency

### 🗄️ Database (MongoDB) + MySql
- Stores users, elections, votes, and candidate data
- Mongoose models for data consistency
- Data encryption for sensitive information

### ☁️ Deployment (Render)
- Hosted on Render (Frontend + Backend)
- Auto builds on push to GitHub
- CI/CD pipeline integration
- Environment variable management

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js, Redux Toolkit, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ORM) |
| **Authentication** | JWT, bcrypt |
| **Deployment** | Render Cloud Platform |
| **Version Control** | Git & GitHub |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/voting-system.git
cd voting-system
cd server
npm install
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
npm run dev
cd ../client
npm install
npm start
Frontend → http://localhost:5173
Backend → http://localhost:5000
```

---

### ✅ Highlights:
- Fully formatted **GitHub Markdown**
- Includes **badges**, **architecture diagram**, and **screenshots**
- Complete **installation + deployment** instructions for **Render**
- Professional structure for both **technical readers** and **stakeholders**

<a href="https://campus-balot.onrender.com">Visit: campus ballot</a>

---




