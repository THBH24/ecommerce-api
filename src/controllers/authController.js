const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

// [1] Tính năng ĐĂNG KÝ (Register)
exports.register = async (req, res) => {
    try {
        const { username, fullname, password } = req.body;

        // Xử lý thông minh: Tự động tạo Role và MemberShip mặc định nếu DB chưa có 
        // (để tránh lỗi khóa ngoại khi tạo User mới)
        // Cập nhật lại cho chuẩn tiêu chí STT 6 của phiếu chấm
        let defaultRole = await prisma.role.findFirst({ where: { rolename: 'normal' } });
        if (!defaultRole) defaultRole = await prisma.role.create({ data: { rolename: 'normal' } });

        let defaultMembership = await prisma.memberShip.findFirst({ where: { score: 10 } });
        if (!defaultMembership) defaultMembership = await prisma.memberShip.create({ data: { mname: 'Basic', score: 10 } });

        // Kiểm tra xem username đã tồn tại chưa
        const existingUser = await prisma.user.findFirst({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username đã được sử dụng!' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lưu user vào Database
        const newUser = await prisma.user.create({
            data: {
                username,
                fullname,
                password: hashedPassword,
                roleid: defaultRole.roleid,
                mid: defaultMembership.mid
            }
        });

        res.status(201).json({ message: 'Đăng ký thành công!', user: newUser.username });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [2] Tính năng ĐĂNG NHẬP (Login)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Tìm user trong Database
        const user = await prisma.user.findFirst({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Sai mật khẩu!' });
        }

        // Tạo JWT Token (Thẻ thông hành)
        const token = jwt.sign(
            { uid: user.uid, roleid: user.roleid }, // Dữ liệu mã hóa trong token
            process.env.JWT_SECRET,                 // Khóa bí mật lấy từ .env
            { expiresIn: '1h' }                     // Thời hạn 1 tiếng
        );

        res.status(200).json({ message: 'Đăng nhập thành công!', token });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};