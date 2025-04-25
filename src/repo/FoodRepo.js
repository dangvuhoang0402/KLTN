const Food = require('../models/Food');
const mongoose = require('mongoose');

const createFood = async (foodData) => {
    const newFood = await Food.create(foodData);
    return newFood;
}

const getAllFood = async () => {
    const allFood = await Food.find({}).exec();
    return allFood;
}

const getFoodById = async (id) => {
    const food = await
    Food.findById(id).exec();
    if (!food) {
        return null;
    }
    return food;
}

const updateFood = async (id, updatedData) => {
    const food = await Food.findByIdAndUpdate(id, updatedData, { new: true });
    if (!food) {
        return null;
    }
    return food;
}

const deleteFood = async (id) => {
    const food = await Food.findByIdAndDelete(id);
    if (!food) {
        return null;
    }
    return food;
}
module.exports = {
    createFood,
    getAllFood,
    getFoodById,
    updateFood,
    deleteFood
}
