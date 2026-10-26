const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Import Middleware bảo vệ
const verifyToken = require('../middlewares/authMiddleware'); 

// Các tuyến đường công khai (Ai cũng vào được)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Tuyến đường BẢO MẬT (Chỉ ai có Token mới vào được)
router.get('/profile', verifyToken, (req, res) => {
    res.status(200).json({ 
        message: 'Chào mừng bạn đến với khu vực VIP!', 
        user_info: req.user // Hiển thị thông tin được giải mã từ token
    });
});

module.exports = router;