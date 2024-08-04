const Category = require("../models/Category");
const { Mongoose } = require("mongoose");
function getRandomInt(max){
    return Math.floor(Math.random()*max)
}

// create category ka handler 
exports.createCategory = async (req,res) => {
    try {
        // fetch data
        const {name, description} = req.body;

        // validate data
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        //create entry in db
        const categoryDetails = await Category.create({
            name: name,
            description: description,
        }); 
        return res.status(200).json({
            success: true,
            message: 'category created successfully',
        });
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// get all Category function
exports.showAllCategory = async (req,res) => {
    try {
        // allTags ke andar name aur decription hona hi chahiye
        const allCategory = await Category.find({});
        res.status(200).json({
            success: true,
            message: 'All category returned successfully',
            data : allCategory,
        });
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

//categoryPageDetails
exports.categoryPageDetails = async (req,res) => {
    try {
        //get categoryId
        const {categoryId} =req.body;
        // get courses for sepcified  categoryId
        const selectedCategory =await Category.findById(categoryId)
                                        .populate(
                                            {
                                                path: "courses",
                                                match: {status: "Published"},
                                                populate: "ratingAndReviews",
                                            }
                                        )
                                        .exec();
        // validation
        if(!selectedCategory){
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        // Handle the case when there are no courses
        if(selectedCategory.courses.length === 0) {
            return res.status(404).json({
            success: false,
            message: "No courses found for the selected category.",
            })
        }
        // get courses for different categories
        const categoriesExceptSelected = await Category.find({_id: {$ne: categoryId},})
        const differentCategories = await Category.findOne(categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]._id)
                                    .populate(
                                        {
                                            path: "courses",
                                            match: {status: "Published"},
                                            populate: "ratingAndReviews",
                                        }
                                    )
                                    .exec();

        // get top 10 selling courses across all categories
        const allCategories = await Category.find()
                                .populate({
                                path: "courses",
                                match: { status: "Published" },
                                populate: {
                                    path: "instructor",
                                    
                                },
                                populate: "ratingAndReviews",
                            })
                                .exec()
                                
        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses.sort((a,b) => b.sold - a.sold).slice(0, 10)
        // return response
        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
                mostSellingCourses,
            },
        });
    }
    catch(error) {
        console.log((error));
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


