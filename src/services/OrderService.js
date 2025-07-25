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
    const order = await OrderRepo.getDeliveringOrders();
    return order;
}

const generateNextUID = async () => {
    try {
        // Get the latest order
        const latestOrder = await OrderRepo.getLatestOrder();
        
        // If no orders exist, start from 000
        if (!latestOrder || !latestOrder.UID === undefined) {
            // Check if 000 exists
            const existingOrder = await OrderRepo.getOrderByUID('000');
            if (existingOrder) {
                // Find the first available number
                for (let i = 0; i <= 999; i++) {
                    const UID = i.toString().padStart(3, '0');
                    const exists = await OrderRepo.getOrderByUID(UID);
                    if (!exists) {
                        return UID;
                    }
                }
                throw new CustomError('No available UIDs', 500);
            }
            return '000';
        }

        // Get current number and increment
        const currentNum = parseInt(latestOrder.UID);
        if (currentNum >= 999) {
            throw new CustomError('Maximum order limit reached', 500);
        }

        // Generate next UID
        const nextUID = (currentNum + 1).toString().padStart(3, '0');
        
        // Verify it doesn't exist
        const existingOrder = await OrderRepo.getOrderByUID(nextUID);
        if (existingOrder) {
            // Find the first available number after currentNum
            for (let i = currentNum + 2; i <= 999; i++) {
                const UID = i.toString().padStart(3, '0');
                const exists = await OrderRepo.getOrderByUID(UID);
                if (!exists) {
                    return UID;
                }
            }
            throw new CustomError('No available UIDs', 500);
        }

        return nextUID;
    } catch (error) {
        console.error('Generate UID error:', error);
        throw new CustomError(`Failed to generate UID: ${error.message}`, 500);
    }
};

