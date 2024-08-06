import "dotenv/config";
import nodeMailer from "nodemailer";
import OTP from "../model/otpModel.js";
import bcrypt from "bcrypt";

let transporter = nodeMailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const sendEmail = async ({ username, email, _id,role }, token) => {
  try {
    if (token ) {
      let mail
       if(role === "User"){
         mail = {
        from: process.env.EMAIL,
        to: email,
        subject: "Verification for  your account",
        text: `${process.env.ORIGIN}/verify-email/${_id}/${token}" `,
      };
    }
      else{
        mail = {
          from: process.env.EMAIL,
          to: email,
          subject: "Verification for  your account",
          text: `${process.env.ORIGIN}/instructor/verify-email/${_id}/${token}" `,
        };
      }
    
      await transporter.sendMail(mail);
    } else {
      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log(otp +"fiosufkj");
      const mailOption = {
        from: process.env.EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: `<p>"Hi ${username} </p>

            <p> Thank you for using our service. Your OTP (One-Time Password) for verification is:  <b style ="font-size: 20px"> ${otp} </b> </p>
            <p>Please enter this OTP on the verification page to complete the process.  
             If you did not request this OTP, please ignore this email. It will expire after 5 minutes</p>
            <br>
           <p> Best regards</p> `,
      };


      const newOtp = new OTP({
        userId: _id,
        otp,
      });

      await OTP.deleteMany({ userId: _id });

      await newOtp.save();

      await transporter.sendMail(mailOption);
    }
  } catch (error) {
    console.log(error.message);
  }
};
