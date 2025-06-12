const express = require('express');
const router = express.Router();
const viewController = require('../controllers/ViewController');

// Foods Management
router.get('/foods', viewController.renderFoods);
router.get('/foods/new', viewController.renderFoodForm);
router.get('/foods/:id/edit', viewController.renderFoodForm);
router.get('/foods/edit-success', (req, res) => {
    res.render('pages/food_edit_success');
});

// Orders Management
router.get('/orders', viewController.renderOrders);
router.get('/orders/:UID', viewController.renderOrderDetail);

// Order Review
router.get('/order-review', viewController.renderOrderReview);

// Monthly Report
router.get('/report', viewController.renderReport);

module.exports = router;