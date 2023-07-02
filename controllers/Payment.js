const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const { getCustomer } = require('../middleware/operations')
const User = require('../models/User')
const { postorder } = require('./Order')

const createTokens = async (data) => {
    try {
      const { number, exp_month, exp_year, cvc } = data
      
      const cardNumber = number.replace(/\s/g, "")
      // Create a token with the user's card information
      const token = await stripe.tokens.create({ card: {
        number: cardNumber,
        exp_month,
        exp_year,
        cvc
      } })
      return token;
    }
    catch (error) {
      throw(error)
    }
  }

const createCustomer = async(data) => {
    try {
        const customer = await stripe.customers.create(data)
        return customer
    } catch (error) {
        console.log(error)
        throw(error)
    }
}

exports.chargeCardForOrder = async(req, res) => {
    try {
        const user = await User.findById(req.user.userId).exec()
        const { card } = req.body

        const token = await createTokens(card)

        const customer = await createCustomer({
            email: req.body.email,
            name: req.body.cardHolderName,
            source: token.id,
            metadata: {
                userId: req.user.userId,
                cart: JSON.stringify(req.body.items),
                address: user?.address,
                deliveryPrice: 5,
                orderInfo: req.body.orderInfo
            }
        })

        stripe.charges.create({
            amount: req.body.amount * 100,
            currency: 'usd',
            customer: customer.id,
            receipt_email: req.body.email
        }, (err, charge) => {
            if(err){
                res.status(500).json({
                    code: 500,
                    message: 'An error occurred',
                    error: err
                })
            } else {
                res.json({
                    code: 200,
                    message: 'Successful',
                    data: charge
                })
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            code: 500,
            message: "Something went wrong",
            error: String(error)
        })
    }
}

exports.chargeCard = async (data) => {
    try {
      const { card } = data 
  
      const token = await createTokens(card)
  
      const retrievedCustomer = await getCustomer(data.email);
  
      const customer = retrievedCustomer ? retrievedCustomer : await createCustomer({
        email: data.email,
        name: data.cardHolderName,
        source: token.id,
        metadata: { 
          accountId: data.accountId,
          userId: data.userId
        }
      })
  
      console.log(customer)
      
      const hasActiveCard = customer?.default_source;
  
      const charge = await stripe.charges.create({
        amount: data.amount * 100,
        currency: 'usd',
        customer: hasActiveCard ? customer.id : undefined,
        receipt_email: data.email,
        source: !hasActiveCard ? token.id : undefined
      })
  
      return charge;
    }
    catch (error) {
      throw(error)
    }
  }

exports.retrieve = (req, res) => {
    stripe.customers.retrieve(req.body.customer).then(
        async(customer) => {
            console.log(customer)
            res.json(customer)
        }
    ).catch(error => {
        console.log(error.message)
    })
}

exports.webhook = (req, res) => {
    // This is your Stripe CLI webhook secret for testing your endpoint locally.
    const endpointSecret = process.env.WEBHOOK_SECRET;

    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log("Webhook verified")
    } catch (err) {
        console.log("webhook error", err.message)
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event   
      switch (event.type) {
        case 'charge.succeeded':
            const data = event.data.object;
            stripe.customers.retrieve(data.customer).then(
                async (customer) => {
                    await fulfillOrder(customer, data);
                }
            ).catch(error => {
                console.log(error.message)
            })
          // Then define and call a function to handle the event payment_intent.succeeded
          break;
        // ... handle other event types
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

  // Return a 200 response to acknowledge receipt of the event
  res.send().end();
}

const fulfillOrder = async (customer, data) => {
    try  {
        const items = JSON.parse(customer.metadata.cart)

        const order = {
            accountId: customer.metadata.accountId,
            userId: customer.metadata.userId,
            orderItems: items.map(item => {
                return {
                    product: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    users: item.users
                }
            }),
            address: customer.metadata.address,
            taxPrice: ((data.amount / 100) * 12 ) / 100,
            deliveryPrice: customer.metadata.deliveryPrice,
            totalPrice: data.amount / 100,
            paymentStatus: data.status,
            orderInfo: customer.metadata.orderInfo,
            deliveryMethod: "Door delivery"
        }

        const postOrder = await postorder(order);

        // for(let i = 0; i < items.length; i++) {
        //   let quantity = Number(items[i].quantity);
        //   await Meal.findByIdAndUpdate(items[i].id, 
        //     { $inc: { totalOrders: quantity, countInStock: -quantity}}
        //   )  
        // }

        return postOrder;
    }   
    catch(error){
        throw(error)
    }
}