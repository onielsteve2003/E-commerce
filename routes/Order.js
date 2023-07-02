const router = require('express').Router()
const { postorder, editOrder, getUserOrders, deleteUserOrder } = require('../controllers/Order')
const { isAuthenticated } = require('../middleware/operations')

router.post('/', isAuthenticated, postorder)
router.put('/:id', isAuthenticated, editOrder)
router.get('/', isAuthenticated, getUserOrders)
router.delete('/:id', isAuthenticated, deleteUserOrder)

module.exports = router