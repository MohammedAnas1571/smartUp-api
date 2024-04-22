import catchAsync from "../utils/catchAsync.js";
import { CustomError } from "../utils/customError.js";
import { imageStore,videoStore } from "../utils/s3 configure.js";
import crypto from "crypto";
import Course from "../model/courseModel.js";
import Chapters from "../model/chapterModel.js"
import { stripePayment,getEvent } from "../utils/stripe.js";


export const courseUpload = catchAsync(async (req, res, next) => {
  const {title,
    subTitle,
    catagory,
    level,
    tags,
    price,
    description,
    content,} = req.body
 
  const imageName = crypto
    .createHash("md5")
    .update(req.files.image[0].buffer)
    .digest("hex");
   const fileName = await imageStore(req.files.image[0], imageName);
   const videoName = crypto.createHash("md5").update(req.files.preview[0].buffer).digest("hex") + ".mp4";
const videoFileName = await videoStore(req.files.preview[0], videoName);

       await Course.create({
    tutorId: req.user.id,
    title,
    subTitle,
    catagory,
    level,
    tags,
    price,
    description,
    content,
    image: fileName,
    preview:videoFileName,
    chapters:[]
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

export const addingModule = catchAsync(async(req,res,next)=>{
  const {modules,order,id} = req.body
  console.log(modules ,order,id)
  const videoName = crypto.createHash("md5").update(req.file.buffer).digest("hex") + ".mp4";
  const videoFileName = await videoStore(req.file.buffer, videoName);
  console.log("dofihsdfnisdk")
  const chapters =  await Chapters.create({
    modules,order,videoUrl : videoFileName
  })
    await  Course.findByIdAndUpdate(id,{ $push:{modules:chapters._id}},{new:true})
  res.status(201).json("Added new chapter")
})

export const purchaseCoures = catchAsync(async(req,res,next)=>{
  const { course } = req.body;
  const userId = req.user.id

    stripePayment (course,res,userId)
  })
export const purchaseSuccess = catchAsync(async(req,res,next)=>{
      getEvent(req,res)
})

