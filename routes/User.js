const router = require('express').Router()
const { signUp, Login, validateOTP, resendOTP, changePassword, updateUser, getAllUserWishlist, getCustomers, forgotPassword, logout, deleteUserAccount } = require('../controllers/User')
const { isAuthenticated } = require('../middleware/operations')

router.post('/signup', signUp)
router.post('/login', Login)
router.post('/resend-otp', resendOTP)
router.get('/validate-otp', validateOTP)
router.post('/change-password', isAuthenticated, changePassword)
router.post('/forgot-password', forgotPassword)
router.put('/', isAuthenticated, updateUser)
router.get('/wishlist', isAuthenticated, getAllUserWishlist)
router.get('/customers', isAuthenticated, getCustomers)
router.post('/logout', logout)
router.delete('/delete/:id', isAuthenticated, deleteUserAccount)

module.exports = router