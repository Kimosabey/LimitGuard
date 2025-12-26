# 🎙️ Senior Engineer Interview Questions
*Defend your design choices like a Staff Engineer.*

Here are the top questions you will face when presenting **LimitGuard**, along with the "Senior-Grade" answers this POC proves.

---

### 1. 🧠 Concurrency & Atomicity
**Q: "How did you prevent race conditions? If two requests hit at the exact same millisecond, how do you ensure only one counts?"**

**A:**
- *"Simple `GET` then `INCR` in Node.js is insufficient because it introduces a 'check-then-act' race condition."*
- *"I used the **Token Bucket Algorithm** implemented directly in **Redis Lua Scripting**."*
- *"Redis is single-threaded, so the Lua script executes atomically. No other commands can run while my script is evaluating, guaranteeing mathematical correctness even at high concurrency."*

---

### 2. 🛡️ System Resilience (Fail-Open)
**Q: "What happens if your Redis cluster crashes? Does your API go down with it?"**

**A:**
- *"Absolutely not. I implemented a **Fail-Open Strategy**."*
- *"In my middleware, I wrap the Redis call in a try/catch block. If Redis times out or throws an error, I catch it, log a high-priority warning, and **allow the traffic to bypass the limiter**."*
- *"Rationale: Availability > Strictness. It is better to let a few spammers through during an outage than to block 100% of legitimate revenue-generating traffic."*

---

### 3. ⏳ Precision Feedback
**Q: "How do you handle the 'Thundering Herd' problem where users retry immediately after being blocked?"**

**A:**
- *"I provide **Precise Feedback** to the client to encourage 'polite' retries."*
- *"Instead of a generic 429, I return `X-RateLimit-Reset` (the exact TTL of their bucket)."*
- *"This encourages clients (and my dashboard) to wait exactly `N` seconds before retrying, rather than hammering the API in a tight loop."*

---

### 4. 🚀 Scalability
**Q: "Why Redis? Why not just use an in-memory Map in Node.js?"**

**A:**
- *"In-memory storage works for a single server but fails in a **Distributed System**."*
- *"If I scale this API to 10 Docker containers behind a Load Balancer, a local Map would enforce 10x the limit (limit 10 per instance = 100 total)."*
- *"Redis provides a centralized, shared state that all instances synchronize against, ensuring the global limit is respected regardless of how many API nodes are running."*

---

### 5. 🔒 Security
**Q: "How did you secure the communication?"**

**A:**
- *"I enforced **End-to-End HTTPS** using self-signed certificates locally."*
- *"I also configured **CORS** explicitly to expose only the necessary rate-limit headers (`X-RateLimit-Reset`) to the frontend, stripping out sensitive server info."*
- *"The dashboard communicates via TLS 1.2+, mirroring a production environment where SSL termination usually happens at the Load Balancer level."*

---

### 6. 🧪 Testing Strategy
**Q: "How do you *know* it works?"**

**A:**
- *"I didn't just 'click and hope'."*
- *"I purposely **stopped the Redis container** to verify the Fail-Open logic."*
- *"I verified the **Atomic Counters** by simulating an attack (50 requests/sec) and ensuring exactly 10 requests passed."*
- *"The dashboard visualizes this in real-time to prove the theoretical model matches reality."*
