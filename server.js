// server.js - Simple backend proxy to hide Google Apps Script URLs
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Your environment variables (will be set in Coolify)
const PRODUCT_DATABASE_URL = process.env.PRODUCT_DATABASE_URL;
const ORDER_DATABASE_URL = process.env.ORDER_DATABASE_URL;
const AGENT_DATABASE_URL = process.env.AGENT_DATABASE_URL;

// Proxy endpoint for product data
app.get('/api/products', async (req, res) => {
    try {
        const response = await fetch(`${PRODUCT_DATABASE_URL}?format=jsonp&callback=tempCallback&t=${Date.now()}`);
        const text = await response.text();
        
        // Extract JSON from JSONP response
        const jsonpMatch = text.match(/tempCallback\((.*)\)/);
        if (jsonpMatch) {
            const jsonData = JSON.parse(jsonpMatch[1]);
            res.json(jsonData);
        } else {
            res.json({ success: false, message: "Invalid JSONP response" });
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Proxy endpoint for submitting orders
app.post('/api/orders', async (req, res) => {
    try {
        const response = await fetch(ORDER_DATABASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.text();
        res.send(data);
    } catch (error) {
        console.error('Error submitting order:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Proxy endpoint for agents
app.post('/api/agents', async (req, res) => {
    try {
        const response = await fetch(AGENT_DATABASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.text();
        res.send(data);
    } catch (error) {
        console.error('Error with agents:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Proxy endpoint for getting order by ID (for tracking)
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const response = await fetch(`${ORDER_DATABASE_URL}?orderId=${encodeURIComponent(orderId)}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Serve static files (your frontend)
app.use(express.static('.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('API URLs loaded from environment variables');
});
