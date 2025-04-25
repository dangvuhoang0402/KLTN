const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const FoodSchema = new mongoose.Schema(
    {
        Name: {
        type: String,
        required: true,
        },
        Price: {
        type: Number,
        required: true,
        },
        Image_url: {
        type: String,
        required: true,
        },
        Quantity: {
        type: Number,
        required: true,
        },
    },
    { timestamps: true }
    );
FoodSchema.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
    deletedBy: true, 
    deletedByType: mongoose.Schema.Types.ObjectId,
});
const Food = mongoose.model('Food', FoodSchema);
module.exports = Food;