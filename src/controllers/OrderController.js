const OrderService = require('../services/OrderService');
const getAllOrders = async (req, res, next) => {
    const orders = await OrderService.getAllOrders();
    req.responseData = {
        status: 200,
        message: 'Successfully! Get all orders',
        data: orders
    };
    next();
}
const createOrder = async (req, res, next) => {
    const order = await OrderService.createOrder(req);
    req.responseData = {
        status: 201,
        message: 'Successfully! Create order',
        data: order
    };
    next();
}
const getDeliveringOrder = async (req, res, next) => {
    const order = await OrderService.getDeliveringOrder(req);
    req.responseData = {
        status: 200,
        message: 'Successfully! Get delivering order',
        data: order
    };
    next();
}
const getOrderById = async (req, res, next) => {
    const order = await OrderService.getOrderById(req.params.id);
    req.responseData = {
        status: 200,
        message: 'Successfully! Get order by id',
        data: order
    };
    next();
}
const updateOrder = async (req, res, next) => {
    const order = await OrderService.updateOrder(req.params.id, req.body);
    req.responseData = {
        status: 200,
        message: 'Successfully! Update order',
        data: order
    };
    next();
}
const deleteOrder = async (req, res, next) => {
    const order = await OrderService.deleteOrder(req.params.id);
    req.responseData = {
        status: 200,
        message: 'Successfully! Delete order',
        data: order
    };
    next();
}
module.exports = {
    getAllOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    getDeliveringOrder
}