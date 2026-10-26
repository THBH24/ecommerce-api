const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Lấy token từ header của request
    const authHeader = req.header('Authorization');
    
    // 2. Nếu không có token -> Đuổi về
    if (!authHeader) {
        return res.status(401).json({ message: 'Từ chối truy cập! Yêu cầu phải có Token.' });
    }

    try {
        // 3. Tách lấy chuỗi token (vì chuẩn thường là "Bearer <token>")
        const token = authHeader.split(' ')[1] || authHeader;
        
        // 4. Giải mã và xác thực token bằng Khóa bí mật trong file .env
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 5. Cấp quyền đi tiếp và gắn thông tin user vào request
        req.user = verified;
        next(); // Lệnh cho phép đi qua cổng
    } catch (error) {
        res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

module.exports = verifyToken;