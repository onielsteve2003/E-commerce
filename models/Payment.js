const mongoose = require('mongoose')

const paymentSchema = mongoose.Schema({
    cardNumber: {
        required: true,
        trim: true,
        type: String,
        unique: true
    },
    cardHolder: {
        required: true,
        trim: true,
        type: String
    },
    expiryDate: {
        type: String
    },
    cvv: {
        type: String
    },
    cardType: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true})

module.exports = mongoose.model('Billing', paymentSchema)