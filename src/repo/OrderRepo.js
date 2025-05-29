const Order = require('../models/Order');
const mongoose = require('mongoose');

const createOrder = async (orderData) => {
    try {
        console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
        const order = new Order({
            ...orderData,
            UID: orderData.UID // Ensure UID is explicitly set
        });
        const savedOrder = await order.save();
        console.log('Order created successfully:', savedOrder.UID);
        return savedOrder;
    } catch (error) {
        console.error('Order creation error in repo:', error);
        throw error;
    }
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

const getLatestOrder = async () => {
    return await Order.findOne()
        .sort({ UID: -1 })
        .select('UID')
        .lean();
};

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
