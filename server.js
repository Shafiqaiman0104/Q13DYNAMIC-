// server.js - Proxy server that matches original HTML API calls
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Your environment variables
const PRODUCT_DATABASE_URL = process.env.PRODUCT_DATABASE_URL;
const ORDER_DATABASE_URL = process.env.ORDER_DATABASE_URL;
const AGENT_DATABASE_URL = process.env.AGENT_DATABASE_URL;

// ========== PRODUCTS ENDPOINTS ==========
// GET all products (matches original fetchProductsData() call)
app.get('/api/products', async (req, res) => {
    try {
        // Call Google Apps Script exactly like original code
        const response = await fetch(PRODUCT_DATABASE_URL);
        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// POST product operations (add, update, delete)
app.post('/api/products', async (req, res) => {
    try {
        console.log('Product operation:', req.body.action);
        
        // Forward to Google Apps Script exactly like original
        const response = await fetch(PRODUCT_DATABASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        
        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Error with product operation:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// GET product by code (if needed)
app.get('/api/products/:productCode', async (req, res) => {
    try {
        const { productCode } = req.params;
        // Search through products data
        const response = await fetch(PRODUCT_DATABASE_URL);
        const result = await response.json();
        
        if (result.success && result.data) {
            const product = result.data.find(p => p.Code === productCode);
            if (product) {
                res.json({ success: true, product });
            } else {
                res.json({ success: false, message: 'Product not found' });
            }
        } else {
            res.json({ success: false, message: 'Failed to fetch products' });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ========== ORDERS ENDPOINTS ==========
// GET all orders (matches original fetchOrdersData() call)
app.get('/api/orders', async (req, res) => {
    try {
        // Call Google Apps Script exactly like original code
        const response = await fetch(ORDER_DATABASE_URL);
        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// GET order by ID (matches original editOrder() call)
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Call Google Apps Script with ?orderId= parameter
        const response = await fetch(`${ORDER_DATABASE_URL}?orderId=${encodeURIComponent(orderId)}`);
        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// POST order operations (update, delete)
app.post('/api/orders', async (req, res) => {
    try {
        console.log('Order operation:', req.body.action);
        
        // Forward to Google Apps Script exactly like original
        const response = await fetch(ORDER_DATABASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        
        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Error with order operation:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ========== AGENTS ENDPOINTS ==========
// GET all agents (matches original fetchAgentsData() call)
app.get('/api/agents', async (req, res) => {
    try {
        // Call Google Apps Script exactly like original code
        const response = await fetch(AGENT_DATABASE_URL);
        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// POST agent operations (add, update, delete)
app.post('/api/agents', async (req, res) => {
    try {
        console.log('Agent operation:', req.body.action);
        
        // Forward to Google Apps Script exactly like original
        const response = await fetch(AGENT_DATABASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        
        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Error with agent operation:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// GET agent by ID (for edit)
app.get('/api/agents/:agentId', async (req, res) => {
    try {
        const { agentId } = req.params;
        
        // Get all agents and find the specific one
        const response = await fetch(AGENT_DATABASE_URL);
        const result = await response.json();
        
        if (result.success && result.data) {
            // Find agent by Agent ID (handle both with and without space)
            const agent = result.data.find(a => 
                a['Agent ID'] === agentId || 
                a['Agent ID '] === agentId
            );
            
            if (agent) {
                res.json({ success: true, agent });
            } else {
                res.json({ success: false, message: 'Agent not found' });
            }
        } else {
            res.json({ success: false, message: 'Failed to fetch agents' });
        }
    } catch (error) {
        console.error('Error fetching agent:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Serve static files
app.use(express.static('.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Your Google Apps Script URLs are now hidden!');
    console.log('Frontend will call:');
    console.log('  GET /api/orders      -> Fetches all orders');
    console.log('  GET /api/orders/:id  -> Fetches specific order');
    console.log('  POST /api/orders     -> Updates/deletes order');
    console.log('  GET /api/agents      -> Fetches all agents');
    console.log('  POST /api/agents     -> Adds/updates/deletes agent');
    console.log('  GET /api/products    -> Fetches all products');
    console.log('  POST /api/products   -> Adds/updates/deletes product');
});
