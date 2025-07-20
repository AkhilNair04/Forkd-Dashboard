# Forkd Dashboard

Forkd Dashboard is an internal admin panel built using **React**, **TypeScript**, and **Tailwind CSS**, designed to manage users, chefs, riders, and handle complaints for the Forkd platform. It provides a secure interface for admins to monitor platform activity, moderate behavior, and take actions like approval, suspension, or banning of users.

---

## 🧠 Features

### 👥 Users Management
- View all participants in complaints or violations (users, chefs, riders)
- Ban, suspend, or reactivate users with reason and scheduled end date
- Persistent action history with timestamps
- Search users by ID or name

### 🍳 Chefs Panel
- Manage requests, approvals, rejections, suspensions, and bans
- View submitted documents like FSSAI certificate and PCC
- Centralized approve/reject buttons for batch actions
- Display ratings and rejection history
- Actions include Chat, Suspend, Ban (with modals for reason input)

### 🛵 Riders Panel
- Similar to Chefs panel, with extra fields:
  - State
  - Driving license number and image
- Upon approval, generate an issuance number
- Display insurance company contact info

### 📣 Complaints Management
- Categorized by complainant (Users, Chefs, Riders)
- Sub-tabs: **Pending** and **Resolved**
- View complaint details:
  - Complaint text
  - Observations
  - Attached proofs
  - Accused party info
- Admin actions (resolve, dismiss, suspend, ban) require a reason
- Status updates and responses to complainant are automated

### 📊 Dashboard Overview
- Summary statistics for:
  - Total users, chefs, riders
  - Orders and transactions
- Graphs and activity breakdowns (under development)

### 🔐 Authentication
- Basic login page with hardcoded admin credentials (for dev/testing only)

---

## 🚀 Tech Stack

- **React** (Functional Components + Hooks)
- **TypeScript** for static typing
- **Tailwind CSS** for UI styling
- **React Router DOM** for routing
- **Context API** and custom hooks for state management
- **Heroicons** / **React Icons** for iconography

---

## 📁 Folder Structure

```plaintext
src/
├── assets/           # Static files (images, icons)
├── components/       # Reusable UI components
├── context/          # Context providers and state logic
├── pages/            # Page-level components (Dashboard, Users, Chefs, etc.)
├── routes/           # Routing configuration
├── utils/            # Utility functions and constants
├── App.tsx           # Main application component
└── main.tsx          # Entry point

## 🛠️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/AkhilNair04/Forkd-Dashboard.git
cd Forkd-Dashboard

# Install dependencies
npm install

# Run the development server
npm run dev

## 📌 Notes

- This dashboard is intended for internal admin use only.
- Authentication and data are currently mocked/hardcoded for development purposes.
- Live database/API integration is pending or in-progress.
- All actions (ban, suspend, resolve, etc.) require a reason via modal prompts for accountability.

---

## 📧 Contact

Maintained by **Akhil Nair**  
Feel free to raise issues or contribute via PRs!

---
