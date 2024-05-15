import catchAsync from "../utils/catchAsync.js";
import { CustomError } from "../utils/customError.js";
import { imageStore, videoStore } from "../utils/s3 configure.js";
import crypto from "crypto";
import Course from "../model/courseModel.js";
import Chapters from "../model/chapterModel.js";
import { stripePayment, getEvent } from "../utils/stripe.js";
import Purchase from "../model/PurchaseModel.js";
import Catagory from "../model/catagoryModel.js";
import { uploadQueue } from "../utils/uploadingWithQueue.js";
import { Subscription } from "../model/subscriptionModel.js";
import { Subscribed } from "../model/subscibedModel.js";
import jwt from "jsonwebtoken";
import Review from "../model/reviewModel.js"

export const courseUpload = catchAsync(async (req, res, next) => {
  const {
    title,
    subTitle,
    catagory,
    level,
    tags,
    price,
    description,
    content,
  } = req.body;

  const uploadImageTask = async () => {
    const imageName = crypto
      .createHash("md5")
      .update(req.files.image[0].buffer)
      .digest("hex");
    const fileName = await imageStore(req.files.image[0], imageName);
    return fileName;
  };

  const uploadPreviewTask = async () => {
    const videoName =
      crypto
        .createHash("md5")
        .update(req.files.preview[0].buffer)
        .digest("hex") + ".mp4";
    const videoFileName = await videoStore(req.files.preview[0], videoName);
    return videoFileName;
  };

  const uploadTask = async () => {
    const fileName = await uploadImageTask();
    const videoFileName = await uploadPreviewTask();
    const course = await Course.create({
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
      preview: videoFileName,
    });
    return course;
  };

  await new Promise((resolve, reject) => {
    const numTasks = 1;
    let completedTasks = 0;

    const onComplete = () => {
      completedTasks++;
      if (completedTasks === numTasks) {
        resolve();
      }
    };

    uploadQueue.onComplete(onComplete);

    uploadQueue.enqueue(uploadTask);
  });

  return res.status(201).json("Courses are uploaded ");
});

export const getCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find({ status: "Approved" })
    .populate({
      path: "tutorId",
      select: "username  profilePhoto",
    })
    .exec();
   const categories = await Catagory.find({}).select("name")
  res.status(200).json({ courses,categories });
});



export const aboutCourse = catchAsync(async (req, res, next) => {
  let isPurchased = false;
  if (req.cookies.access_token) {
    const token = req.cookies.access_token;
    const user = jwt.verify(token, process.env.TOKEN);
    req.user = user;
    const purchase = await Purchase.findOne({
      userId: req.user.id,
      courseId: req.params.id,
    });

    if (purchase) {
      isPurchased = true;
    }
  }
  const reviews = await Review.find({courseId:req.params.id}).populate({path:"userId",select:"username profilePhoto"})
  const totalReviews = reviews.length;
   let totalRating = 0;
    reviews.forEach(review => {
    totalRating += review.rating;
});
const averageRating = totalRating / totalReviews;
  
  const course = await Course.findById(req.params.id)
    .populate({
      path: "tutorId",
      select: "profilePhoto username about profession",
    })
    .populate({ path: "catagory", select: "name" })
    .exec();

  if (!course) {
    return next(new CustomError("Course is not found.", 401));
  } else {
    const chapters = await Chapters.find(
      { courseId: req.params.id },
      { name: 1, _id: 1 }
    ).sort({ order: 1 });

    res.status(200).json({ course, chapters, isPurchased,reviews,averageRating });
  }
});

export const publishCourse = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  const isChapters = await Chapters.find({ courseId: id });
  if (isChapters.length < 1) {
    return next(new CustomError("Please Add Atleast One Module", 400));
  } else {
    await Course.findByIdAndUpdate(id, { isPublish: true });
    res.status(200).json({ message: "The course has been published" });
  }
});

export const myCourses = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 4;
  const skip = (page - 1) * pageSize;
  const courses = await Course.find({ tutorId: req.user.id })
    .skip(skip)
    .limit(pageSize)
    .select("image title updatedAt price isPublish")
    .exec();

  const totalCount = await Course.countDocuments({ tutorId: req.user.id });
  const pageCount = Math.ceil(totalCount / pageSize);

  const pagination = {
    pageCount,
  };

  res.status(200).json({ courses, pagination });
});

export const addingModule = catchAsync(async (req, res, next) => {
  const { modules, order, id } = req.body;
  console.log(modules, order, id);
  const videoName =
    crypto.createHash("md5").update(req.file.buffer).digest("hex") + ".mp4";
  const videoFileName = await videoStore(req.file.buffer, videoName);
 
   await Chapters.create({
    name: modules,
    order,
    videoUrl: videoFileName,
    courseId: id,
  });

  const remainingChapters = await Chapters.find({ courseId: id });
  res.status(201).json({ remainingChapters });
});

export const purchaseCoures = catchAsync(async (req, res, next) => {
  const { course } = req.body;
  const userId = req.user.id;
  stripePayment(course, res, userId);
});
export const purchaseSuccess = catchAsync(async (req, res, next) => {
  getEvent(req, res);
});

export const getModuleList = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const purchased = await Purchase.findOne({ userId, courseId: id });
  const reviews = await Review.findOne({userId})

  if (purchased) {
    const chapters = await Chapters.find({ courseId: id }).sort({ order: 1 });

    res.status(200).json({ chapters,reviews });
  }
});

export const getCatagory = catchAsync(async (req, res, next) => {
  const categories = await Catagory.find({ activeStatus: true });
  res.status(200).json({ categories });
});

export const deleteChapter = catchAsync(async (req, res, next) => {
  
  await Chapters.findByIdAndDelete(req.params.id);

  const remainingChapters = await Chapters.find({ courseId:req.params.courseId });

  res.status(200).json({ remainingChapters, message: "Deleted Successfully" });
});

export const subscriptionPlan = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const subscriptions = await Subscription.find({});
  const subscribed = await Subscribed.findOne({ userId });
  if (subscribed) {
    const currentDate = new Date();
    const expireDate = new Date(subscribed.expireAt);
    if (currentDate <= expireDate) {
      res.status(200).json({ subscriptions, subscribed });
    } else {
      return next(new CustomError("Date is Expired",403))
    }
  } 
  res.status(200).json({ subscriptions });
});



export const getSearch = catchAsync(async (req, res, next) => {
  const searchText = req.query.searchText;

  const results = await Course.find({
        $or: [
          { title: { $regex: searchText, $options: 'i' } }, 
          { subtitle: { $regex: searchText, $options: 'i' } },
          { tags: { $regex: searchText, $options: 'i' } },
        
        ]
      
    
  });

  if (!results.length) {
    return next(new CustomError('No Search Result', 404));
  }

  res.status(200).json(results);
});

export const getNewCourses = catchAsync(async(req,res,next)=>{
  const courses=await Course.find({status:"Approved"}).sort({timeStamp:1}).limit(6)
  console.log(courses)
  res.status(200).json(courses)
})

export const addReviews = catchAsync(async(req,res,next)=>{
  const userId = req.user.id
   const{star,review} = req.body
  let existingReview = await Review.findOne({userId})
  
  if(existingReview){
    return next(new CustomError("You already reviewed",409))
  }
    const reviews =  await Review.create({
         review,
         rating:star,
         userId:req.user.id,
         courseId:req.params.id
    
  })
  res.status(200).json(reviews)
})
