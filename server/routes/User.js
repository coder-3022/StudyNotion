const express = require("express");

const router = express.Router();

// middleware
const {auth} =require("../middlewares/auth");

// auth controller
const {
    login,
    signUp,
    sendOTP,
    changePassword,
} = require("../controllers/Auth");

// ResetPassword controller
const {
    resetPasswordToken,
    resetPassword,
} = require("../controllers/Resetpassword");



// *********************************Authentication *****************************************

// routes for login
router.post("/login",login);

// routes for signuo
router.post("/signup",signUp)

// routes for sending otp to user's email
router.post("/sendotp",sendOTP);

// routes for changing the password
router.post("/changePassword",changePassword)



// ************************************Reset Password Routes **********************************

// routes for genrating reset password token
router.post("/reset-password-token",resetPasswordToken);

// routes for reset the password
router.post("/reset-password",resetPassword);


module.exports = router ;




