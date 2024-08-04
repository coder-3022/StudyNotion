const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const {paymentSuccessEmail} = require("../mail/templates/paymentSuccessEmail")
const crypto = require("crypto");
const CourseProgress = require("../models/CourseProgress")


// capture the payment and initiate the Razorpay order
exports.capturePayment = async (req,res) => {
    // get course and user id
    const {courses} = req.body;
    const userId =req.user.id;

    // validation
    if(courses.length === 0){
        return res.json({
            success:false,
            message: 'Please provide valid course id',
        });
    };

    // valid courseId
    let totalAmount = 0;
    for(const course_id of courses) {
        let course;
        try{
            course =await Course.findById(course_id);
            if(!course){
                return res.json({
                    success: false,
                    message: 'Could not find the course',
                });
            }
    
            // user already pay for the same course
            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentEnrolled.includes(uid)){
                return res.status(200).json({
                    success: false,
                    message: 'Student is  already Enrolled',
                });
            }
            totalAmount += course.price;
        }
        catch(error){
            console.error(error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }

    }
    
    // order create 
    const currency = "INR";

    const options = {
        amount: totalAmount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        // notes: {
        //     courseId: course_id,
        //     userId,
        // } 
    };

    try {
        // initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);

        // return response
        return res.status(200).json({
            success: true,
            message: paymentResponse,
        })
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            meassage: 'Could not initiate order',
        });
    }
    
};

// verify signature of razorpay and server
// multiple courses buy krne ke liye
exports.verifySignature = async (req,res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id
    const razorpay_signature = req.body?.razorpay_signature

    const courses = req.body?.courses
    const userId = req.user.id

    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature ||
        !courses || !userId) {
            return res.status(200).json({
                success: false,
                message: "Payment Failed"
            })
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature  = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex")

    if(expectedSignature === razorpay_signature) {
        // enroll student
        await enrollStudents(courses, userId, res)
        // return res
        return res.status(200).json({
            success: true,
            message: "Payment Verified"
        })
    }
    return res.status(200).json({
        success: false,
        message: "Payment Failed"
    })
    
}

const enrollStudents = async(courses, userId, res) => {
    if(!courses || !userId) {
        return res.status(400).json({
            success: false,
            message: "Please Provide data for courses or userId"
        })
    }

    for( const courseId of courses) {
       
        try {

            // find the course and enroll in it

            const enrolledCourse = await Course.findOneAndUpdate(
                {_id: courseId},
                {
                    $push: {
                        studentEnrolled: userId
                    }
                },
                {new: true},
            )
            if(!enrolledCourse) {
                return res.status(500).json({
                    success: false,
                    message: "Course not found"
                })
            }

             // created courseProgress for enrolled Courses in DB;
            const courseProgress = await CourseProgress.create({
                courseId:courseId,
                userId:userId,
                completedVideos: [],
            })

            // find the student and add the course to their list of enrolled courses

            const enrolledStudent = await User.findByIdAndUpdate(userId,
                {
                    $push : {
                        courses: courseId,
                        courseProgress: courseProgress._id,
                    }
                },
                {new:true},
            )

            // mail send for confirmation
            const emailResponse = await mailSender(
                enrolledStudent.email,
                `Congratulations, You are successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)   
            )
        }
        catch(error) {
            console.log(error) 
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

}

// send successfull email for payment
exports.sendPaymentSuccessEmail = async (req, res) => {
    const {orderId, paymentId, amount} = req.body

    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({
            success: false,
            message: "Please provide all the fields"
        })
    }

    try {
        const enrolledStudent = await User.findById(userId)
        await mailSender(enrolledStudent.email,
                        `Payment Recieved`,
                        paymentSuccessEmail(`${enrolledStudent.firstName}`,amount/100, orderId, paymentId)     
            
                    )
    }
    catch(error) {
        console.log("error in sending mail",error)
        return res.status(500).json({
            success: false,
            message: "Could not send Email"
        })

    }
}
