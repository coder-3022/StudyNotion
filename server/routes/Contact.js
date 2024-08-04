const express = require("express")
const router = express.Router()

// ContactUs controllers
const {
    contactUsController
} = require("../controllers/ContactUs")

router.post("/contact", contactUsController)

module.exports = router

