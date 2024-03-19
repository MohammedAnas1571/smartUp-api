import User from "../model/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import { CustomError } from "../utils/customError.js";

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.find({});
  res.status(200).json({
    status: "success",
    user,
  });
});
export const blockUser = catchAsync(async (req, res, next) => {
  const { id } = req.body;

  const user = await User.findById(id);
  if (!user) return next(new CustomError("User not found", 404));
  await findByIdAndUpdate(id, { isBlocked: true });
  res.status(200).json("User is blocked");
});
