const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderItems: [
        {
            quantity: {type: Number},
            price: {type: Number},
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PrimaryUser' }]
        }
    ],
    address: {
        type: String,
        required: true
    },
    taxPrice: {
        type: Number,
        default: 0.0,
    },
    deliveryPrice: {
        type: Number,
        default: 0.0,
    },
    totalPrice: {
        type: Number,
        default: 0.0,
    },
    paymentStatus: {
        type: String,
        default: "pending"
    },
    deliveryMethod: {
        type: String
    },
    status: {
        type: String,
        enum: ["pending", "delivered", "cancelled"],
        default: "pending"
    },
    deliveredAt: {
        type: Date
    },
    orderInfo: {
        type: String,
        default: ""
    }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema);