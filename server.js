// server.js - Complete backend proxy with all CRUD operations
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

// Helper function to make POST requests
async function makeGoogleAppsScriptRequest(url, body) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        // Check if response is JSON or JSONP
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            return parseJsonpResponse(text) || { success: true, message: text };
        }
    } catch (error) {
        console.error('Error making request to Google Apps Script:', error);
        throw error;
    }
}

// ========== PRODUCTS ENDPOINTS ==========
// GET all products
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

// POST product operations (add, update, delete)
app.post('/api/products', async (req, res) => {
    try {
        console.log('Product operation requested:', req.body);
        const result = await makeGoogleAppsScriptRequest(PRODUCT_DATABASE_URL, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error with product operation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET product by code (if needed)
app.get('/api/products/:productCode', async (req, res) => {
    try {
        const { productCode } = req.params;
        const response = await fetch(`${PRODUCT_DATABASE_URL}?code=${encodeURIComponent(productCode)}`);
        const text = await response.text();
        
        const jsonData = parseJsonpResponse(text) || JSON.parse(text);
        res.json(jsonData);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== ORDERS ENDPOINTS ==========
// GET all orders
app.get('/api/orders', async (req, res) => {
    try {
        const response = await fetch(ORDER_DATABASE_URL);
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
            res.json(result);
        } else {
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

// POST order operations (update, delete)
app.post('/api/orders', async (req, res) => {
    try {
        console.log('Order operation requested:', req.body);
        const result = await makeGoogleAppsScriptRequest(ORDER_DATABASE_URL, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error with order operation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET order by ID
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const response = await fetch(`${ORDER_DATABASE_URL}?orderId=${encodeURIComponent(orderId)}`);
        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== AGENTS ENDPOINTS ==========
// GET all agents
app.get('/api/agents', async (req, res) => {
    try {
        const response = await fetch(AGENT_DATABASE_URL);
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
            res.json(result);
        } else {
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

// POST agent operations (add, update, delete)
app.post('/api/agents', async (req, res) => {
    try {
        console.log('Agent operation requested:', req.body);
        const result = await makeGoogleAppsScriptRequest(AGENT_DATABASE_URL, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error with agent operation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Serve static files (your frontend)
app.use(express.static('.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('API URLs loaded from environment variables');
    console.log(`Product API: ${PRODUCT_DATABASE_URL ? 'Loaded' : 'Not loaded'}`);
    console.log(`Order API: ${ORDER_DATABASE_URL ? 'Loaded' : 'Not loaded'}`);
    console.log(`Agent API: ${AGENT_DATABASE_URL ? 'Loaded' : 'Not loaded'}`);
});
