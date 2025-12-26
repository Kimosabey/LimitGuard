# 🧪 Test Cases & Scenarios

## 1. 🛡️ Basic Rate Limiting
**Goal:** Verify the system blocks requests after the limit is reached.

- **Config:** Limit = 10, Window = 60s.
- **Action:** Send 15 requests rapidly.
- **Expectation:**
    - Requests 1-10: `200 OK`
    - Requests 11-15: `429 Too Many Requests`
    - Dashboard: "Traffic Volume" shows sharp drop to Red.

## 2. ⚡ Concurrency (Race Condition)
**Goal:** Verify atomic counters prevent "leaking" requests under load.

- **Tool:** PowerShell / Apache Bench / JMeter.
- **Command:**
  ```powershell
  1..50 | % { Start-ThreadJob { Invoke-RestMethod ... } }
  ```
- **Expectation:** Exactly 10 requests succeed. Even if 50 hit at the exact same millisecond, Redis queues them.

## 3. 🔌 Fail-Open Strategy (Resilience)
**Goal:** Verify system prioritizes **Availability** over **Security** during outages.

- **Action:** Kill Redis container (`docker stop limitguard-redis`).
- **Send Request:** `GET /api/test`
- **Expectation:** `200 OK`.
- **Log Output:** `❌ Redis error: Connection lost. Allowing request (Fail-Open).`

## 4. 🌍 Dynamic Rules & Geo-Fencing
**Goal:** Verify rules can be changed without restart.

- **Action:** Use Dashboard to set Limit = 5.
- **Verify:** Send 6 requests. 6th should block.
- **Visuals:** "Traffic Origins" map should light up corresponding to IP (Randomized for localhost demo).

## 5. 🔍 Security & Headers
**Verify Response Headers:**
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 10
X-RateLimit-Window: 60
X-RateLimit-Remaining: 9
Content-Type: application/json
```
**Verify Protocol:**
- Accessing `http://localhost:8800` should fail or redirect (depending on config).
- Accessing `https://localhost:8800` works (with cert warning).

## 6. ⏳ Precision Timer Verification
**Goal:** Verify the client receives the exact reset time (TTL).

- **Action:**
    1. Click **Simulate Attack** (Get Blocked).
    2. Click **Test Request**.
- **Expectation:**
    - Toast Notification: "⏳ Blocked! Reset in 45s" (Dynamic number).
    - Top-Right Badge: "⏱️ Resets: 45s" (Counts down in real-time).
- **Technical Check:** Inspect Network Tab -> Response Headers -> `X-RateLimit-Reset` should match the UI.
