const router = require('express').Router()
const { 
    signUp, 
    Login, 
    validateOTP, 
    resendOTP, 
    changePassword, 
    updateUser, 
    getAllUserWishlist, 
    recentlyViewedProduct,
    clearRecentlyViewed,
    getCustomers, 
    forgotPassword, 
    logout, 
    deleteUserAccount 
} = require('../controllers/User')
const { isAuthenticated } = require('../middleware/operations')

router.post('/signup', signUp)
router.post('/login', Login)
router.post('/resend-otp', resendOTP)
router.get('/validate-otp', validateOTP)
router.post('/change-password', isAuthenticated, changePassword)
router.post('/forgot-password', forgotPassword)
router.put('/', isAuthenticated, updateUser)
router.get('/wishlist', isAuthenticated, getAllUserWishlist)
router.post('/recently-viewed/:productId', recentlyViewedProduct);
router.delete('/clear-recently-viewed', clearRecentlyViewed);
router.get('/customers', isAuthenticated, getCustomers)
router.post('/logout', isAuthenticated, logout)
router.delete('/delete/:id', isAuthenticated, deleteUserAccount)

module.exports = router