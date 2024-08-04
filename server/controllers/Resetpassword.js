const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");


// resetPasswordToken(mail send krne ka kaam kr raha h)
exports.resetPasswordToken = async (req,res) => {
    try {
        // get email from req body
        const email = req.body.email;

        // check user for this email , email validation
        const user =await User.findOne({email: email})
        if(!user){
            return res.json({
                success: false,
                message: 'Your Email is not registered with us',
            });
        }

        // generate token with the help of crypto 
        const token = crypto.randomUUID();

        // isse v kr skte h
        // const token = crypto.randomBytes(20).toString("hex");

        // upadate user by adding token and expiration time
        const updateDetails = await User.findOneAndUpdate(
            {
                email: email
            },
            {
                token,
                resetPasswordExpires: Date.now()+ 5*60*1000,
            },
            {
                new:true
            }
        );
        // create url
        const url = `http://localhost:3000/update-password/${token}`

        // send mail containing the url
        await mailSender(email,"Password Reset Link",
                                `Your password reset link is : ${url}. Please click this url to reset your password.`);

        // return respone
        return res.json({
            success:true,
            message: 'Email sent successfully, Please check email and update password',
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'something went wrong while sending reset password mail',
        });
    }
}

// resetPassword
exports.resetPassword = async (req,res) => {
    try {
        // fetch data
        const {password, confirmPassword, token} = req.body;
        // validation
        if(password !== confirmPassword){
            return res.json({
                success: false,
                message: 'Password not matching',
            });
        }

        // get user details from db using token
        const userDetails = await User.findOne({token: token});

        // if no user entry ->invalid token
        if(!userDetails){
            return res.json({
                success: false,
                message: 'Token is invalid',
            });
        }

        // check token time
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success: false,
                message: 'Token is expired, Please regenerate your token',
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // update password
        await User.findOneAndUpdate(
            {
                token: token
            },
            {
                password: hashedPassword
            },
            {
                new: true
            },
        );

        // return respone
        return res.status(200).json({
            success: true,
            message: 'password reset successful',
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'something went wrong while sending reset password mail',
        });
    }
}


