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
import Purchase from "../model/PurchaseModel.js";

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
  console.log(req.query.page);
  const page = parseInt(req.query.page) || 1;
  const pageSize = 2;
  const skip = (page - 1) * pageSize;

  const user = await User.find({}).skip(skip).limit(pageSize).exec();
  const totalCount = await User.countDocuments({});
  const pageCount = Math.ceil(totalCount / pageSize);
  res.status(200).json({
    pageCount,
    user,
  });
});

export const getTutor = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 2;
  const skip = (page - 1) * pageSize;

  const user = await Tutor.find({}).skip(skip).limit(pageSize).exec();
  const totalCount = await Tutor.countDocuments();
  const pageCount = Math.ceil(totalCount / pageSize);
  res.status(200).json({
    pageCount,
    user,
  });
});
export const blockUser = catchAsync(async (req, res, next) => {
  const { id, isBlocked } = req.body;

  const newIsBlocked = !isBlocked;

  const user = await User.findByIdAndUpdate(id, {
    $set: { isBlocked: newIsBlocked },
  });

  if (!user) {
    return next(new CustomError("User not found.", 401));
  }

  res.status(200).json();
});
export const blockInstructor = catchAsync(async (req, res, next) => {
  const { id, isBlocked } = req.body;

  const newIsBlocked = !isBlocked;
  const user = await Tutor.findByIdAndUpdate(id, { isBlocked: newIsBlocked });

  if (!user) {
    return next(new CustomError("User not found.", 401));
  }
  res.status(200).json("Tutor is blocked");
});

export const addCatagory = catchAsync(async (req, res, next) => {
  const { catagory } = req.body;

  const uniqueCatagory = catagory.toLowerCase();

  const categoryExist = await Catagory.findOne({
    name: uniqueCatagory,
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
  const page = parseInt(req.query.page) || 1;
  const pageSize = 4;
  const skip = (page - 1) * pageSize;
  const catagories = await Catagory.find({}).skip(skip).limit(pageSize).exec();
  const totalCount = await Catagory.countDocuments({});

  const pageCount = Math.ceil(totalCount / pageSize);
  res.status(200).json({
    pageCount,
    catagories,
  });
});

export const editCatagory = catchAsync(async (req, res, next) => {
  const { id, catagory } = req.body;
  const uniqueCatagory = catagory.toLowerCase();

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

  res.status(201).json("Updated Successfully");
});

export const deleteCatagory = catchAsync(async (req, res, next) => {
  const { activeStatus } = req.body;
  const newStatus = !activeStatus;
  const deletedCatagory = await Catagory.updateOne(
    { _id: req.params.id },
    { $set: { activeStatus: newStatus } }
  );
  if (!deletedCatagory) {
    return next(new CustomError(`Cannot Delete this Catagory`, 500));
  }

  res.status(201).json("catagory deleted successfully");
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
  const { planname, price, billingPeriod, description } = req.body;
  const newPlan = new Subscription({
    planName: planname,

    billingPeriod,
    price,
    description,
  });

  await newPlan.save();
  const subscription = await Subscription.find({});
  res.status(201).json({
    status: "Successfully created",
    subscription,
  });
});

export const getSubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.find();
  res.status(200).json(subscription);
});
export const deleteSubscription = catchAsync(async (req, res, next) => {
  await Subscription.findByIdAndDelete(req.params.id);
  const subscription = await Subscription.find({});
  res.status(200).json(subscription);
});

const dailyIncome = catchAsync(async (req, res, next) => {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();

  const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;

  const startDate = new Date(`${formattedDate}T00:00:00.000+00:00`);
  const endOfDay = new Date(`${formattedDate}T23:59:59.999+00:00`);

  const pipeline = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endOfDay,
        },
      },
    },
    {
      $group: {
        _id: null,
        dailyRevenue: { $sum: "$price" },
      },
    },
    {
      $project: {
        _id: 0,
        dailyRevenue: 1,
      },
    },
  ];

  let result = await Purchase.aggregate(pipeline);

  return result;
});

const monthlyRevenue = catchAsync(async (req, res, next) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const formatedDate = `${year}-${month.toString().padStart(2, "0")}`;

  const startDate = new Date(`${formatedDate}-T00:00:00.000+00:00`);
  const endDate = new Date(year, month, 0, 23, 59, 59.999);

  const pipeline = [
    {
      $match: {
        createdAt: {
        $gte: startDate,
        $lte: endDate,
      }},
    },
     { $group: {
        _id: null,
        monthlyRevenue: { $sum: "$price" }},
      },
      {
        $project: { _id: 0, monthlyRevenue: 1 },

      }
    
  ];

  const result = await Purchase.aggregate(pipeline);
  return result;
});

const yearlyIncome = catchAsync(async (req, res, next) => {
  const currentDate = new Date();

  const year = currentDate.getFullYear();

  const startDate = new Date(`${year}-01-01T00:00:00`);
  const endOfYear = new Date(`${year}-12-31T23:59:59.999`);

  const pipeline = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endOfYear,
        },
      },
    },
    {
      $group: {
        _id: null,
        yearlyIncome: { $sum: "$price" },
      },
    },
    {
      $project: {
        _id: 0,
        yearlyIncome: 1,
      },
    },

  ];

  const result = await Purchase.aggregate(pipeline);

  return result;
});
const everyMonthReport = catchAsync(async (req, res, next) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();

  const startDate = new Date(`${year}-01-01T00:00:00`);
  const endOfYear = new Date(`${year}-12-31T23:59:59.999`);
  
  const months = [
    { month: 1, name: "January" },
    { month: 2, name: "February" },
    { month: 3, name: "March" },
    { month: 4, name: "April" },
    { month: 5, name: "May" },
    { month: 6, name: "June" },
    { month: 7, name: "July" },
    { month: 8, name: "August" },
    { month: 9, name: "September" },
    { month: 10, name: "October" },
    { month: 11, name: "November" },
    { month: 12, name: "December" },
  ];

  const pipeline = [
    {
      $match: {
        createdAt: {
          $gt: startDate,
          $lte: endOfYear,
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        monthlyIncome: { $sum: "$price" },
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id",
        monthlyIncome: 1,
      },
    },
  ];

  const result = await Purchase.aggregate(pipeline);

  const finalResult = months.map(({ month, name }) => {
    const found = result.find(r => r.month === month);
    return {
      month: name,
      monthlyIncome: found ? found.monthlyIncome : 0,
    };
  });

  return  finalResult
});



const findBestSellingProducts = catchAsync(async (req, res, next) => {
  const pipeline = [
  
    {
      $group: {
        _id: "$courseId",
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "Courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $unwind: "$course",
    },
    {
      $project: {
        id: 0,
        courseName: "$course.title",
        count: 1,
      },
    },
    {
      $sort: { count: -1 },
    },
    { $limit: 3 },
  ];

  const result = await Purchase.aggregate(pipeline);

  return result;
});

const lifeTimeIncome = catchAsync(async(req,res,next)=>{
  const pipeline = [
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$price" },
    }
  },
  {
    $project: {
      _id: 0,
      totalAmount: 1
  }
}
]

const result = await Purchase.aggregate(pipeline);

return result;


})


export const dashBordDetails = catchAsync(async(req,res,next)=>{
  const daily = await dailyIncome()
  const monthly = await monthlyRevenue()
  const yearly = await yearlyIncome()
  const lifeTime = await lifeTimeIncome()
  const monthReport = await everyMonthReport()
  console.log(monthReport)

    res.status(200).json({
      daily,
      monthly,
      yearly,
      lifeTime,
      monthReport,
      // sellingProduct
    });
  });

