const fs = require('fs');
const path = require('path');
const redis = require('../lib/redisClient');

// Load Lua Script at startup (Performance optimization)
const LUA_SCRIPT = fs.readFileSync(path.join(__dirname, '../scripts/rateLimit.lua'), 'utf8');

/**
 * Distributed Rate Limiter Middleware
 * @param {string} ruleName - Identifier for the limit (e.g., 'global', 'api')
 * @param {number} windowSeconds - Time window in seconds
 * @param {number} limit - Max requests per window
 */
const rateLimiter = (ruleName, windowSeconds, limit) => {
    return async (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const key = `ratelimit:${ruleName}:${ip}`;

        try {
            // EXECUTE ATOMIC LUA SCRIPT
            // eval(script, numKeys, key, arg1, arg2)
            const allowed = await redis.eval(LUA_SCRIPT, 1, key, windowSeconds, limit);

            if (allowed === 1) {
                // Add headers for visibility
                res.setHeader('X-RateLimit-Limit', limit);
                res.setHeader('X-RateLimit-Window', windowSeconds);
                next();
            } else {
                res.status(429).json({
                    error: 'Too Many Requests',
                    message: `Rate limit exceeded. Try again in ${windowSeconds} seconds.`
                });
            }
        } catch (error) {
            console.error('⚠️ [RateLimit] Redis Failed, checking Fail-Open strategy...');
            console.error(error.message);

            // FAIL-OPEN STRATEGY:
            // If Redis is down, we allow the request to proceed rather than blocking legitimate users.
            // In a strict financial app, this might be Fail-Closed, but for high availability, Fail-Open is preferred.
            res.setHeader('X-RateLimit-Status', 'Fail-Open');
            next();
        }
    };
};

module.exports = rateLimiter;
