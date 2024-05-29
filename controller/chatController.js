import chatModel from "../model/chatModel.js";
import mongoose from "mongoose";
import User from "../model/userModel.js";

import catchAsync from "../utils/catchAsync.js";
import { CustomError } from "../utils/customError.js";

export const userChats = catchAsync(async (req, res, next) => {
  console.log(req.params);
  const chat = await chatModel.find({
    senderId: req.params.userId,
    recieverId: req.params.tutorId,
  });

  if (!chat) {
    return next(new CustomError("No chat are Available", 404));
  }
  res.status(200).json(chat);
});

export const chattedUsers = catchAsync(async (req, res, next) => {
    const { tutorId } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(tutorId)) {
      return next(CustomError("invalid Id",401))
    }
  
    
    const senders = await chatModel.distinct("senderId", { recieverId: tutorId });
    const recievers = await chatModel.distinct("recieverId", { senderId: tutorId });
  
  
    
    const userIds = Array.from(new Set([...senders, recievers]));
    console.log("User IDs:", userIds);
  
    if (userIds.length === 0) {
      return res.status(200).json([]);
    }
    const users = await User.find({ _id: { $in: userIds } }, "username profilePhoto");
    res.status(200).json(users);
  });

// export  const findChat = catchAsync(async(req,res,next)=>{
//     const chat = await chatModel.findOne({members:{$all:[req.params.firstId,req.params.secondId]}})
//     if (!chat) {
//         return next(new CustomError("No chat are Available", 404));
//     }
//     res.status(200).json(chat)
// })

// export const addMessage = catchAsync(async(req,res,next)=>{
//    const {chatId,senderId,text} = req.body

//    const message = new messageModel ({
//     chatId,senderId,text
//    })
//     const result = await message.save()
//     res.status(200).json(result)
// })

// export const getMessages = catchAsync(async(req,res,next)=>{
//     const{chatId} = req.params
//      result = await messageModel.find({chatId})
//      res.status(200).json(results)
// })
