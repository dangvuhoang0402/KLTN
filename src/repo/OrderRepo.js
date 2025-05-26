const Order = require('../models/Order');
const mongoose = require('mongoose');

const createOrder = async (orderData) => {
    const newOrder = await Order.create(orderData);
    return newOrder;
}

const getAllOrders = async () => {
    const allOrders = await Order.find().populate('items.FoodId');
    return allOrders;
}

const getDeliveringOrders = async () => {
    const deliveringOrders = await Order.find({ status: 2 }).populate('items.FoodId');
    return deliveringOrders;
}

const getOrderById = async (id) => {
    const order = await Order.findById(id).populate('items.FoodId');
    return order;
}

const updateOrder = async (id, updatedData) => {
    const order = await Order.findByIdAndUpdate(id, updatedData, { new: true })
        .populate('items.FoodId');
    if (!order) {
        return null;
    }
    return order;
}

const deleteOrder = async (id) => {
    const order = await Order.findByIdAndDelete(id).populate('items.FoodId');
    if (!order) {
        return null;
    }
    return order;
}

const getOrderByUID = async (UID) => {
    return await Order.findOne({ UID }).populate('items.FoodId');
};

const updateOrderByUID = async (UID, updateData) => {
    return await Order.findOneAndUpdate(
        { UID },
        updateData,
        { new: true }
    ).populate('items.FoodId');
};

const getLatestOrder = async () => {
    const order = await Order.findOne().sort({ createdAt: -1 });
    return order?.UID; // Changed from uid to UID
};

module.exports = {
    createOrder,
    getAllOrders,
    getDeliveringOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    getOrderByUID,
    updateOrderByUID,
    getLatestOrder
}
