-- KEYS[1]: The rate limit key (e.g., "ratelimit:ip:127.0.0.1")
-- ARGV[1]: Window size in seconds (e.g., 60)
-- ARGV[2]: Max requests allowed (e.g., 10)

local current = redis.call("INCR", KEYS[1])

-- If this is the first request (counter is 1), set the expiry
if tonumber(current) == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
end

-- Check against limit
if tonumber(current) > tonumber(ARGV[2]) then
    return 0 -- Denied
else
    return 1 -- Allowed
end
