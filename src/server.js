require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); // Allow all origins for "Hacker Dashboard"
app.use(express.json());

// 1. Validating Redis Connection (Optional health check)
app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'LimitGuard' });
});

// 2. Public Endpoint (No Limit)
app.get('/', (req, res) => {
    res.send('Welcome to LimitGuard! Try /api/test to see rate limiting in action.');
});

// 3. Protected Endpoint (Rate Limited)
// Limit: 10 requests per 60 seconds
app.use('/api', rateLimiter('global', 60, 10));

app.get('/api/test', (req, res) => {
    res.json({
        message: 'Request Successful!',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/test', (req, res) => {
    res.json({
        message: 'POST Request Successful!',
        data: req.body
    });
});

const fs = require('fs');
const https = require('https');

// Load SSL Certificates (Optional)
let httpsOptions = null;
try {
    if (fs.existsSync('server.key') && fs.existsSync('server.cert')) {
        httpsOptions = {
            key: fs.readFileSync('server.key', 'utf8'),
            cert: fs.readFileSync('server.cert', 'utf8')
        };
        console.log('🔒 SSL Certificates loaded.');
    } else {
        console.log('⚠️  SSL Certificates not found. Falling back to HTTP.');
    }
} catch (e) {
    console.error("❌ Error reading SSL certs:", e.message);
}

let server;
let protocol = 'http';

if (httpsOptions) {
    server = https.createServer(httpsOptions, app);
    protocol = 'https';
} else {
    // Fallback to HTTP
    const http = require('http');
    server = http.createServer(app);
}

server.listen(PORT, '0.0.0.0', () => {
    // Get local IP for display
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    let localIp = 'localhost';

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                localIp = net.address;
            }
        }
    }

    console.log(`🚀 LimitGuard Server running on ${protocol}://localhost:${PORT}`);
    console.log(`📡 Accessible on Network via ${protocol}://${localIp}:${PORT}`);
    console.log(`🛡️  Global Rate Limit: 10 req / 60 sec`);
});
