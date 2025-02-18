const Course = require("../models/Course");
const Category = require("../models/Category");
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const CourseProgress = require("../models/CourseProgress")
const {convertSecondsToDuration} = require("../utils/secToDuration")


// create course function
exports.createCourse = async (req,res) => {
    try {
        // fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, category, tag: _tag, status, instructions: _instructions,} = req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;
        
        const tag = JSON.parse(_tag);
        const instructions = JSON.parse(_instructions)

        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag.length
            || !instructions.length || !category || !tag || !thumbnail){
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        if(!status || status === undefined){
            status = "Draft"
        }

        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId, {accountType: "Instructor",});
        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: 'Instructor Details not found',
            });
        }
        // databse me verify that userid and instructor id are same or different

        // check category is valid or not 
        const categoryDetails =await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success: false,
                message: 'Category Details not found',
            });
        }
        // upload Image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        // create an entry for new course
        const newCourse =await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status,
            instructions,
        });

        // add the new  course to the user schema of Instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {
                new: true
            },
        );

        // update the category  ka schema 
        // ye check krna h kyuki khud se likhe h
        await Category.findByIdAndUpdate(
            {_id: category},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {
                new: true
            },
        );

        // return response
        return res.status(200).json({
            success: true,
            message: 'course created successfully',
            data: newCourse,
        });

    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create course',
            error: error.message,
        });
    }
};

// Edit courses Details
exports.editCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      const updates = req.body
      const course = await Course.findById(courseId)
  
      if(!course){
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if(req.files){
        const thumbnail = req.files.thumbnailImage
        const thumbnailImage = await uploadImageToCloudinary( thumbnail,  process.env.FOLDER_NAME )
        course.thumbnail = thumbnailImage.secure_url
      }
  
      // Update only the fields that are present in the request body
      for(const key in updates) {
        if(updates.hasOwnProperty(key)) {
          if(key === "tag" || key === "instructions") {
            course[key] = JSON.parse(updates[key])
          } 
          else {
            course[key] = updates[key]
          }
        }
      }
      // save the course
      await course.save()                                     
  
      const updatedCourse = await Course.findOne({ _id: courseId,})
                            .populate({
                              path: "instructor",
                              populate: {
                                path: "additionalDetails",
                              },
                            })
                            .populate("category")
                            .populate("ratingAndReviews")
                            .populate({
                              path: "courseContent",
                              populate: {
                                path: "subSection",
                              },
                            })
                            .exec()
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })
    } 
    catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
}
// get all course
exports.getAllCourses = async (req,res) => {
    try {
        // find course
        const allCourses = await Course.find({status: "Published"},
            {
                courseName:true,
                price:true,
                thumbnail:true,
                instructor:true,
                ratingAndReview:true,
                studentEnrolled:true,
            }
        )
        .populate("instructor")
        .exec();
        
        // return response
        return res.status(200).json({
            success: true,
            message: 'Data for all courses fetch successfully',
            data: allCourses,
        });

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot fetch Course data',
            error: error.message,
        })
    }
};

// getCourseDetails
exports.getCourseDetails = async (req,res) => {
    try {
        // fetch course id
        const {courseId} =req.body;

        // find Course details
        const courseDetails = await Course.findOne(
            {_id: courseId})
            .populate(
                {
                    path: "instructor",
                    populate:{
                        path: "additionalDetails",
                    },
                }
            )
            .populate("category")
            .populate("ratingAndReviews")
            .populate(
                {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                        select: "-videoUrl",
                    },
                }
            )
            .exec();
        // validaton
        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId}`,
            });
        }

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })
        
        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        // return response
        return res.status(200).json({
            success: true,
            message: 'Course details fetch successfully',
            data: {courseDetails, totalDuration}
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const userId = req.user.id

      const courseDetails = await Course.findOne({ _id: courseId, })
                          .populate({
                            path: "instructor",
                            populate: {
                              path: "additionalDetails",
                            },
                          })
                          .populate("category")
                          .populate("ratingAndReviews")
                          .populate({
                            path: "courseContent",
                            populate: {
                              path: "subSection",
                            
                            },
                          })
                          .exec()
  
      let courseProgressCount = await CourseProgress.findOne({courseId: courseId,  userId: userId,})

      if(!courseDetails){
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
      
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos ? courseProgressCount?.completedVideos : [], 
        },
      })
    } 
    catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
}

// Get a list of course for a given Instructor
exports.getInstructorCourses =  async (req, res) => {
    try {
        // Get the instructor ID from the authenticated user or request body
        const instructorId = req.user.id
        
        // Find all courses belonging to the instructor
        const instructorCourses = await Course.find({instructor: instructorId,}).sort({createdAt: -1 })

        // Return the instructor's courses
        res.status(200).json({
            success: true,
            data: instructorCourses,
        })
    }
    catch(error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
        })
    }
}


// Delete the Course
exports.deleteCourse = async (req, res) => {
    try {
        const {courseId} = req.body

        // Find the course
        const course = await Course.findById(courseId)

        if(!course){
            return res.status(404).json({
                message: "Course not found",
            })
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentEnrolled
        for(const studentId of studentsEnrolled){
            await User.findByIdAndUpdate(
                                    studentId,
                                    {
                                        $pull:{
                                            courses:courseId,
                                        }
                                    }

                                )
        }

        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for(const sectionId of courseSections){
            const section = await Section.findById(sectionId)
            
            // delete sub-section of the section
            if(section){
                const subSections = section.subSection
                for(const subSectionId of subSections){
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }
            await Section.findByIdAndDelete(sectionId)
        }

        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })

    }
}
