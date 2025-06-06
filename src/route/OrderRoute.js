const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController')

router.get("/", orderController.getAllOrders)
router.post("/", orderController.createOrder)
router.get("/delivering", orderController.getDeliveringOrder)
router.get("/status/:UID", orderController.checkOrderStatus);
router.post("/status/:UID", orderController.updateOrderStatus);
router.route("/:id")
    .delete(orderController.deleteOrder)
    .put(orderController.updateOrder)
    .get(orderController.getOrderById)
module.exports = router