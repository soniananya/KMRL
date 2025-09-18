const nodemailer = require("nodemailer")
require("dotenv").config()

const mailSender= async (email,title,body)=>{
    try{
        let transporter=nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            port:465,
            secure:true,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            },
            debug:true,
            logger:true
        })

        await transporter.verify();

        let info = await transporter.sendMail({
            from:"aashipaandey@gmail.com",
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`

        })
        return info;
    }
    catch(error){
        console.log(error)
    }
}

module.exports = mailSender;