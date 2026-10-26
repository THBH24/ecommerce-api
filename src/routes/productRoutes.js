const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middlewares/authMiddleware');

// Route công khai: Xem danh sách sản phẩm
router.get('/', productController.getAllProducts);

// Route bảo mật: Thêm sản phẩm mới (phải có Token được cấu hình ở Bước 6)
router.post('/', verifyToken, productController.createProduct);

module.exports = router;