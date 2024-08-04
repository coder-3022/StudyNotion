const mongoose =require("mongoose");


const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
    },
    courseDescription: {
        type: String,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    whatYouWillLearn: {
        type: String,
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
        }
    ],
    ratingAndReviews: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview",
        }
    ],
    price: {
        type: Number,
    },
// thumbnail ek picture h jiska cdn link aa raha hoga
    thumbnail: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    tag: {
        type: [String],
        required: true,
    },
    studentEnrolled :[
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        }
    ],
    instructions: {
        type: [String],
    },
    status: {
        type:String,
        enum: ["Draft","Published"],
    },
    createdAt: {
        type:Date,
        default: Date.now
    }

});

module.exports=mongoose.model("Course",courseSchema);