import bcrypt from "bcrypt";
import Tutor from "../model/tutorModel.js";
import catchAsync from "../utils/catchAsync.js";
import { CustomError } from "../utils/customError.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import path from "path";
import OTP from "../model/otpModel.js";

export const tutorSignUp = catchAsync(async (req, res, next) => {
  const { username, email, password: newPassword } = req.body;
  const user = await Tutor.findOne({ email });
  if (user) return next(new CustomError("Email is Already Exist", 409));
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  const newUser = new Tutor({
    username,
    email,
    password: hashedPassword,
  });
  await newUser.save();
  await sendEmail(newUser);
  const rest = {
    id: newUser._doc._id,
    role: newUser._doc.role,
  };
  res.status(200).json({ user: rest });
});

export const tutorSignIn = catchAsync(async (req, res, next) => {
  const { email, password: newPassword } = req.body;
  const user = await Tutor.findOne({ email });
  if (!user)
    return next(new CustomError("User is Not Found Please Register", 401));
  const isValid = bcrypt.compareSync(newPassword, user.password);

  if (!isValid)
    return next(new CustomError("Invalid Username Or Password ", 401));

  const token = jwt.sign({ id: user._id }, process.env.TOKEN, {
    expiresIn: "7d",
  });

  const { password, ...rest } = user._doc;

  console.log(rest);

  res
    .cookie("access_token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    })
    .status(200)
    .json({ user: rest });
});

export const emailVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  console.log(email);
  const user = await Tutor.findOne({ email });
  if (!user) return next(new CustomError("User Not Found", 404));
  const token = jwt.sign({ id: user._id }, process.env.SECRET, {
    expiresIn: "1d",
  });
  await sendEmail(user, token);
  res.status(200).json("Please Click The Link That Sent To Your Mail");
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, id } = req.params;
  const { password } = req.body;
  console.log(password);
  console.log(12552);
  jwt.verify(token, process.env.SECRET, async (err) => {
    if (err) return next(new CustomError("Invalid token", 401));
    const hashedPassword = bcrypt.hashSync(password, 10);
    await Tutor.findByIdAndUpdate(id, { password: hashedPassword });

    res.status(200).json("Password Is Changed");
  });
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { username, email, profession, about } = req.body;
  const tutor = await Tutor.findById(userId);
  // if (tutor && tutor.profilePhoto && tutor.profilePhoto.startsWith("public/")) {
  //   const oldPhotoPath = path.join(__dirname, "../../", tutor.profilePhoto);
  //   fs.unlinkSync(oldPhotoPath);
  // }
  const imgUrl = req.file?.path;

  const updatedUser = await Tutor.findByIdAndUpdate(
    userId,
    { $set: { username, profilePhoto: imgUrl, profession, about } },
    { new: true }
  );

  res.status(200).json(updatedUser);
});

export const changeEmail = catchAsync(async (req, res, next) => {
  let id = req.user.id;
  const tutor = await Tutor.findById(id);

  await sendEmail(tutor);
  res.status(200).json("lfkhgidfkn");
});

export const otpVerification = catchAsync(async (req, res, next) => {
  const { otp, email } = req.body;
  console.log(email);
  const id = req.user.id;
  const validOtp = await OTP.findOne({ userId: id });

  if (!validOtp) return next(new CustomError("No Valid Otp Found", 404));

  const isMatch = await bcrypt.compare(otp, validOtp.otp);

  if (!isMatch)
    return next(new CustomError("Otp is Not Match! Try Again ", 401));

  const tutor = await Tutor.findByIdAndUpdate(validOtp.userId, {
    $set: { email: email },
  });

  console.log(tutor);

  await OTP.deleteOne({ userId: id });
  return res
    .status(200)
    .json({ tutor, message: "Email Verification Successful" });
});
