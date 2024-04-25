import bcrypt from "bcrypt";
import User from "../model/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import { CustomError } from "../utils/customError.js";
import { sendEmail } from "../utils/sendEmail.js";
import OTP from "../model/otpModel.js";
import jwt from "jsonwebtoken";
import Tutor from "../model/tutorModel.js";
import { CreateBucketCommand } from "@aws-sdk/client-s3";

export const userSignUp = catchAsync(async (req, res, next) => {
  const { username, email, role, password: newPassword } = req.body;
  const user = await User.findOne({ email });
  if (user) return next(new CustomError("Email is already Exist", 409));
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role,
  });
  await newUser.save();
  await sendEmail(newUser);
  const rest = {
    id: newUser._doc._id,
    role: newUser._doc.role,
  };
  res.status(200).json({ user: rest });
});

export const userSignIn = catchAsync(async (req, res, next) => {
  const { email, password: newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return next(new CustomError("User is not Found please register", 401));
  const isValid = bcrypt.compareSync(newPassword, user.password);

  if (!isValid) return next(new CustomError("Invalid Password!", 401));

  const token = jwt.sign({ id: user._id }, process.env.TOKEN, {
    expiresIn: "7d",
  });

  const { password, ...rest } = user._doc;
  res
    .cookie("access_token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    })
    .status(200)
    .json({ user: rest });
});
export const otpValidation = catchAsync(async (req, res, next) => {
  const { otp, id, role } = req.body;
  console.log(otp, id, role);
  const validOtp = await OTP.findOne({ userId: id });

  if (!validOtp) return next(new CustomError("No Valid Otp Found", 404));

  const isMatch = await bcrypt.compare(otp, validOtp.otp);

  if (!isMatch) return next(new CustomError("Invalid Token ", 401));

  let user;
  if (role === "User") {
    await User.findByIdAndUpdate(validOtp.userId, {
      isVerified: true,
    });
    user = await User.findById(validOtp.userId);
  } else {
    await Tutor.findByIdAndUpdate(validOtp.userId, {
      isVerified: true,
    });
    user = await Tutor.findById(validOtp.userId);
  }

  await OTP.deleteOne({ userId: id });
  console.log(user);
  const token = jwt.sign({ id: user._id }, process.env.TOKEN, {
    expiresIn: "7d",
  });

  const { password, ...rest } = user._doc;
  res.cookie("access_token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  return res
    .status(200)
    .json({ user: rest, message: "Email Verification Successful" });
});

export const emailVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  console.log(email);
  const user = await User.findOne({ email });
  if (!user) return next(new CustomError("user not found", 404));
  const token = jwt.sign({ id: user._id }, process.env.SECRET, {
    expiresIn: "1d",
  });
  await sendEmail(user, token);
  res.status(200).json("Please Click the link that sent to your mail");
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, id } = req.params;
  const { password } = req.body;
  console.log(password);
  console.log(12552);
  jwt.verify(token, process.env.SECRET, async (err) => {
    if (err) return next(new CustomError("Invalid token", 401));

    const hashedPassword = bcrypt.hashSync(password, 10);
    await User.findByIdAndUpdate(id, { password: hashedPassword });
    res.status(200).json("Password is changed");
  });
});

export const googleAuth = function (accessToken, refreshToken, profile, cb) {
  try {
    console.log(profile);
  } catch (err) {
    return cb(err, null);
  }
};

export const signOut = catchAsync(async (req, res, next) => {
  res.clearCookie("access_token").json("cookie cleared");
});
