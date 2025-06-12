const FoodService = require('../services/FoodService');
const OrderService = require('../services/OrderService');
const OrderRepo = require('../repo/OrderRepo');
// Foods Management Page
const renderFoods = async (req, res, next) => {
    try {
        const foods = await FoodService.getAllFood();
        res.render('pages/foods', { foods });
    } catch (error) {
        next(error);
    }
};

// Food Form (Add/Edit)
const renderFoodForm = async (req, res, next) => {
    try {
        let food = null;
        if (req.params.id) {
            food = await FoodService.getFoodById(req.params.id);
        }
        res.render('pages/food_form', { food });
    } catch (error) {
        next(error);
    }
};

// Orders Management Page
const renderOrders = async (req, res, next) => {
    try {
        const orders = await OrderService.getAllOrders();
        res.render('pages/orders', { orders });
    } catch (error) {
        next(error);
    }
};

// Order Detail Page
const renderOrderDetail = async (req, res, next) => {
    try {
        const order = await OrderRepo.getOrderByUID(req.params.UID);
        res.render('pages/order_detail', { order });
    } catch (error) {
        next(error);
    }
};

// Order Review Page
const renderOrderReview = async (req, res, next) => {
    try {
        const orders = await OrderService.getAllOrders();
        res.render('pages/order_review', { orders });
    } catch (error) {
        next(error);
    }
};

// Monthly Report Page
const renderReport = async (req, res, next) => {
    try {
        const now = new Date();
        const month = Number(req.query.month) || now.getMonth() + 1;
        const year = Number(req.query.year) || now.getFullYear();

        const { totalOrders, totalRevenue, bestSeller } = await OrderService.getMonthlyReport(month, year);

        res.render('pages/report', {
            month,
            year,
            totalOrders,
            totalRevenue,
            bestSeller
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    renderFoods,
    renderFoodForm,
    renderOrders,
    renderOrderDetail,
    renderOrderReview,
    renderReport
};