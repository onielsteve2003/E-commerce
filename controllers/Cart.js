const Cart = require('../models/Cart')

const addItemToCart = async(userId, productId, quantity = 1, users) => {
    // Find the cart of the user
    let cart = await Cart.findOne({ userId })

    // If the user doesn't have a cart yet, create a new one
    if(!cart){
        cart = new Cart({ userId, items: [] })
    }

    // Check if the product already exists in the cart
    const existingItem = cart.items.find((item) =>
        item.productId.equals(productId)
    )

    // If it does, increase the quantity of the existing item
    if(existingItem){
        existingItem.quantity += quantity
    } else {
        // If it doesn't, add a new item to cart
        cart.items.push({ productId, quantity, users })
    }
    await cart.save()
}

const removeItemFromCart = async(userId, productId) => {
    // Find the cart of the user
    const cart = await Cart.findOne({ userId })

    // If the user doesn't have a cart yet, just return
    if(!cart) {
        return
    }

    // Find the index of the item to be removed
    const index = cart.items.findIndex((item) =>
        item.productId.equals(productId)
    )

    // If the item is found, remove it from the cart
    if(index !== -1){
        cart.items.splice(index, 1)
        await cart.save()
    }
}

const getCart = async(userId) => {
    // Find the cart for the user and populate the product details for each item
    const cart = await Cart.findOne({ userId }).populate('items.productId')

    // Return the populated cart or null if the uder does not a cart yet
    return cart ? cart.toObject() : null
}

module.exports = {
    addItemToCart,
    removeItemFromCart,
    getCart
}