const User = require("../models/User");
const Profile = require("../models/Profile");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config();
// const cookie = require("cookie-parser");

// send Otp
exports.sendOTP = async (req,res) => {
    try{
        // fetch email id of user
        const {email}=req.body;

        // check user is already exits or not
        const checkUserPresent = await User.findOne({email});

        // if already exits return 
        if(checkUserPresent){
            return res.status(401).json({
                success: false,
                message:'User already registered',
            });
        }

        // generate Otp

        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // check unique otp or not
        let result = await OTP.findOne({otp: otp});
        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email,otp};
        // create an entry for otp
        const otpBody = await OTP.create(otpPayload);

        // return respone successful
        res.status(200).json({
            success:true,
            message: 'Otp Sent successfully',
            otp,
        })
    }
    catch(error){
        console.log("errror while sending otp: ",error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//SignUp                                                            
exports.signUp = async (req,res) => {
    try{
        // data fetch 
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp
        } = req.body;

        // validate data
        if(!firstName || !lastName || !email || !password || !confirmPassword
             || !otp){
                return res.status(403).json({
                    success: false,
                    message: "All field are required",
                })
        }

        // password matched or not
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Password and ConfirmPassword value does not match, Please try again",
            });
        }
        // user already exit or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: 'User is already registered',
            });
        }

        // find most recent otp stored for user
        const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);

        // validate otp
        if(recentOtp.length === 0){
            // otp not found
            return res.status(400).json({
                success: false,
                message: 'OTP not found',
            })
        }
        else if(otp !== recentOtp[0].otp){
            // Invalid otp
            return res.status(400).json({
                success: false,
                message:'Invalid OTP',
            })
        }
        
        // hashed password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create the User
        let approved = "";
        approved === "Instructor" ? (approved = false) : (approved = true);

        // create DB entry
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType: accountType,
            approved: approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })
        // return respone successful wala
        res.status(200).json({
            success: true,
            message: 'User is registered successfully',
            user,
        });

    }
    catch(error){
        console.log("error while signUp",error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again",
        })
    }
}


// Login
exports.login = async (req,res) => {
    try {
        // fetch data
        const {email,password} = req.body;

        // validate data
        if(!email || !password){
            return res.status(403).json({
                success: false,
                message: 'All fields are required, Please try again'
            })
        }
        // check user exist or not
        const user =await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message: 'User is not Registered, Please SignUp first',
            });
        }

        // generate JWT ,after password matching
        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn: "20h",
            })
            user.token = token;
            user.password = undefined;

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true,
            }
            res.cookie("token", token ,options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully'
            })

        }
        else{
            return res.status(401).json({
                success:false,
                message: 'Password is incorrect',
            });
        }
    }
    catch(error) {
        console.log("error in loggin: ",error);
        return res.status(500).json({
            success: false,
            message: 'Login failure, Please try again',
        });
    }
}


// ChangePassword
exports.changePassword = async (req,res) => {
    try{
        // fetch data
        const userDetails = await User.findById(req.user.id);
        
        // get oldpassword, newpassword ,confirmNewpassword
        const {oldPassword, newPassword, confirmNewPassword} = req.body;

        // validation 
        const isPasswordMatched = await bcrypt.compare(oldPassword, userDetails.password);
        if(!isPasswordMatched){
            return res.status(401).json({
                success: false,
                message: 'The password is incorrect',
            });
        }
        if(newPassword !== confirmNewPassword){
            return res.status(401).json({
                success: false,
                message: 'New password and confirm password does not match',
            });
        }
        
        // update the password in DB
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(req.user.id,
                                        {
                                            password: hashedPassword,
                                        },
                                        {new: true},
        );

        // send mail -Password updated

        try {
            const emailResponse = await mailSender(updatedUserDetails.email, passwordUpdated(updatedUserDetails.email, `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`));
        }
        catch(error) {
            return res.status(500).json({
                success: false,
                message: 'Error occured while sending Email',
                error: error.message,
            });
        }

        // return response
        return res.status(200).json({
            success: true,
            message: 'password updated successfully',
        });
    }
    catch(error){
        console.log("error in updating password: ",error);
        return res.status(500).json({
            success: false,
            message: 'Password cannot be updated, Please try again',
            error: error.message,
        });
    }
}
