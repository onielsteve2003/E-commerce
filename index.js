const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const connectDB = require('./config/db')

// Initialize
dotenv.config()
connectDB` `
const app = express()
app.use("/api/payment/webhook", express.raw({ type: "*/*" }));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))

// Routes
const userRoute = require('./routes/User')
const productRoute = require('./routes/admin/Product')
const cartRoute = require('./routes/Cart')
const orderRoute = require('./routes/Order')
const paymentRoute = require('./routes/Payment')

app.use('/api/user', userRoute)
app.use('/api/products', productRoute)
app.use('/api/cart', cartRoute)
app.use('/api/order', orderRoute)
app.use('/api/payment', paymentRoute)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})