const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middlewares/authMiddleware');

// Tất cả các route đặt hàng đều phải thông qua Middleware bảo vệ (cần đăng nhập)
router.post('/', verifyToken, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getMyOrders);

module.exports = router;