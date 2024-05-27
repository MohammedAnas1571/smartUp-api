import chatModel from '../model/chatModel.js'
import messageModel from '../model/messageModel.js'

import catchAsync from '../utils/catchAsync.js'
import { CustomError } from '../utils/customError.js'


export const userChats = catchAsync(async(req,res,next)=>{
     console.log(req.params)
    const chat = await chatModel.find({senderId:req.params.userId,recieverId:req.params.tutorId})
   
    if (!chat) {
        return next(new CustomError("No chat are Available", 404));
    }
    res.status(200).json(chat)

})
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