const FoodService = require('../services/FoodService');
const getAllFood = async (req, res, next) => {
    const food = await FoodService.getAllFood();
    req.responseData = {
        status: 200,
        message: 'Successfully! Get all food',
        data: food
    };
    next();
}
const createFood = async (req, res, next) => {
    try {
        const foodData = {
            ...req.body,
            image: req.file ? req.file.path : null // Get Cloudinary URL from uploaded file
        };
        
        const food = await FoodService.createFood(foodData);
        req.responseData = {
            status: 201,
            message: 'Successfully! Create food',
            data: food
        };
        next();
    } catch (error) {
        next(error);
    }
}
const getFoodById = async (req, res, next) => {
    const food = await FoodService.getFoodById(req.params.id);
    req.responseData = {
        status: 200,
        message: 'Successfully! Get food by id',
        data: food
    };
    next();
}

const updateFood = async (req, res, next) => {
    try {
        const updateData = {
            ...req.body
        };
        if (req.file) {
            updateData.image = req.file.path;
        }

        const food = await FoodService.updateFood(req.params.id, updateData);
        req.responseData = {
            status: 200,
            message: 'Successfully! Update food',
            data: food
        };
        next();
    } catch (error) {
        next(error);
    }
}

const deleteFood = async (req, res, next) => {
    const food = await FoodService.deleteFood(req.params.id);
    req.responseData = {
        status: 200,
        message: 'Successfully! Delete food',
        data: food
    };
    next();
}
module.exports = {
    getAllFood,
    createFood,
    getFoodById,
    updateFood,
    deleteFood
}