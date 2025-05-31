const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ✅ Serve files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
    console.log('✅ New WebSocket connection');
    ws.on('message', (message) => {
        console.log('📨 Received:', message);
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
