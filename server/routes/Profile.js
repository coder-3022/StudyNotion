const express = require("express");
const router = express.Router();

// middleware 
const {auth, isInstructor} = require("../middlewares/auth");

// profile controller
const {
    updateProfile,
    deleteAccount,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses,
    instructorDashboard

} = require("../controllers/Profile");


// ************************************Profile Routes************************************

// update profile
router.put("/updateProfile",auth, updateProfile);

// delete profile
router.delete("/deleteProfile",auth,deleteAccount)

// get UserDetails 
router.get("/getUserDetails",auth,getAllUserDetails);

// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)


module.exports = router;


