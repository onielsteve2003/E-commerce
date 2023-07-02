const router = require('express').Router()
const { addItemToCart, getCart, removeItemFromCart } = require("../controllers/Cart")
const { isAuthenticated } = require("../middleware/operations")

// Add Item to cart
router.post('/items', isAuthenticated, async(req, res) => {
    const { productId, quantity, users } = req.body
    try {
        await addItemToCart(req.user.userId, productId, quantity, users)
        res.json({
            code: 200,
            message: 'Item added to cart',
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            code: 500,
            message: 'failure',
            error: 'Item has already been added to cart', 
        })
    }
})

// Remove item from cart
router.delete('/items/:productId', isAuthenticated, async(req, res) => {
    const { productId } = req.params
    try {
        await removeItemFromCart(req.user.userId, productId)
        res.json({
            code: 200,
            message: 'Item removed from cart'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            code: 500,
            message: 'failure',
            error: 'Item added to cart'
        })
    }
})

// Get User Cart
router.get('/', isAuthenticated, async(req, res) => {
    try {
        const cart = await getCart(req.user.userId)
        if(cart){
            res.json({
                code: 200,
                message: 'successful',
                data: cart
            })
        } else {
            res.json({
                code: 200,
                message: 'successful',
                data: []
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            code: 500,
            message: 'failure',
            error: 'Item added to cart'
        })
    }
})

module.exports = router