const createOrder = async (req) => {
    try {
        const orderData = req.body;
        const UID = await generateNextUID();
        console.log('Generated UID:', UID); // Debug log

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

        // Store original order data with PayPal info and UID
        const enrichedOrderData = {
            UID: UID, // Make sure UID is properly set
            items: orderData.items,
            Status: 1,
            QR_URL: qrCodeUrl,
            paypal_invoice_id: paypalResponse.invoiceId,
            Total_Price: totalPriceVND
        };

        console.log('Creating order with data:', enrichedOrderData); // Debug log
        const order = await OrderRepo.createOrder(enrichedOrderData);
        return order;

    } catch (error) {
        console.error('Order creation error:', {
            message: error.message,
            stack: error.stack,
            data: error.data || 'No additional data'
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

const checkOrderStatus = async (UID) => {
    try {
        // Get order from database
        const order = await OrderRepo.getOrderByUID(UID);
        if (!order) {
            throw new CustomError('Order not found', 404);
        }

        // Check status with PayPal
        const paypalStatus = await PaypalService.checkInvoiceStatus(order.paypal_invoice_id);

        // Map PayPal status to our order status
        let newStatus = order.Status;
        switch(paypalStatus.paypalStatus.toLowerCase()) {
            case 'paid':
                newStatus = 2; // Delivering
                break;
            case 'cancelled':
                newStatus = 4; // Cancelled
                break;
            // Add more status mappings as needed
        }

        // If newStatus is 2 (delivered) and order.Status is not 2, update food quantities
        if (newStatus === 2 && order.Status !== 2) {
            await Promise.all(order.items.map(async (item) => {
                const food = await FoodRepo.getFoodById(item.FoodId);
                if (!food) {
                    throw new CustomError(`Food with id ${item.FoodId} not found`, 404);
                }
                const newQuantity = food.Quantity - item.Quantity;
                if (newQuantity < 0) {
                    throw new CustomError(`Insufficient quantity for food: ${food.Name}`, 400);
                }
                await FoodRepo.updateFood(item.FoodId, { Quantity: newQuantity });
            }));
        }

        // Update order status if changed
        if (newStatus !== order.Status) {
            await OrderRepo.updateOrder(order._id, { Status: newStatus });
        }

        return {
            orderId: order._id,
            status: newStatus,
            paypalStatus: paypalStatus.paypalStatus,
            paidAmount: paypalStatus.paidAmount,
            items: order.items,
            totalPrice: order.Total_Price
        };

    } catch (error) {
        console.error('Check order status error:', error);
        if (error instanceof CustomError) {
            throw error;
        }
        throw new CustomError(`Failed to check order status: ${error.message}`, 500);
    }
};

const updateOrderStatus = async (UID, newStatus) => {
    try {
        console.log(`[UpdateStatus] Starting status update for order UID: ${UID} to status: ${newStatus}`);

        // Validate status value
        if (![1, 2, 3, 4].includes(Number(newStatus))) {
            console.log(`[UpdateStatus] Invalid status value: ${newStatus}`);
            throw new CustomError('Invalid status value. Must be 1, 2, 3 or 4', 400);
        }

        // Find order by UID
        const order = await OrderRepo.getOrderByUID(UID);
        if (!order) {
            console.log(`[UpdateStatus] Order not found: ${UID}`);
            throw new CustomError('Order not found', 404);
        }
        console.log(`[UpdateStatus] Found order: ${order._id}, current status: ${order.Status}`);

        // If updating to delivered status (2), decrease food quantities
        if (Number(newStatus) === 2 && order.Status !== 2) {
            console.log(`[UpdateStatus] Processing delivery status update, updating food quantities`);
            
            await Promise.all(order.items.map(async (item) => {
                const food = await FoodRepo.getFoodById(item.FoodId);
                if (!food) {
                    console.log(`[UpdateStatus] Food not found: ${item.FoodId}`);
                    throw new CustomError(`Food with id ${item.FoodId} not found`, 404);
                }

                const newQuantity = food.Quantity - item.Quantity;
                console.log(`[UpdateStatus] Calculating new quantity for ${food.Name}: ${food.Quantity} - ${item.Quantity} = ${newQuantity}`);
                
                if (newQuantity < 0) {
                    console.log(`[UpdateStatus] Insufficient quantity for ${food.Name}`);
                    throw new CustomError(`Insufficient quantity for food: ${food.Name}`, 400);
                }

                await FoodRepo.updateFood(item.FoodId, { Quantity: newQuantity });
                console.log(`[UpdateStatus] Updated quantity for ${food.Name} to ${newQuantity}`);
            }));
            
            console.log(`[UpdateStatus] Completed food quantity updates`);
        }

        // If updating to cancelled status (4), cancel PayPal invoice
        if (Number(newStatus) === 4 && order.Status !== 4 && order.paypal_invoice_id) {
            try {
                await PaypalService.cancelInvoice(order.paypal_invoice_id);
                console.log(`[UpdateStatus] PayPal invoice cancelled: ${order.paypal_invoice_id}`);
            } catch (paypalErr) {
                console.error(`[UpdateStatus] Failed to cancel PayPal invoice:`, paypalErr);
                // Optionally, you can throw here or just log and continue
            }
        }

        // Update order status
        console.log(`[UpdateStatus] Updating order status to ${newStatus}`);
        const updatedOrder = await OrderRepo.updateOrderByUID(UID, { Status: Number(newStatus) });
        console.log(`[UpdateStatus] Status update complete for order: ${updatedOrder._id}`);

        return updatedOrder;

    } catch (error) {
        console.error('[UpdateStatus] Error occurred:', {
            message: error.message,
            stack: error.stack
        });
        if (error instanceof CustomError) {
            throw error;
        }
        throw new CustomError(`Failed to update order status: ${error.message}`, 500);
    }
};

const getMonthlyReport = async (month, year) => {
    // Get all orders in the given month/year
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const orders = await OrderRepo.getOrdersBetweenDates(start, end);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.Total_Price, 0);

    // Calculate best seller
    const foodSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!foodSales[item.FoodId]) {
                foodSales[item.FoodId] = 0;
            }
            foodSales[item.FoodId] += item.Quantity;
        });
    });

    let bestSellerId = null;
    let bestSellerQuantity = 0;
    for (const [foodId, qty] of Object.entries(foodSales)) {
        if (qty > bestSellerQuantity) {
            bestSellerId = foodId;
            bestSellerQuantity = qty;
        }
    }

    let bestSeller = { Name: 'Không có', Quantity: 0 };
    if (bestSellerId) {
        const food = await FoodRepo.getFoodById(bestSellerId);
        if (food) {
            bestSeller = { Name: food.Name, Quantity: bestSellerQuantity };
        }
    }

    return { totalOrders, totalRevenue, bestSeller };
};

// Add to module.exports
module.exports = {
    getAllOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    getDeliveringOrder,
    checkOrderStatus,
    updateOrderStatus,
    getMonthlyReport
}