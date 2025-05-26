const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const OrderSchema = new mongoose.Schema(
    {
        items :[
            {
                FoodId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Food',
                    required: true,
                },
                Quantity: {
                    type: Number,
                    required: true,
                },
            },
        ],
        Status: {
            type: Number, //1=> Pending, 2=> Confirmed, Delivering 3=> Delivered, 4=> Cancelled
            enum: [1, 2, 3,4],
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        Total_Price: {
            type: Number,
            required: true,
        },
        QR_URL: {
            type: String,
            required: true,
        },
        paypal_invoice_id: {
            type: String,
            required: true,
        },
        UID: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 3
        },
    },
    { timestamps: true }
);
OrderSchema.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true, 
    deletedByType: mongoose.Schema.Types.ObjectId,
});
const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;