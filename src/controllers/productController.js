const prisma = require('../prisma');

// [1] Lấy danh sách toàn bộ sản phẩm (Public)
exports.getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách sản phẩm', error: error.message });
    }
};

// [2] Thêm sản phẩm mới (Protected - Cần Token)
exports.createProduct = async (req, res) => {
    try {
        const { pname, price, quantity } = req.body;

        // Kiểm tra dữ liệu đầu vào cơ bản
        if (!pname || price === undefined || quantity === undefined) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên, giá và số lượng sản phẩm!' });
        }

        const newProduct = await prisma.product.create({
            data: {
                pname,
                price: parseFloat(price),
                quantity: parseInt(quantity)
            }
        });

        res.status(201).json({
            message: 'Thêm sản phẩm thành công!',
            product: newProduct
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi thêm sản phẩm', error: error.message });
    }
};