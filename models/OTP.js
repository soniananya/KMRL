const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
  email: { 
        type: String, 
        required: true 
    },
    otp: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        index: { expires: 300 } 
    } // expires after 5min
});

async function sendVerificationEmail(email, otp){
    try{
        const mailResponse = await mailSender(email, "Verification Email from KMRL", emailtemplate(otp))
        console.log("Email sent Successfully", mailResponse.messageId)
        return mailResponse
    }catch(error){
        console.log("error occured while sending mails", error)
        throw error;
    }
}

otpSchema.pre("save", async function(next) {
    if (this.isNew) {
        try {
            await sendVerificationEmail(this.email, this.otp);
            next();
        } catch (error) {
            next(error); // Pass error to next middleware
        }
    } else {
        next();
    }
});

module.exports = mongoose.model("OTP", otpSchema);