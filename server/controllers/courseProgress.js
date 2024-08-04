const CourseProgress = require("../models/CourseProgress")
const SubSection = require("../models/SubSection")



exports.updateCourseProgress = async (req,res) => {

    const {courseId, subSectionId} = req.body
    const userId = req.user.id

    try {
        // Check if the subsection is valid
        const subSection = await SubSection.findById(subSectionId)

        if(!subSection) {
            return res.status(404).json({
                success: false,
                error: "Invalid subSection"
            })
        }

        // find the course progress document for user and course

        let courseProgress = await CourseProgress.findOne({
            courseId: courseId, 
            userId: userId
        })

    // If course progress doesn't exist, create a new one
        if(!courseProgress) {
            return res.status(404).json({
                success: false,
                message: "Course Progress does not Exist",
            })
        }
        else {
            // If course progress exists, check if the subsection is already completed
            if(courseProgress.completedVideos.includes(subSectionId)) {
                return res.status(400).json({
                    error: "Subsection already completed",
                })
            }
            // Push the subsection into the completedVideos array
            courseProgress.completedVideos.push(subSectionId)
        }

        // Save the updated course progress
        await courseProgress.save()
        
        return res.status(200).json({
            success: true,
            message: "Course Progress updated"
        })
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        })
    } 
}
