import User from "../model/userModel.js";
import Tutor from "../model/tutorModel.js";
import catchAsync from "../utils/catchAsync.js";
import { CustomError } from "../utils/customError.js";
import Catagory from "../model/catagoryModel.js";
import Admin from "../model/adminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Course from "../model/courseModel.js";
import { Subscription } from "../model/subscriptionModel.js";

export const adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);
  const admin = await Admin.findOne({ email: email });
  if (!admin) {
    return next(new CustomError("Email is Not Found", 401));
  }
  const isValid = bcrypt.compareSync(password, admin.password);

  if (!isValid) return next(new CustomError("Invalid Password!", 401));

  const token = jwt.sign({ id: admin._id }, process.env.TOKEN, {
    expiresIn: "7d",
  });
  res
    .cookie("access_token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    })
    .status(200)
    .json("created");
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.find({});
  res.status(200).json({
    status: "success",
    user,
  });
});

export const getTutor = catchAsync(async (req, res, next) => {
  const user = await Tutor.find({});
  res.status(200).json({
    status: "success",
    user,
  });
});
export const blockUser = catchAsync(async (req, res, next) => {
  const { id, change } = req.body;
  const user = await User.findByIdAndUpdate(id, { isBlocked: change });

  if (!user) {
    return next(new CustomError("User not found.", 401));
  }
  res.status(200).json("User is blocked");
});
export const blockInstructor = catchAsync(async (req, res, next) => {
  const { id, change } = req.body;
  const user = await Tutor.findByIdAndUpdate(id, { isBlocked: change });

  if (!user) {
    return next(new CustomError("User not found.", 401));
  }
  res.status(200).json("Tutor is blocked");
});

export const addCatagory = catchAsync(async (req, res, next) => {
  const { catagory } = req.body;

  const uniqueCatagory = catagory.toLowerCase();
  console.log(uniqueCatagory);
  const categoryExist = await Catagory.findOne({
    name: uniqueCatagory,
    activeStatus: true,
  });
  if (categoryExist) {
    return next(new CustomError("This Category already exists", 409));
  }
  if (!catagory) {
    return next(new CustomError("Please add catagory", 404));
  }
  await Catagory.create({
    name: uniqueCatagory,
  });
  res.status(200).json("Catagory is Created");
});
export const getCatagory = catchAsync(async (req, res, next) => {
  const catagories = await Catagory.find({ activeStatus: true });
  res.status(200).json({
    status: "success",
    catagories,
  });
});

export const editCatagory = catchAsync(async (req, res, next) => {
  const { id, catagory } = req.body;

  const uniqueCatagory = catagory.toLowerCase();
  console.log(uniqueCatagory);
  const categoryExist = await Catagory.findOne({ name: uniqueCatagory });
  if (categoryExist) {
    return next(new CustomError("This Category already exists", 409));
  }
  const updatedCategory = await Catagory.updateOne(
    { _id: id, activeStatus: true },
    { $set: { name: uniqueCatagory } }
  );

  if (!updatedCategory) {
    return next(new CustomError("Resource not found!", 404));
  }
  res.status(201).json({ updatedCategory });
});

export const deleteCatagory = catchAsync(async (req, res, next) => {
  const deletedCatagory = await Catagory.updateOne(
    { _id: req.params.id },
    { $set: { activeStatus: false } }
  );
  if (!deleteCatagory) {
    return next(new CustomError(`Cannot Delete this Catagory`, 500));
  }
  res.status(201).json("Successfully Deleted");
});
export const getCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find({ isPublish: true });
  res.status(200).json(courses);
});

export const setApproval = catchAsync(async (req, res, next) => {
  const status = req.query.changeTo;
  console.log(status, req.params.id);
  const isApproved = await Course.findByIdAndUpdate(req.params.id, {
    $set: { status: status },
  });
  if (!isApproved) {
    return next(new CustomError("Failed to update course approval ", 401));
  }
  res.status(200).json("Course Status is changed");
});

export const createSubscriptions = catchAsync(async (req, res, next) => {
  const { planname, courseLimit, price, billingPeriod, description } = req.body;
  const newPlan = new Subscription({
    planName: planname,
    courseLimit,
    billingPeriod,
    price,
    description,
  });

  await newPlan.save();

  res.status(201).json({
    status: "Successfully created",
    subscription: newPlan,
  });
});

export const  getSubscription = catchAsync(async(req,res,nex)=>{
  const subscription =  await Subscription.find()
  res.status(200).json(subscription)

})
