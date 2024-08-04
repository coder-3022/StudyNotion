const express = require("express");

const app = express();

// Routes
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoutes = require("./routes/Contact");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const path = require("path")

dotenv.config();
const PORT = process.env.PORT || 4000;

// database connect
database.connect();

// middleware
app.use(express.json());
app.use(cookieParser());

// jo v request frontend se aa rahi h cors ussko entertain krega
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials:true,
    })
)
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/temp",
    })
)
// cloudinary connect
cloudinaryConnect();

app.use(express.static(path.join(__dirname,"./client/build")))
// routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/reach", contactUsRoutes);


// default routes
app.get("/",(req,res) => {
    return res.json({
        success:true,
        message: 'Your server is up and running....',
    });
});

// static files

app.get("*",function(req,res) {
    res.sendFile(path.join(__dirname, "./client/build/index.html"))
});

//activate server
app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`)
})
