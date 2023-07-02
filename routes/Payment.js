const router = require('express').Router()
const express = require('express');
const { chargeCardForOrder, retrieve, webhook } = require('../controllers/Payment')
const { isAuthenticated } = require('../middleware/operations')

router.post('/webhook', express.raw({type: 'application/json'}), webhook)
router.post('/charge', isAuthenticated, chargeCardForOrder)
router.post('/customer', isAuthenticated, retrieve)

module.exports = router