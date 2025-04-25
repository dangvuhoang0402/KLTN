const OrderRepo = require('../repo/OrderRepo');
const CustomError = require('../error/CustomError');
const PaypalService = require('./PaypalService');
const FoodRepo = require('../repo/FoodRepo');

// Add conversion constant (you might want to move this to a config file)
const VND_TO_USD_RATE = 26000;

// Helper function to convert VND to USD
const convertVNDtoUSD = (vndAmount) => {
    return (vndAmount / VND_TO_USD_RATE).toFixed(2);
};

const getAllOrders = async () => {
    const orders = await OrderRepo.getAllOrders();
    return orders;
}

const getDeliveringOrder = async () => {
    const order = await OrderRepo.getDeliveringOrder();
    return order;
}

const createOrder = async (req) => {
    try {
        const orderData = req.body;

        // Validate order data
        if (!orderData.items || !Array.isArray(orderData.items)) {
            throw new CustomError('Invalid order format', 400);
        }

        // Fetch complete food details and calculate total price in VND
        let totalPriceVND = 0;
        const populatedItems = await Promise.all(orderData.items.map(async (item) => {
            const food = await FoodRepo.getFoodById(item.FoodId);
            if (!food) {
                throw new CustomError(`Food with id ${item.FoodId} not found`, 404);
            }

            // Calculate item total in VND
            totalPriceVND += food.Price * item.Quantity;

            // Return item for PayPal invoice
            return {
                name: food.Name || 'Unknown Item',
                quantity: parseInt(item.Quantity) || 1,
                unit_price: {
                    currency: "USD",
                    value: convertVNDtoUSD(food.Price || 0)
                }
            };
        }));

        // Create PayPal invoice with proper format
        const paypalResponse = await PaypalService.createInvoice({
            merchant_info: {
                business_name: "Tiệm cơm"
            },
            items: populatedItems
        });

        // Send invoice
        await PaypalService.sendInvoice(paypalResponse.invoiceId);

        // Generate QR code
        const qrCodeUrl = await PaypalService.generateQRCode(paypalResponse.invoiceId);

        // Store original order data with PayPal info
        const enrichedOrderData = {
            items: orderData.items,
            Status: 1, // Pending status
            QR_URL: qrCodeUrl,
            paypal_invoice_id: paypalResponse.invoiceId,
            Total_Price: totalPriceVND // Store total price in VND
        };

        const order = await OrderRepo.createOrder(enrichedOrderData);
        return order;

    } catch (error) {
        console.error('Order creation error:', {
            message: error.message,
            stack: error.stack,
            status: error.status
        });
        
        if (error instanceof CustomError) {
            throw error;
        }
        
        throw new CustomError(`Failed to create order with PayPal: ${error.message}`, 500);
    }
};

const getOrderById = async (id) => {
    const order = await OrderRepo.getOrderById(id);
    if (!order) {
        throw new CustomError('Order not found', 404);
    }
    return order;
}

const updateOrder = async (id, orderData) => {
    try {
        // Get the current order and populate food items
        const currentOrder = await OrderRepo.getOrderById(id);
        if (!currentOrder) {
            throw new CustomError('Order not found', 404);
        }

        // Check if status is being updated to delivered (3)
        if (orderData.Status === 3 && currentOrder.Status !== 3) {
            // Decrease food quantities for each item in the order
            await Promise.all(currentOrder.items.map(async (item) => {
                // Get food directly using FoodId from item
                const food = await FoodRepo.getFoodById(item.FoodId);
                if (!food) {
                    throw new CustomError(`Food with id ${item.FoodId} not found`, 404);
                }

                // Calculate new quantity
                const newQuantity = food.Quantity - item.Quantity;
                if (newQuantity < 0) {
                    throw new CustomError(`Insufficient quantity for food: ${food.Name}`, 400);
                }

                // Update food quantity
                await FoodRepo.updateFood(item.FoodId, { Quantity: newQuantity });
                console.log(`Updated quantity for food ${food.Name}: ${newQuantity}`);
            }));
        }

        // Update the order
        const updatedOrder = await OrderRepo.updateOrder(id, orderData);
        return updatedOrder;
    } catch (error) {
        console.error('Order update error:', {
            message: error.message,
            stack: error.stack,
            status: error.status
        });
        
        if (error instanceof CustomError) {
            throw error;
        }
        
        throw new CustomError(`Failed to update order: ${error.message}`, 500);
    }
}

const deleteOrder = async (id) => {
    const order = await OrderRepo.deleteOrder(id);
    if (!order) {
        throw new CustomError('Order not found', 404);
    }
    return order;
}

module.exports = {
    getAllOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    getDeliveringOrder
}