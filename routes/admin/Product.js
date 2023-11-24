const router = require('express').Router()
const { 
    deleteProduct,
    productReview, 
    getAllProducts, 
    addToWishlist, 
    getAllProductsReview, 
    getSingleProduct, 
    addProduct, 
    updateProduct, 
    updateProductReview 
} = require('../../controllers/admin/Product')
const { isAuthenticated } = require('../../middleware/operations')

router.post('/', isAuthenticated, addProduct)
router.post('/:id/review', isAuthenticated, productReview)
router.get('/', isAuthenticated, getAllProducts)
router.put('/wishlist', isAuthenticated, addToWishlist)
router.get('/:id/review', isAuthenticated, getAllProductsReview)
router.get('/:id', isAuthenticated, getSingleProduct)
router.put('/:id', isAuthenticated, updateProduct )
router.put('/:id/review', isAuthenticated, updateProductReview )
router.delete('/delete/:id', isAuthenticated, deleteProduct)

module.exports = router