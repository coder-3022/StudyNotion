const {contactUsEmail} = require("../mail/templates/contactFormRes")
const mailSender = require("../utils/mailSender")

exports.contactUsController = async (req,res) => {
    const { email, firstname, lastname, message, PhoneNo, contrycode } = req.body

    try {
        await mailSender(email,"Your Message send successfully",contactUsEmail(email,firstname,lastname,message,PhoneNo,contrycode))
        await mailSender("nitmn231@gmail.com" , "Someone Send this Message to you", contactUsEmail(email,firstname,lastname,message,PhoneNo,contrycode))

        return res.json({
            success :true,
            message : "Email send successfully",
        })
    }
    catch(error) {
        return res.json({
            success: false,
            message: "Something went wrong....",
        })
    }
}
