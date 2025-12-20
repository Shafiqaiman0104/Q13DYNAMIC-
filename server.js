// server.js - Updated with proper data parsing
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

// Helper function to convert Google Sheets array data to objects
function convertSheetDataToObjects(sheetData) {
    if (!Array.isArray(sheetData) || sheetData.length === 0) {
        return [];
    }
    
    const headers = sheetData[0].map(h => h.trim()); // Trim header names
    const rows = sheetData.slice(1);
    
    return rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index] || '';
        });
        return obj;
    });
}

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

// Proxy endpoint for getting all orders - FIXED
app.get('/api/orders', async (req, res) => {
    try {
        const response = await fetch(ORDER_DATABASE_URL);
        const result = await response.json();
        
        // Check if data is already in object format
        if (result.success && Array.isArray(result.data)) {
            if (result.data.length > 0 && typeof result.data[0] === 'object') {
                // Already array of objects
                res.json({
                    success: true,
                    data: result.data,
                    total: result.data.length,
                    timestamp: new Date().toISOString()
                });
            } else {
                // Array of arrays - need to convert
                const parsedData = convertSheetDataToObjects(result.data);
                res.json({
                    success: true,
                    data: parsedData,
                    total: parsedData.length,
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            res.json({ success: false, message: result.message || 'Invalid data format' });
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Proxy endpoint for getting agent data - FIXED
app.get('/api/agents', async (req, res) => {
    try {
        const response = await fetch(AGENT_DATABASE_URL);
        const result = await response.json();
        
        // Check if data is already in object format
        if (result.success && Array.isArray(result.data)) {
            if (result.data.length > 0 && typeof result.data[0] === 'object') {
                // Already array of objects
                res.json({
                    success: true,
                    data: result.data,
                    total: result.data.length,
                    timestamp: new Date().toISOString()
                });
            } else {
                // Array of arrays - need to convert
                const parsedData = convertSheetDataToObjects(result.data);
                res.json({
                    success: true,
                    data: parsedData,
                    total: parsedData.length,
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            res.json({ success: false, message: result.message || 'Invalid data format' });
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
