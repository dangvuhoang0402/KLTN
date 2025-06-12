const express = require('express')
const router = express.Router();
const foodController = require('../controllers/FoodController')
const initCloudinary = require('../config/cloudinary.config')

const upload = initCloudinary();

router.get("/", foodController.getAllFood)
router.post("/", upload.single('image'), foodController.createFood)
router.route("/:id")
    .delete(foodController.deleteFood)
    .post(upload.single('image'), foodController.updateFood)
    .get(foodController.getFoodById)

router.post("/delete/:id", foodController.deleteFood)

module.exports = router