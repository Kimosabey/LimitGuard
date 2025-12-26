# 🛠️ LimitGuard Setup Guide

## Prerequisites
- **Node.js**: v18+ (LTS recommended)
- **Docker**: Desktop or Engine (For Redis)
- **PowerShell** (Windows) or **Bash** (Linux/Mac)

## 📦 Installation

1.  **Clone the Repository** (if applicable) or navigate to root.
2.  **Install Dependencies**:
    ```bash
    npm install
    cd dashboard
    npm install
    cd ..
    ```

## 🚀 Quick Start (Orchestrator)
We use a custom orchestrator script to handle SSL, IP detection, and concurrent startup.

```bash
# In the root directory
npm run dev
```

This will:
1.  **Generate SSL Certs** (if missing).
2.  **Start Redis** (via Docker).
3.  **Launch Backend** (Port 4000).
4.  **Launch Frontend** (Port 3000).
5.  **Log Access URLs** (Localhost & LAN IP).

## 🌍 Environment Configuration
The system auto-detects most settings, but you can configure `.env`:

**Backend (`.env`):**
```ini
PORT=4000
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Frontend (`dashboard/.env.local`):**
*Automatically updated by `scripts/start_dev.js` on startup.*
```ini
NEXT_PUBLIC_API_URL=https://<YOUR_LAN_IP>:4000/api/test
```

## ⚠️ Troubleshooting

**1. "SSL Error" or "Privacy Warning"**
- Since we use **Self-Signed Certificates**, browsers will warn you.
- **Fix:** Click "Advanced" -> "Proceed to localhost (unsafe)" for **BOTH**:
    - `https://localhost:3000`
    - `https://localhost:4000/api/test` (You must visit the API directly once to accept the cert).

**2. "Redis Connection Failed"**
- Ensure Docker is running.
- The app will fallback to **Fail-Open** mode (allowing all traffic) if Redis is down.

**3. "429 Too Many Requests" on Dashboard**
- Fixed in v1.1. Monitoring endpoints (`/api/status`) are now whitelisted and bypass the rate limiter.
