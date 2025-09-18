const express = require("express")
const app=express()

require("dotenv").config()

const {dbConnect} = require("./config/database")

const cookieparser = require("cookie-parser")
const cors = require("cors")
const fileUpload = require("express-fileupload")

const PORT = process.env.PORT || 4000

dbConnect();

app.use(express.json())
app.use(cookieparser());

app.use(
    cors({
        origin:"http://localhost:4000",
        credentials:true
    })
)

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp"
    })
)

const routes = require("./routes/mainRouter")

app.use("/api/v1", routes)

app.get("/", (req,res) => {
    return res.status(200).json({
        success:true,
        message:"Your server is running"
    })
})

app.listen(PORT,() => {
    console.log("App is running at PORT ",PORT)
})