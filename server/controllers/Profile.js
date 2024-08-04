const { default: mongoose } = require("mongoose");
const Profile = require("../models/Profile");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");


// update profile
exports.updateProfile =async (req,res) => {
    try {
        // fetch data
        const {firstName="", lastName="",dateOfBirth="", about="", contactNumber="", gender=""} = req.body;

        // user id
        const id =req.user.id;
        // findProfile
        const userDetails = await User.findById(id);
        const profileDetails = await Profile.findById(userDetails.additionalDetails);

        const user = await User.findByIdAndUpdate(id, { firstName,  lastName, })
      
        await user.save()
        console.log("dob",dateOfBirth)
        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        console.log("dob updated",profileDetails.dateOfBirth)
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;
        await profileDetails.save(); 

        // Find the updated user details
        const updatedUserDetails = await User.findById(id).populate("additionalDetails").exec()

        // return response
        return res.status(200).json({
            success: true,
            message: 'Profile Updated successfully',  
            updatedUserDetails,
        });
    }
    catch(error) {
        console.log(error)
        return res.status(500).json({
            success: false,
           error: error.message,
        });
    }
};

// delete account
exports.deleteAccount = async (req,res) => {
    try {
        // fetch data
        const id=req.user.id;

        // validate data
        const userDetails = await User.findById({ _id: id});
        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // delete profile
        await Profile.findByIdAndDelete({_id: new mongoose.Types.ObjectId(userDetails.additionalDetails)});

        // hw!! unenroll user from enrolled course
        for(const courseId of userDetails.courses) {
            await Course.findByIdAndUpdate(courseId, {$pull: {studentsEnrolled: id}}, {new: true} )
          }
        // delete user
        await User.findByIdAndDelete({_id:id});
        
        // delete user's courseprogress also
        await CourseProgress.deleteMany({userId: id});

        // return response
        return res.status(200).json({
            success: true,
            message: 'User Deleted successfully',  
        });

    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: 'User cannot be deleted, Please try after sometime',
        });
    }
};

// get all user details
exports.getAllUserDetails = async (req,res) => {
    try {
        // fetch data
        const id=req.user.id;

        // validate data and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        // return response
        return res.status(200).json({
            success: true,
            message: 'User Data fetched successfully',  
            data:userDetails,
        });
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture
        const userId = req.user.id
        const image = await uploadImageToCloudinary(displayPicture, process.env.FOLDER_NAME, 1000, 1000)

        const updatedProfile = await User.findByIdAndUpdate(
                                        { _id: userId},
                                        {image: image.secure_url},
                                        {new:true},
                                        
                                    )

        return res.status(200).json({
            success: true,
            message: "Image updated successfully",
            data: updatedProfile,
        })

    }
    catch(error) {
        return res.status(500).json({
            success: false,
            // message: error.message,
            message:"bhai nhi hua uplaod",
        })
    }
}

exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id
        let userDetails = await User.findOne({_id: userId})
        .populate({
            path: "courses",
            populate: {
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            },
        }).exec()

        if(!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
            })
        }

        userDetails = userDetails.toObject()
        var SubsectionLength = 0
        for(var i=0 ; i < userDetails.courses.length; i++) {
            let totalDurationInSeconds = 0
            SubsectionLength = 0
            for(var j = 0; j< userDetails.courses[i].courseContent.length; j++) {
                totalDurationInSeconds += userDetails.courses[i].courseContent[j].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
                userDetails.courses[i].totalDuration = convertSecondsToDuration(totalDurationInSeconds)
                SubsectionLength += userDetails.courses[i].courseContent[j].subSection.length
            }
            let courseProgressCount = await CourseProgress.findOne({
                courseId: userDetails.courses[i]._id, 
                userId: userId,
            })
            courseProgressCount = courseProgressCount?.completedVideos.length

            if(SubsectionLength === 0) {
                userDetails.courses[i].progressPercentage = 100
            } 
            // To make it up to 2 decimal point
            else{
                const multiplier = Math.pow(10,2)
                userDetails.courses[i].progressPercentage = Math.round( 
                    (courseProgressCount / SubsectionLength) * 100 * multiplier) 
                    / multiplier
            }
        }
        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        })
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


exports.instructorDashboard = async (req, res) => {
    try {
        const courseDetails = await Course.find({ instructor: req.user.id })
  
        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course?.studentEnrolled?.length
            const totalAmountGenerated = totalStudentsEnrolled * course.price
    
            // Create a new object with the additional fields
            const courseDataWithStats = {
            _id: course._id,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            // Include other course properties as needed
            totalStudentsEnrolled,
            totalAmountGenerated,
            }
            return courseDataWithStats
        })
  
       res.status(200).json({
          courses: courseData,
        })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
}
