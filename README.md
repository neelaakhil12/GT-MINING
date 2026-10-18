# GT Mining — Virtual Coin Mining & Referral Platform

A full-stack, production-ready dynamic web application inspired by Pi-style virtual coin mining networks. Built with a **React.js SPA** frontend (Vite + TypeScript + Tailwind CSS) and a high-performance **Node.js Express** backend with an ACID-compliant, atomic transaction ledger.

---

## 🌟 Key Features

1. **Authoritative 4-Hour Mining Engine**:
   - Exactly **1.0 GT** coin credited per successful mining session.
   - Strictly enforced **4-hour cooldown** (14,400 seconds) on the server using UTC timestamps.
   - Concurrency mutex lock prevents race conditions, multi-tab abuse, and duplicate claims.
   - Live countdown timer formatted as `HH:MM:SS` that persists across device changes and page refreshes.
   - Animated 3D GT coin medallion with celebratory confetti effects on claim.

2. **Decentralized Referral Network**:
   - Unique referral code (e.g. `GT88241`) and shareable invite URL for every registered member.
   - Automatic referral code capture via `?ref=CODE` signup link parameter.
   - 1-click clipboard copy with toast feedback.
   - Native Web Share API integration + dedicated buttons for **WhatsApp**, **Telegram**, **X (Twitter)**, **Facebook**, and **Instagram**.
   - Live friend activity tracking (Active miners within configurable threshold days).
   - Configurable referral bonus rewards credited to the ledger.

3. **Cryptographically Verified Wallet Ledger**:
   - Available balance and lifetime earned balance tracking.
   - Auditable transactions ledger for Mining Rewards, Referral Bonuses, and Admin Adjustments.
   - Idempotency key tracking to guarantee zero double-credits.

4. **Community Timeline & Project Announcements**:
   - X/Twitter-inspired social news timeline with categories (`Announcement`, `Update`, `Ecosystem`, `Guide`).
   - Pinned announcements and read-more content expansion.
   - Admin publishing, editing, and deleting capabilities.

5. **Profile & GDPR Account Deletion**:
   - Edit personal details and password change security.
   - Email change request workflow.
   - True backend **Account Deletion**: Requires confirmation text `"DELETE"` and password re-authentication. Anonymizes user records while preserving ledger mathematical consistency.

6. **Comprehensive Admin Control Center (`/admin/dashboard`)**:
   - Real-time platform metrics (Total registered users, Active miners, Total claims, Total coins issued).
   - User Management: Search users, view balances, suspend/reactivate with mandatory audit reasons.
   - Mining Configuration: Customize reward per claim, cooldown hours, or globally toggle mining.
   - Referral Configuration: Configure bonus rewards and active-user threshold.
   - Ledger & Manual Adjustment: Safely adjust balances with mandatory recorded reasons.
   - Community News Publishing: Create, pin, and manage announcements.
   - Security Audit Trail: Complete administrative action log.

---

## 🎨 Design System: Green Glassmorphism

- **Primary Green**: `#16A34A`
- **Secondary Green**: `#22C55E`
- **Accent Light Green**: `#86EFAC`
- **Main Dark Background**: `#07130D`
- **Secondary Dark Background**: `#0B1F14`
- **Glass Card Background**: `rgba(255, 255, 255, 0.06)` with backdrop blur
- **Glass Border**: `rgba(134, 239, 172, 0.18)`
- **Typography**: Google Fonts (*Outfit* and *Plus Jakarta Sans*)

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18+ recommended, v24 supported)
- npm (v9+)

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Start Both Server and Client
From the root directory:
```bash
npm run dev
```

- **Frontend (React.js SPA)**: [http://localhost:5174](http://localhost:5174)
- **Backend (Express API Server)**: [http://localhost:5050](http://localhost:5050)

---

## 🔑 Default Accounts for Testing

| Role | Email | Password | Referral Code |
|---|---|---|---|
| **Administrator** | `admin@gtmining.com` | `Admin@123456` | `GTADMIN` |
| **Demo Miner** | `demo@gtmining.com` | `User@123456` | `GT88241` |

*Both accounts can also be filled in 1-click on the Login Page using the "Instant Test Fill" buttons.*

---

## ⚙️ Environment Variables (`.env.example`)

Create a `.env` file in the `server` directory with:

```env
PORT=5050
JWT_SECRET=gt-mining-secret-super-key-2026
WEBSITE_URL=http://localhost:5174
```

---

## 📁 Project Architecture

```
gt/
├── run-all.js                  # Cross-platform runner starting both client & server
├── package.json                # Root package configuration
├── client/                     # Vite + React.js SPA Frontend
│   ├── index.html              # HTML shell with Google Fonts and GT Coin favicon
│   ├── vite.config.ts          # Vite configuration with API proxy to port 5050
│   └── src/
│       ├── types/              # Strongly typed TypeScript definitions
│       ├── services/api.ts     # Client API service with JWT authentication
│       ├── context/            # AuthContext & ToastContext
│       ├── components/         # Navbar, Sidebar, BottomNav, GtCoin, GlassCard
│       └── pages/              # Landing, Login, Signup, Dashboard, Mining,
│                               # Wallet, Referrals, Community, Profile, Admin
└── server/                     # Node.js + Express API Backend
    ├── data/database.json      # Persistent ACID-compliant database ledger
    └── src/
        ├── db.js               # Concurrency mutex locks & atomic database engine
        ├── middleware/auth.js  # JWT authentication & requireAdmin middleware
        ├── routes/             # auth, mining, dashboard, referrals, wallet,
        │                       # community, profile, notifications, admin
        └── index.js            # Express server initialization & rate limiting
```

---

## 🛡️ Security & Integrity

- **Password Hashing**: Salted hashing via `bcryptjs`.
- **Authoritative Mining Verification**: Claim requests are validated exclusively on the server using UTC timestamps. Rate limiting and mutex locks prevent duplicate reward issuance.
- **Role-Based Access Control**: All `/api/admin/*` endpoints strictly require verified `ADMIN` tokens.
- **Auditable Ledger**: Balance adjustments and account suspensions require recorded reasons and are permanently tracked in `adminAuditLogs`.
