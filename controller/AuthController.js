import bcrypt from "bcrypt";
import User from "../model/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import { CustomError } from "../utils/customError.js";
import { sendEmail } from "../utils/sendEmail.js";
import OTP from "../model/otpModel.js";
import jwt from "jsonwebtoken";

export const userSignUp = catchAsync(async (req, res, next) => {
  const { username, email } = req.body;

  const user = await User.findOne({ email });
  if (user) next(new CustomError("Email is already Exist", 409));
  else {
    
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    await sendEmail(newUser);
    const { password, ...rest } = newUser._doc;
    res.status(200).json(rest)
  }
});

export const userSignIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return next(new CustomError("User is not Found please register", 401));
  const isValid = bcrypt.compareSync(password, user.password);

  if (!isValid) return next(new CustomError("Invalid Password!", 401));

  const token = jwt.sign({ id: user._id }, process.env.TOKEN, {
    expiresIn: "7d",
  });
  const { password: hashedPassword, ...rest } = user._doc;
  res
    .cookie("access_token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path:"/"
    })
    .status(200)
    .json(rest);
});

export const otpValidaion = catchAsync(async (req, res, next) => {
  const { otp, id } = req.body;
  console.log(id)
  console.log(122)
  const validOtp = await OTP.findOne({userId:id})
  console.log(validOtp)
  if (!validOtp) return next(new CustomError("No Valid Otp found", 404));
  const isMatch = await bcrypt.compare(otp, validOtp.otp);
  if (!isMatch) return next(new CustomError("Invalid Token ", 401));
  const user = await User.findByIdAndUpdate(validOtp.userId, {
    isVerified: true,
  });
  const token = jwt.sign({ id: user._id }, process.env.TOKEN, {
    expiresIn: "7d",
  });
  const { password: hashedPassword, ...rest } = user._doc;
  res
    .cookie("access_token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path:"/"
    })
    
   
  
  return res.status(200).json({rest, message: "Email Verification Successful" });
});


export const emailVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  console.log(email);
  const user = await User.findOne({ email });
  if (!user) return next(new CustomError("user not found", 404));
  const token = jwt.sign({ id: user._id }, process.env.SECRET, {
    expiresIn: "1d",
  })
  await sendEmail(user, token);
  res.status(200).json("Please Click the link that sent to your mail");
});


export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, id } = req.params;
  const { password } = req.body;
  console.log(password)
  console.log(12552);
  jwt.verify(token, process.env.SECRET, async (err) => {
    if (err) return next(new CustomError("invalid token", 401));
  
      const hashedPassword = bcrypt.hashSync(password, 10);
      await User.findById(id, { password: hashedPassword });
      res.status(200).json("Password is changed");
   
  });
});
