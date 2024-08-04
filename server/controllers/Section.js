const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

// create section
exports.createSection = async (req,res) => {
    try {
        // fetch data
        const {sectionName, courseId} =req.body;

        // data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message: 'Missing properties',
            });
        }

        // create section
        const newsection = await Section.create({sectionName});

        // update course with this section objectId
        const updatedCourseDetails =await Course.findByIdAndUpdate(
                courseId,
                {
                    $push: {
                        courseContent:newsection._id,
                    }
                },
                {new:true},
        )
        .populate(
            {
                path:"courseContent",
                populate: {
                    path: "subSection",
                }
            }
        )
        .exec();
        // return response
        return res.status(200).json({
            success: true,
            message: 'section created successfully',
            updatedCourseDetails,
        });
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to create Section,Please try again',
            error: error.message,
        });
    }
}

// update section
exports.updateSection = async (req,res) => {
    try {
        // fetch data
        const {sectionName,sectionId, courseId} =req.body;

        // data validate
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success: false,
                message: 'Missing Property'
            })
        }

        // update data
        const section = await Section.findByIdAndUpdate(
            sectionId,
            { sectionName },
            { new:true }
        );

        const course =  await Course.findById(courseId).populate(
            {
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            }
        ).exec();

        // return response
        return res.status(200).json({
            success: true,
            data:course,
            message: 'section updated successfully',  
        });

    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to update Section,Please try again',
            error: error.message,
        });
    }
}


// delete section
exports.deleteSection = async (req,res) => {
    try {
        // fetch id
        const {sectionId,courseId} = req.body;
        // find by id and delete
        const section = await Section.findById(sectionId)
        if(!section) {
            return res.status(404).json({
                success: false,
                message: "Section not Found",
            })
        }

        await SubSection.deleteMany(
            { _id: {
                $in: section.subSection
            }}
        )

        await Section.findByIdAndDelete(sectionId);
        
        // find the updated course and return
        const course = await Course.findById(courseId).populate(
            {
                path: "courseContent",
                populate: {
                    path: "subSection",
                }
            }
        ).exec();

        // return response
        return res.status(200).json({
            success: true,
            message: 'section Deleted successfully', 
            data: course, 
        });
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to delete Section,Please try again',
            error: error.message,
        });
    }
}
