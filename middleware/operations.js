const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)
const jwt = require('jsonwebtoken')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

exports.sendSMSOTP = async(phonenumber) => {
    if(phonenumber) {
        return client
               .verify.v2
               .services(process.env.SERVICE_ID)
               .verifications
               .create({
                    to: `+${phonenumber}`,
                    channel: 'sms'
               })
    }
}

exports.sendMailOTP = async(email) => {
    if(email) {
        return client
               .verify.v2
               .services(process.env.SERVICE_ID)
               .verifications
               .create({to: email, channel: 'email'})
    }
}

// AUTHENTICATE USER
exports.isAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401)

    // Verify Token
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if(err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

// Check password strength
exports.checkPasswordStrength = (password) => {
    let strength = 0
    let tips = ''

    // Check password length
    if(password.length < 8) {
        tips += 'Make password longer'
    } else {
        strength += 1
    }
    // Check mixed cases
    if(password.match(/[a-z]/) && password.match(/[A-Z]/)) {
        strength += 1
    } else {
        tips += 'useboth lowercase and uppercase letter.'
    }
    // Check for numbers
    if(password.match(/\d/)) {
        strength += 1
    } else {
        tips += 'Include at least one number'
    }
    // Check for special characters
    if(password.match(/[^a-zA-Z\d/]/)) {
        strength += 1
    } else {
        tips += 'Include at least one special character'
    }
    // Return results
    if(strength < 2) {
        return {
            proceed: false,
            message: "Password easy to guess. " + tips
        }
    } else if(strength === 2) {
        return {
            proceed: false,
            message: 'Password. ' + tips
        }
    } else if(strength === 3) {
        return {
            proceed: false,
            message: 'Password. ' + tips
        }
    } else {
        return {
            proceed: true,
            message: 'Extremely difficult. ' + tips
        }
    }
}

exports.getCustomer = async (email) => {
    try {
        const customers = await stripe.customers.list({
            email,
          });
          
          if (customers.data.length > 0) {
            const customer = customers.data[0];
            return customer;
          } else {
            console.log(`No customer found with email ${email}`);
            return null;
          }
    }
    catch (error) {
        throw(error)
    }
}