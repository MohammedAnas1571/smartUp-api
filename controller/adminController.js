import User from "../model/userModel.js";
import Tutor from"../model/tutorModel.js";
import catchAsync from "../utils/catchAsync.js";
import { CustomError } from "../utils/customError.js";

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
  const { id,change } = req.body;
   const user = await User.findByIdAndUpdate(id, { isBlocked: change });

   if (!user) {
    return next(new CustomError("User not found.", 401));
   }
   res.status(200).json("User is blocked");
});
export const blockInstructor = catchAsync(async (req, res, next) => {
  const { id,change } = req.body;
   const user = await Tutor.findByIdAndUpdate(id, { isBlocked: change });

   if (!user) {
    return next(new CustomError("User not found.", 401));
   }
   res.status(200).json("Tutor is blocked");
});
