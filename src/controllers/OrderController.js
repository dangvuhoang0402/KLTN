const OrderService = require('../services/OrderService');

const getAllOrders = async (req, res, next) => {
    try {
        const orders = await OrderService.getAllOrders();
        res.json({
            message: 'Successfully! Get all orders',
            data: orders
        });
    } catch (error) {
        next(error);
    }
}

const createOrder = async (req, res, next) => {
    try {
        const order = await OrderService.createOrder(req);
        res.status(201).json({
            message: 'Successfully! Create order',
            data: order
        });
    } catch (error) {
        next(error);
    }
}

const getDeliveringOrder = async (req, res, next) => {
    try {
        const order = await OrderService.getDeliveringOrder(req);
        res.json({
            message: 'Successfully! Get delivering order',
            data: order
        });
    } catch (error) {
        next(error);
    }
}

const getOrderById = async (req, res, next) => {
    try {
        const order = await OrderService.getOrderById(req.params.id);
        res.json({
            message: 'Successfully! Get order by id',
            data: order
        });
    } catch (error) {
        next(error);
    }
}

const updateOrder = async (req, res, next) => {
    try {
        const order = await OrderService.updateOrder(req.params.id, req.body);
        res.json({
            message: 'Successfully! Update order',
            data: order
        });
    } catch (error) {
        next(error);
    }
}

const deleteOrder = async (req, res, next) => {
    try {
        const order = await OrderService.deleteOrder(req.params.id);
        res.json({
            message: 'Successfully! Delete order',
            data: order
        });
    } catch (error) {
        next(error);
    }
}

const checkOrderStatus = async (req, res, next) => {
    try {
        const { UID } = req.params;
        const statusResult = await OrderService.checkOrderStatus(UID);
        res.json({
            message: 'Successfully checked order status',
            data: statusResult
        });
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const { UID } = req.params;
        const { status } = req.body;

        if (!status) {
            throw new CustomError('Status is required', 400);
        }

        const updatedOrder = await OrderService.updateOrderStatus(UID, status);
        
        res.json({
            message: 'Successfully updated order status',
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    getDeliveringOrder,
    checkOrderStatus,
    updateOrderStatus
}