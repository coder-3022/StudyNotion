const mongoose =require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate")

const otpSchema =new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createAt: {
        type: Date,
        default: Date.now(),
        expires: 60*5,
    },
});


// function to send email
async function sendVerificationEmail(email,otp) {
    try{
        const mailResponse = await mailSender(email,"Verification Email from StudyNotion",emailTemplate(otp));
    }
    catch(error){
        console.log("error occured while sending mail",error);
        throw error;
    }
}

//here pre-save means otp is sended before the saving of OTPSchema.
otpSchema.pre("save", async function(next){
    // Only send an email when a new document is created
    if(this.isNew){
        await sendVerificationEmail(this.email,this.otp);
    }
    next();
})

module.exports=mongoose.model("OTP",otpSchema);