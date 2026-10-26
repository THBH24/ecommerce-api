require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

// Import các file Route
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes'); // Thêm dòng này

// Khai báo sử dụng API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); // Thêm dòng này

// API Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'UP', 
        message: 'E-commerce API is running flawlessly!',
        timestamp: new Date() 
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});