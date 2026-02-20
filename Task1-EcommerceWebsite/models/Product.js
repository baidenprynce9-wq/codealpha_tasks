const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide product description']
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        min: [0, 'Price must be positive']
    },
    image: {
        type: String,
        required: [true, 'Please provide product image URL']
    },
    category: {
        type: String,
        required: [true, 'Please provide product category']
    },
    stock: {
        type: Number,
        required: [true, 'Please provide product stock'],
        default: 10
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
