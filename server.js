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

// Helper function to parse JSONP response
function parseJsonpResponse(text) {
    try {
        const jsonpMatch = text.match(/tempCallback\((.*)\)/);
        if (jsonpMatch) {
            return JSON.parse(jsonpMatch[1]);
        }
        // Try to parse as regular JSON
        return JSON.parse(text);
    } catch (error) {
        console.error('Failed to parse response:', error);
        return null;
    }
}

// Proxy endpoint for product data
app.get('/api/products', async (req, res) => {
    try {
        const response = await fetch(`${PRODUCT_DATABASE_URL}?format=jsonp&callback=tempCallback&t=${Date.now()}`);
        const text = await response.text();
        
        const jsonData = parseJsonpResponse(text);
        if (jsonData) {
            res.json(jsonData);
        } else {
            res.json({ success: false, message: "Invalid response from products API" });
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Proxy endpoint for getting all orders
app.get('/api/orders', async (req, res) => {
    try {
        const response = await fetch(ORDER_DATABASE_URL);
        const result = await response.json();
        
        // Return EXACTLY what the original code expects
        // The original code expects: {success: true, data: Array(8)}
        // where data[0] = headers, data[1+] = rows
        if (result.success && Array.isArray(result.data)) {
            res.json(result);
        } else {
            // Try to wrap it in the expected format
            res.json({
                success: true,
                data: Array.isArray(result) ? result : [result]
            });
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Proxy endpoint for getting agent data
app.get('/api/agents', async (req, res) => {
    try {
        const response = await fetch(AGENT_DATABASE_URL);
        const result = await response.json();
        
        // Return EXACTLY what the original code expects
        // The original code expects: {success: true, data: Array(6)}
        // where data[0] = headers, data[1+] = rows
        if (result.success && Array.isArray(result.data)) {
            res.json(result);
        } else {
            // Try to wrap it in the expected format
            res.json({
                success: true,
                data: Array.isArray(result) ? result : [result]
            });
        }
    } catch (error) {
        console.error('Error fetching agents:', error);
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
