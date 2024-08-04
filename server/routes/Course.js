const express = require("express");
const router = express.Router();

// course controller
const {
    createCourse,
    getAllCourses,
    getCourseDetails,
    getFullCourseDetails,
    editCourse,
    getInstructorCourses,
    deleteCourse,
} = require("../controllers/Course");

// category controller
const {
    createCategory,
    showAllCategory,
    categoryPageDetails,
} = require("../controllers/Category");

// section controller
const {
    createSection,
    updateSection,
    deleteSection,
} = require("../controllers/Section");

// SubSection controllers
const {
    createSubSection,
    updateSubSection,
    deleteSubSection,
} = require("../controllers/Subsection");

// rating/review controllers
const {
    createRating,
    getAverageRating,
    getAllRatingReview,
} = require("../controllers/RatingAndReview");

// course progress ka v aayega
const {
    updateCourseProgress
} = require("../controllers/courseProgress")

// middleware
const {
    auth, 
    isStudent, 
    isInstructor, 
    isAdmin,
} = require("../middlewares/auth")


// **********************Course Routes*********************************

// course can only be created by the instructor

router.post("/createCourse",auth,isInstructor,createCourse);

// add a section to a course
router.post("/addSection",auth,isInstructor,createSection);

// update Section
router.post("/updateSection",auth,isInstructor,updateSection);

// Delete section
router.post("/deleteSection",auth,isInstructor,deleteSection);

// add a SubSection to section of a course
router.post("/addSubSection",auth,isInstructor,createSubSection);

// update subSection
router.post("/updateSubSection",auth,isInstructor,updateSubSection);

// delete SubSection
router.post("/deleteSubSection",auth,isInstructor,deleteSubSection);

// get all registered courses
router.get("/getAllCourse",getAllCourses);

// get details for a specific course
router.post("/getCourseDetails",getCourseDetails);

// get details for a specific course
router.post("/getFullCourseDetails",auth,getFullCourseDetails);


// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse)

// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)

// Delete a Course
router.delete("/deleteCourse", deleteCourse)

// update CourseProgress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);




// ***********************************Category Routes (only by Admin)*******************************************

// Category can only be created by Admin
router.post("/createCategory",auth, isAdmin, createCategory);

// show all Category
router.get("/showAllCategories",showAllCategory);

// get specific category
router.post("/getCategoryPageDetails",categoryPageDetails);




//************************************ Rating And Review Routes*********************************

// create rating by student
router.post("/createRating",auth, isStudent, createRating);

// get average rating
router.get("/getAverageRating",getAverageRating);

// get Review 
router.get("/getReviews",getAllRatingReview);


module.exports = router;
