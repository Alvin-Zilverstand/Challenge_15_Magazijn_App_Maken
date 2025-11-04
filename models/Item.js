const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        en: {
            type: String,
            required: true
        },
        nl: {
            type: String,
            required: true
        }
    },
    description: {
        en: {
            type: String,
            default: ''
        },
        nl: {
            type: String,
            default: ''
        }
    },
    location: {
        type: String,
        enum: ['Heerlen', 'Maastricht', 'Sittard'],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    imageUrl: {
        type: String,
        default: '/images/default-item.png'
    },
    reserved: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);