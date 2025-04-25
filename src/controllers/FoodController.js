const FoodService = require('../services/FoodService');

const getAllFood = async (req, res, next) => {
    try {
        const food = await FoodService.getAllFood();
        res.json({
            message: 'Successfully! Get all food',
            data: food
        });
    } catch (error) {
        next(error);
    }
}

const createFood = async (req, res, next) => {
    try {
        const foodData = {
            ...req.body,
            image: req.file ? req.file.path : null
        };
        
        const food = await FoodService.createFood(foodData);
        res.status(201).json({
            message: 'Successfully! Create food',
            data: food
        });
    } catch (error) {
        next(error);
    }
}

const getFoodById = async (req, res, next) => {
    try {
        const food = await FoodService.getFoodById(req.params.id);
        res.json({
            message: 'Successfully! Get food by id',
            data: food
        });
    } catch (error) {
        next(error);
    }
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
        res.json({
            message: 'Successfully! Update food',
            data: food
        });
    } catch (error) {
        next(error);
    }
}

const deleteFood = async (req, res, next) => {
    try {
        const food = await FoodService.deleteFood(req.params.id);
        res.json({
            message: 'Successfully! Delete food',
            data: food
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllFood,
    createFood,
    getFoodById,
    updateFood,
    deleteFood
}