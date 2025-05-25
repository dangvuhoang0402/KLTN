const FoodRepo= require('../repo/FoodRepo');
const CustomError = require('../error/CustomError');

const getAllFood = async () => {
    const food = await FoodRepo.getAllFood();
    return food;
}
const createFood = async (foodData) => {
    // Validate required fields
    if (!foodData.Name || !foodData.Price || !foodData.Quantity) {
        throw new CustomError('Missing required fields', 400);
    }

    // Create food with image from Cloudinary
    const newFood = {
        Name: foodData.Name,
        Price: foodData.Price,
        Image_url: foodData.image, // This comes from Cloudinary upload
        Quantity: foodData.Quantity,
        Type: foodData.Type
    };

    const food = await FoodRepo.createFood(newFood);
    return food;
}
const getFoodById = async (id) => {
    const food = await FoodRepo.getFoodById(id);
    if (!food) {
        throw new CustomError('Food not found', 404);
    }
    return food;
}
const updateFood = async (id, foodData) => {
    // Validate food exists
    const existingFood = await FoodRepo.getFoodById(id);
    if (!existingFood) {
        throw new CustomError('Food not found', 404);
    }

    // Create update object with image if provided
    const updateData = {
        Name: foodData.Name || existingFood.Name,
        Price: foodData.Price || existingFood.Price,
        Quantity: foodData.Quantity || existingFood.Quantity,
        Image_url: foodData.image || existingFood.Image, // Use new image if provided, otherwise keep existing
        Type: foodData.Type || existingFood.Type
    };

    const food = await FoodRepo.updateFood(id, updateData);
    return food;
}
const deleteFood = async (id) => {
    const food = await FoodRepo.deleteFood(id);
    if (!food) {
        throw new CustomError('Food not found', 404);
    }
    return food;
}
module.exports = {
    getAllFood,
    createFood,
    getFoodById,
    updateFood,
    deleteFood
}