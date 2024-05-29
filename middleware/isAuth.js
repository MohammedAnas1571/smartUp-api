import { CustomError } from "../utils/customError.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";

export const verifyToken = catchAsync(async (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return next(new CustomError("Unauthorized", 401));
  }

  try {
    const user = jwt.verify(token, process.env.TOKEN);
    req.user = user;
    next();
  } catch (err) {
    return next(new CustomError("Invalid Token", 401));
  }
});
