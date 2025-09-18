const mongoose=require("mongoose")

require("dotenv").config()

exports.dbConnect = () => {
    mongoose.connect(process.env.DATABASE_URL)
    .then(()=>{console.log("Db connected Successfully")})
    .catch((error)=>{
        console.log(error)
        console.log("Issue in DB Connection")
        process.exit(1);
    });
}