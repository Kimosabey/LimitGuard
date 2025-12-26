# 🌊 Technical Flow & Architecture

## 🏗️ High-Level Architecture
LimitGuard implements a **Distributed Gateway Pattern** to protect APIs from abuse.

```mermaid
graph TD
    User([User / Attacker]) -->|HTTPS| LB[Node.js Gateway]
    LB -->|1. Request Intercept| Middleware[LimitGuard Middleware]
    
    subgraph "Atomic Verification"
        Middleware -->|2. EVALSHA| Redis[(Redis AOF)]
        Redis -->|3. Lua Script| Logic{Check & Incr}
    end
    
    Logic -- Allowed --> Middleware
    Logic -- Blocked --> Middleware
    
    Middleware -->|4a. Allowed (200)| Controller[API Logic]
    Middleware -->|4b. Blocked (429)| Response[Error Response]
```

## 🧠 The "Brain": Atomic Lua Script
To prevent **Race Conditions** (TOCTOU - Time Of Check to Time Of Use), we execute logic inside Redis.

**The Script (`b5a4...`):**
1.  **KEYS[1]:** Unique User ID (IP Address).
2.  **ARGV[1]:** Window Size (e.g., 60 seconds).
3.  **ARGV[2]:** Request Limit (e.g., 10 requests).

**Pseudo-Code:**
```lua
current = INCR(key)
ttl = TTL(key)
if (current == 1) then
    EXPIRE(key, window)
    ttl = window
end

allowed = (current <= limit) ? 1 : 0
return [allowed, current, ttl] -- Returns Array
```

## 🔄 Request Lifecycle
1.  **Incoming:** `GET /api/test` from `192.168.1.50`
2.  **Identification:** Server extracts IP.
3.  **Geo-Tagging:** `geoip-lite` resolves IP to "US".
4.  **Rate Check:** Middleware calls Redis `EVAL`.
5.  **Decision & Headers:**
    *   **Logic:** Middleware blocks if `allowed == 0`.
    *   **Headers:** Server adds `X-RateLimit-Reset: <ttl>` and `X-RateLimit-Remaining: <limit - current>`.
    *   **CORS:** Headers are explicitly exposed to the browser.
6.  **Telemetry:** Dashboard polls `/api/status`, and Client reads headers for Countdown Timer.

## 🛠️ Components
- **Server:** Express.js (HTTPS)
- **Database:** Redis (AOF Persistence)
- **Frontend:** Next.js + Recharts + React Simple Maps
- **Animation:** Framer Motion
