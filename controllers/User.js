const { checkPasswordStrength, sendMailOTP } = require('../middleware/operations')
const User = require('../models/User')
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

exports.signUp = async(req, res) => {
    const { name, email, phoneNumber, password, confirmPassword } = req.body
    if(!name || !email || !phoneNumber || !password || !confirmPassword){
        res.status(403).json({
            code: 403,
            message: 'Failure',
            error: 'Enter all fields'
        })
    } else {
        const userExists = await User.findOne({ email })

        if(userExists) {
            return res.status(401).json({
                code: 401,
                message: 'User already exists'
            })
        }
        
        const check = checkPasswordStrength(password)
        
        if(!check.proceed) {
            return res.status(403).json({
                code: 403,
                message: check.message
            })
        }

        if(password !== confirmPassword){
            return res.status(401).json({
                code: 401,
                message: 'Failure',
                error: 'Passwords does not match'
            })
        }

        // If all went well, create user
        User.create({
            name,
            email,
            phoneNumber,
            password,
        })
        .then(user => {
            res.json({
                code: 200,
                message: 'Successful',
                data: {
                    userId: user._id,
                    name,
                    email,
                    phoneNumber,
                    role: user.role
                }
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

exports.validateOTP = async(req, res) => {
    try {
        if(req.query.email && User(req.query.code).length === 6) {
            client
            .verify.v2
            .services(process.env.SERVICE_ID)
            .verificationChecks
            .create({to: req.query.email, code: req.query.email})
            .then(data => {
                // console.log(data)
                if(data.status === 'approved') {
                    User.findByIdAndUpdate({ email: req.query.email })
                    .then(user => {
                        res.status(200).json({
                            code: 200,
                            message: 'OTP Verification successful',
                            data: {
                                userId: user._id
                            }
                        })
                    })
                    .catch(error => {
                        console.log(error)
                        res.status(500).json({
                            code: 500,
                            message: 'something went wrong'
                        })
                    })
                } else {
                    res.status(401).json({
                        code: 401,
                        message: 'OTP not valid'
                    })
                }
            })
            .catch(err => {
                res.status(500).json({
                    code: 500,
                    error: err,
                    message: 'something went wrong'
                })
            })
        } else {
            res.status(400).send({
                code: 400,
                message: 'Invalid email or code',
                data: {
                    email: req.query.email
                }
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ 
            code: 500, 
            message: 'Something went wrong',
            error
        })
    }
}

exports.resendOTP = async(req, res) => {
    try {
        const {email} = req.body
        
        const OTP = await sendMailOTP(email)
        
        res.json({
            code: 200,
            message: 'OTP resent successfully',
            data: OTP
        })
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'An error occured',
            error
        })
    }
}

exports.Login = async(req, res) => {
    const {email, password} = req.body
    
    const user = await User.findOne({ email })
    
    // Check if user exists
    if(!user) return res.status(403).send({code: 403, message: 'Authentication failed, User not found'})
    
    user.comparePassword(password, (err, isMatch) => {
        if(isMatch && !err) {
            const token = jwt.sign({
                userId: user._id,
                email: user.email
            }, process.env.SECRET_KEY)

            res.status(200).json({
                code: 200,
                message: 'Successful',
                data: { token:token, userId: user._id, role: user.role }
            })
        }
        else {
            res.status(403).send({ code: 403, message: 'Authentication failed, wrong password' })
        }
    })
}

exports.forgotPassword = async(req, res) => {
    const { userId, newPassword, confirmNewPassword } = req.body
    if(!userId || !newPassword || !confirmNewPassword) {
        return res.status(403).json({
            code: 403,
            message: 'Enter all fields'
        })
    }
    if(newPassword !== confirmNewPassword) {
        return res.status(403).json({
            code: 403,
            message: 'Password does not match'
        })
    }
    const check = checkPasswordStrength(newPassword)
    if(!check.proceed) {
        return res.status(403).json({
            code: 403,
            message: check.message
        })
    }
    bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newPassword, salt, (err, hash) => {
            User.findByIdAndUpdate(userId, { $set: { password: hash } }).exec()
            .then(data => res.json({ code: 200, message: "Successful, you can login with your new password now", data }))
            .catch(error => res.status(500).json({ code: 500, message: "An error occured", error }))
        });
    });
}

// Get all users
exports.getCustomers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" }).select("-password");
        
        res.status(200).json(users);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    
}


// UPDATE USER

// Change Password
exports.changePassword = async(req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body

    const user = await User.findById(req.user.userId).exec()
    user.comparePassword(currentPassword, (err, isMatch) => {
        if(isMatch && !err) {
            if(newPassword!== confirmNewPassword) {
                return res.status(403).json({
                    code: 403, 
                    message: 'Password does not match'
                })
            }
            if(currentPassword == newPassword) {
                return res.json({
                    code: 403, 
                    message: 'You cannot use your old password'
                })
            }
            const check = checkPasswordStrength(newPassword)
            if(!check.proceed){
                return res.status(403).json({
                    code: 403, 
                    message: check.message
                })
            }
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newPassword, salt, (err, hash) => {
                    User.findByIdAndUpdate(req.user.userId, { $set: {password: hash} }).exec()
                    .then(data => res.json({
                        code: 200,
                        message: 'You have successfully changed your password'
                    }))
                    .catch(error => res.status(500).json({
                        code: 500,
                        message: 'An error occured',
                        error
                    }))
                })
            })
        } else {
            res.status(403).send({
                code: 403, 
                message: 'Authentication failed, wrong password'
            })
        }
    })
}

exports.updateUser = async (req, res) => {
    const user = await User.findById(req.user.userId);

    if (user) {
        // console.log(req.body);
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.role = req.body.role || user.role;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            userId: updatedUser.userId,
            name: updatedUser.name,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber, 
            role: updatedUser.role 
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
}

exports.getAllUserWishlist = async(req, res) => {
    const { userId } = req.user
    try {
        const user = await User.findById((userId))
        const users_wishlist = user.wishlist
        return res.status(200).json({
            success: true,
            users_wishlist
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


exports.logout = (req, res) => {
    res.clearCookie("accessToken",{
      secure:true,
      sameSite:"none"
    }).status(200).json("User has been logged out.")
};

exports.deleteUserAccount = async (req, res)=>{
    try{
        const user = await User.findById(req.user.userId).exec()
        if(!user) return res.status(400).json({
            code : 500,
            message : "User account does not exist"
        })

        await User.findByIdAndDelete(user._id).exec();
        res.status(200).json({
            code : 200,
            message : "User Account has been deleted"
        })
    }
    catch (error){
        console.log(error)
        res.status(500).json({ code: 500, message: "Something went wrong", error })
    }
}