const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");
// const cookies = require("cookie-parser");


//authentication means it verify the token which we had saved in controller (in cookie , and body(user));
exports.auth =async (req,res,next) => {
    try{
        // extract token
        const token = req.body.token || req.cookies.token 
            || req.header("Authorization").replace("Bearer ", "");

        // if token missing
        if(!token){
            return res.status(401).josn({
                success: false,
                message :'Token is missing',
            })
        }

        // verify token
        try{
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            req.user = decode;
        }
        catch(err) {
            // verification me issue
            return res.status(401).josn({
                success: false,
                message: 'Token is invalid',
            });
        }
        next();
    }
    catch(error) {
        return res.status(401).json({
            success: false,
            message: 'something went wrong while validating the token',
        });
    }
}

// isStudent
exports.isStudent = async (req,res,next) => {
    try {
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success: false,
                message: 'This is protected route for student only',
            });
        }
        next();
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, Please try again',
        });
    }
}

// isInstructor
exports.isInstructor = async (req,res,next) => {
    try {
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success: false,
                message: 'This is protected route for Instructor only',
            });
        }
        next();
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, Please try again',
        });
    }
}

// isAdmin
exports.isAdmin = async (req,res,next) => {
    try {
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success: false,
                message: 'This is protected route for Admin only',
            });
        }
        next();
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, Please try again',
        });
    }
}
