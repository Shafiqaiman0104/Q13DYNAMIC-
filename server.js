// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // You might need to install this

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Your Google Apps Script URLs - Loaded from environment variables
const PRODUCT_DATABASE_URL = process.env.PRODUCT_DATABASE_URL;
const ORDER_DATABASE_URL = process.env.ORDER_DATABASE_URL;
const AGENT_DATABASE_URL = process.env.AGENT_DATABASE_URL;

// Proxy endpoint for product data
app.get('/api/products', async (req, res) => {
  try {
    // Add timestamp to prevent caching issues
    const url = `${PRODUCT_DATABASE_URL}?format=jsonp&t=${Date.now()}`;
    
    // Fetch from Google Apps Script
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Product proxy error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch product data' 
    });
  }
});

// Proxy endpoint for order submissions (POST)
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // You can add validation or transformation here
    
    const response = await fetch(ORDER_DATABASE_URL, {
      method: 'POST',
      body: JSON.stringify(orderData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Since we can't read response with no-cors, assume success
    res.json({ success: true });
    
  } catch (error) {
    console.error('Order submission error:', error);
    res.status(500).json({ success: false, message: 'Order submission failed' });
  }
});

// Add similar endpoints for agent submissions and order tracking
app.get('/api/track-order/:orderId', async (req, res) => {
  // Implement tracking proxy
});

app.post('/api/agents', async (req, res) => {
  // Implement agent submission proxy
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
