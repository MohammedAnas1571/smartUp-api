import catchAsync from "../utils/catchAsync.js";
import { CustomError } from "../utils/customError.js";
import { imageStore } from "../utils/s3 configure.js";
import crypto from "crypto";
import Course from "../model/courseModel.js";

export const courseUpload = catchAsync(async (req, res, next) => {
  const { title, subTitle, catagory, level, tags, price, description } =
    req.body;
  const imageName = crypto
    .createHash("md5")
    .update(req.file.buffer)
    .digest("hex");
   const fileName = await imageStore(req.file, imageName);
       await Course.create({
    tutorId: req.user.id,
    title,
    subTitle,
    catagory,
    level,
    tags,
    price,
    description,
    image: fileName,
  });
  return res.status(201).json("courses are  uploaded");
});

export const getCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find()
    .populate({
      path: "tutorId",
      select: "username  profilePhoto",
    })
    .exec();

  res.status(200).json({ courses });
});

export const aboutCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate({ path: "tutorId", select: 'profilePhoto username' })
    .exec();

  if (!course) {
    return next(new CustomError("User is not found. Please register.", 401));
  } else {
    res.status(200).json({ course });
  }
});


export const myCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find({ tutorId: req.user.id })
    .select("image status title updatedAt")
    .exec();

  if (!courses || courses.length === 0) {
    return next(new CustomError("User is not found. Please register.", 401));
  }

  res.status(200).json({ courses });
});
