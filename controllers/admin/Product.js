const Product = require('../../models/admin/Product')
const User = require('../../models/User')

exports.addProduct = async(req, res) => {
    const { name, image, description, rating, numReviews, price, countInStock } = req.body
    if(!name || !image || !description || !rating || !numReviews || !price || !countInStock){
        res.status(403).json({
            code: 403, 
            message: 'Failure',
            error: 'Enter all fields'
        })
    } else {
        const productExists = await Product.findById(req.params.id)

        if(productExists){
            return res.status(401).json({
                code: 401,
                message: 'Failure',
                error: 'Product exists'
            })
        }

        Product.create({
            name,
            image,
            description,
            rating,
            numReviews,
            price,
            countInStock
        })
        .then(product => {
            res.json({
                code: 200,
                message: 'successful',
                data: product
            })
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({
                code: 500,
                message: 'An error occured',
                error
            })
        })
    }
}

exports.productReview = async(req, res) => {
    const { userId } = req.user
    const { name, rating, comment } = req.body
    const product = await Product.findById(req.params.id)

    if(product) {
        const alreadyReviewed = product.reviews.find(
            (r) => r.user === req.user._id)
        if(alreadyReviewed){
            res.status(401).json({
                code: 401,
                message: 'failure',
                error: 'Product already reviewed'
            })
        }
        const review = {
            name,
            rating: Number(rating),
            comment,
            userId
        }
        product.reviews.push(review)
        product.numReviews = product.reviews.length
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
        res.status(201).json({
            code: 201,
            message: 'success',
            data: product
        })
        await product.save()
    } else {
        res.status(404).json({
            code: 404,
            message: 'failure',
            error: 'product not found'
        })
    }

}

exports.addToWishlist = async(req, res) => {
    const { userId } = req.user
    const { productId } = req.body
    try {
        const user = await User.findById((userId))
        const alreadyAdded = user.wishlist.find((id) => id.toString() === productId)

        if(alreadyAdded){
            let user = await User.findByIdAndUpdate(userId, {
                $pull: {wishlist: productId}
            }, {
                new: true
            })
            res.json(user)
        } else {
            let user = await User.findByIdAndUpdate(userId, {
                $push: {wishlist: productId}
            }, {
                new: true
            })
            res.json(user)
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            code: 500,
            message: 'Server error'
        })
    } 
}

exports.updateProductReview = async (req, res) => {
    const { rating, comment  } = req.body;
  
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Missing infomation",
      });
    }
  
    try {
      const product = await Product.findById(req.params.id);
  
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Product is not found",
        });
      }
  
      const reviews = product.reviews;
      
      const foundReviewIndex = product.reviews.findIndex(
        (i) => i.user.toString() === req.user._id.toString()
      );
  
      if (foundReviewIndex === -1) {
        return res.status(400).json({
          success: false,
          message: "Review not found",
        });
      }
  
      reviews[foundReviewIndex].rating = rating ? Number(rating) : 0,
      reviews[foundReviewIndex].comment = comment,
  
      product.rating =
        reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
  
      await product.save();
  
      return res.status(200).json({
        success: true,
        message: "Updated review successfully",
        product,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
};

exports.getSingleProduct = async(req, res) => {
    const product = await Product.findById(req.params.id)
    if(product){
        res.status(201).json({
            code: 201,
            message: 'Successful',
            data: product
        })
    } else {
        res.status(404).json({
            code: 404,
            message: 'Failure',
            error: 'Product not found'
        })
    }
}

exports.getAllProducts = async(req, res) => {
    try {
        const product = await Product.find({})
        res.status(201).json({
            code: 201,
            message: 'successful',
            data: product
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            code: 500,
            message: 'server error'
        })
    }
}

exports.getAllProductsReview = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        const reviews = product.reviews
        return res.status(200).json({
            success: true,
            reviews
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            code: 500,
            message: 'failure',
            error: 'Internal server error'
        })
    }
}

exports.updateProduct = async(req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id)
        if(product){
            await Product.updateOne({ $set: req.body })
            res.status(200).json({
                code: 200,
                message: 'Updated successfully'
            })
        } else {
            res.status(403).json({
                code: 403,
                message: 'Product does not exist'
            })
        }
    } catch (error) {
        console.log(error)
        res.json({
            code: 500,
            message: 'An error occured',
            error
        })
    }
}

// exports.updateProductReview = async(req, res) => {
//     try {
//         const product = await Product.findById(req.params.id)
//         const reviews = product.reviews
//         return res.status(200).json({
//             success: true,
//             reviews
//         })
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({
//             code: 500,
//             message: 'failure',
//             error: 'Internal server error'
//         })
//     }
// }

exports.deleteProduct = async(req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id).exec()
    if(product){
        res.status(201).json({
            code: 201,
            message: 'Product deleted successfully'
        })
    } else {
        res.status(404).json({
            code: 404,
            message: 'Failure',
            error: 'Product not found'
        })
    }
}