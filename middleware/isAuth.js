import { CustomError } from "../utils/customError.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";

export const verifyToken = catchAsync(async (req, res, next) => {
    const token = req.cookies.access_token;
    console.log(token);
    
    if (!token) {
        return next(new CustomError("Token Not Found", 404));
    }

    const user = jwt.verify(token, process.env.TOKEN);
    req.user = user;
    console.log(user);
    next();
});