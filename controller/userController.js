import bcrypt from "bcrypt";
import User from "../model/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import { CustomError } from "../utils/customError.js";
import { sendEmail } from "../utils/sendEmail.js";
import OTP from "../model/otpModel.js";
import jwt from "jsonwebtoken";
import Tutor from "../model/tutorModel.js";
// import path from "path"
// import  fs from 'fs'

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
  const { email, password } = req.body;
  console.log(password);
  const user = await User.findOne({ email });
  if (!user) {
    return next(new CustomError("User not found, please register", 401));
  }

  const isValid = bcrypt.compare(password, user.password);
  if (!isValid) {
    return next(new CustomError("Invalid password!", 401));
  }
  const token = jwt.sign({ id: user._id }, process.env.TOKEN, {
    expiresIn: "5m",
  });
  const refreshToken = jwt.sign({ id: user._id }, process.env.TOKEN);

  const { password: _, ...rest } = user._doc;

  res
    .cookie("access_token", token, {
      httpOnly: true,

      maxAge: 5 * 60 * 1000,
    })
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({ user: rest });
});

export const otpValidation = catchAsync(async (req, res, next) => {
  const { otp, id, role } = req.body;

  const validOtp = await OTP.findOne({ userId: id });

  if (!validOtp) return next(new CustomError("No Valid Otp Found", 404));

  const isMatch = await bcrypt.compare(otp, validOtp.otp);

  if (!isMatch)
    return next(new CustomError("Otp is Not Match! Try Again ", 401));

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

  const token = jwt.sign({ id: user._id }, process.env.TOKEN, {
    expiresIn: "5m",
  });

  const { password, ...rest } = user._doc;
  const refreshToken = jwt.sign({ id: user._id }, process.env.TOKEN);
  res
    .cookie("access_token", token, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000,
    })
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

  return res
    .status(200)
    .json({ user: rest, message: "Email Verification Successful" });
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const { refresh_token } = req.cookies;

  console.log(req.cookies);

  if (!refresh_token) {
    return next(new CustomError("Forbidden", 403));
  }

  const decoded = jwt.verify(refresh_token, process.env.TOKEN);

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new CustomError("User not found", 404));
  }
  const newAccessToken = jwt.sign({ id: user._id }, process.env.TOKEN, {
    expiresIn: "5m",
  });

  res.cookie("access_token", newAccessToken, {
    httpOnly: true,
    maxAge: 5 * 60 * 1000,
  });

  res.status(200).json({ message: "New access token generated" });
});

export const emailVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  console.log(email);
  const user = await User.findOne({ email });
  if (!user) return next(new CustomError("user not found", 404));
  const token = jwt.sign({ id: user._id }, process.env.SECRET, {
    expiresIn: "5d",
  });
  await sendEmail(user, token);
  res.status(200).json("Please Click the link that sent to your mail");
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, id } = req.params;
  const { password } = req.body;

  jwt.verify(token, process.env.SECRET, async (err) => {
    if (err) return next(new CustomError("Invalid Otp", 401));

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

export const changeProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const { username, about } = req.body;
  const user = await User.findById(userId);
  // if (user && user.profilePhoto && user.profilePhoto.startsWith("public/")) {
  //   const oldPhotoPath = path.join(path.dirname, "../../", user.profilePhoto);
  //   fs.unlinkSync(oldPhotoPath);
  // }
  const imgUrl = req.file?.path;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { username, profilePhoto: imgUrl, about } },
    { new: true }
  );

  res.status(200).json(updatedUser);
});

export const signOut = catchAsync(async (req, res, next) => {
  res.clearCookie("access_token", {
    httpOnly: true,
  });

  res.clearCookie("refresh_token", {
    httpOnly: true,
  });

  res.status(200).json({ message: "Cookies cleared, signed out successfully" });
});

export const changePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword === confirmPassword) {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const isMatch = bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return next(new CustomError("Entered Password is incorrect", 400));
    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      res.status(200).json("password changed successfully");
    }
  }
});
