const Order = require('../models/Order')

exports.postorder = async (data) => {
    try {
        const order = await Order.create(data); 
        return order;
    }
    catch (error) {
        console.log(error)
        return error;
    }
}

exports.editOrder = async(req, res) => {
    Order.findOneAndUpdate({ _id: req.params.id }, { $set: req.body })
    .then(order => {
        res.status(200).json({
            code: 200,
            message: 'Order Updated successfully',
            data: order
        })
    })
    .catch(err => res.status(500).json({
        code: 500,
        message: 'Something went wrong',
        error: err
    }))
}

// exports.isPaid = async(req, res) => {
//     const order = await Order.findById(req.params.id).populate(
//         'user',
//         'user email'
//     )
//     if(order) {
//         order.isPaid = true
//         order.paidAt = Date.now()
//         order.paymentResult = {
//             id: req.body.id,
//             status: req.body.status,
//             update_time: req.body.update_time,
//             email_address: req.body.email_address
//         }
//         const updatedOrder = await order.save()
//         res.json(updatedOrder)
//     } else {
//         res.status(404).json({
//             code: 404,
//             message: 'failure',
//             error: 'Order not found'
//         })
//     }
// }

exports.getUserOrders = async(req, res) => {
    const order = await Order.find({userId: req.user.userId}).sort({_id:-1})

    if(order){
        res.status(201).json({
            code: 201,
            message: 'success',
            data: order
        })
    } else {
        res.status(500).json({
            code: 500,
            message: 'Something went wrong'
        })
    }
}

exports.deleteUserOrder = async(req, res) => {
    const order = await Order.findByIdAndDelete(req.params.id).exec()
    if(order){
        res.status(201).json({
            code: 201,
            message: 'Order deleted successfully'
        })
    } else {
        res.status(404).json({
            code: 404,
            message: 'Failure',
            error: 'Order not found'
        })
    }
}