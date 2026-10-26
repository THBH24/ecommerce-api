const prisma = require('../prisma');

// [1] Tạo đơn hàng mới (Protected - Cần Token)
exports.createOrder = async (req, res) => {
    try {
        const uid = req.user.uid; // Lấy ID user từ token đã giải mã ở middleware
        const { items } = req.body; // items là mảng chứa danh sách sản phẩm mua: [{ pid: 1, qty: 2 }]

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Danh sách sản phẩm đặt hàng không hợp lệ!' });
        }

        // Sử dụng Prisma Transaction để đảm bảo tính toàn vẹn dữ liệu (nếu lỗi 1 bước thì hủy toàn bộ)
        const result = await prisma.$transaction(async (prisma) => {
            // Bước 1: Tạo Order mới liên kết với User
            const newOrder = await prisma.order.create({
                data: { uid }
            });

            let orderDetailsData = [];

            // Bước 2: Kiểm tra kho và chuẩn bị dữ liệu OrderDetail
            for (const item of items) {
                const product = await prisma.product.findUnique({
                    where: {
                        pid: item.pid // 👈 Đảm bảo khớp với key "productId" trong JSON bạn gửi lên
                    }
                });

                if (!product) {
                    throw new Error(`Không tìm thấy sản phẩm có ID: ${item.pid}`);
                }

                if (product.quantity < item.qty) {
                    throw new Error(`Sản phẩm "${product.pname}" không đủ số lượng trong kho!`);
                }

                // Trừ số lượng tồn kho của sản phẩm
                await prisma.product.update({
                    where: { pid: product.pid },
                    data: { quantity: product.quantity - item.qty }
                });

                // Đưa vào danh sách chi tiết đơn hàng
                orderDetailsData.push({
                    oid: newOrder.oid,
                    pid: item.pid,
                    qty: item.qty,
                    unit_price: product.price
                });
            }

            // Bước 3: Lưu chi tiết đơn hàng vào OrderDetail
            await prisma.orderDetail.createMany({
                data: orderDetailsData
            });

            // Bước 4: Tạo trạng thái giao hàng mặc định trong bảng Shipment
            await prisma.shipment.create({
                data: {
                    oid: newOrder.oid,
                    status: 'Đang xử lý'
                }
            });
            // 👇 Bước 5 (Bổ sung): Truy vấn lấy lại toàn bộ đơn hàng kèm OrderDetails và Shipments để trả về ngay
            const fullOrder = await prisma.order.findUnique({
                where: { oid: newOrder.oid },
                include: {
                    shipments: true
                }
            });

            return fullOrder;
        });

        res.status(201).json({
            message: 'Đặt hàng thành công và đã khởi tạo vận chuyển!',
            data: result
        });
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi đặt hàng', error: error.message });
    }
};

// [2] Xem lịch sử đơn hàng của tôi (Protected - Cần Token)
exports.getMyOrders = async (req, res) => {
    try {
        const uid = req.user.uid;

        // Lấy danh sách đơn hàng kèm theo chi tiết sản phẩm và trạng thái vận chuyển
        const orders = await prisma.order.findMany({
            where: { uid },
            include: {
                orderDetails: {
                    include: {
                        product: true
                    }
                },
                shipments: true
            }
        });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy lịch sử đơn hàng', error: error.message });
    }
};