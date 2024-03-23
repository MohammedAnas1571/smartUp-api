
import catchAsync from "../utils/catchAsync.js";
import { CustomError } from "../utils/customError.js";
import { imageStore,imageAccess} from "../utils/s3 configure.js";
import crypto from "crypto";
import Course from '../model/courseModel.js'

   

export const courseUpload = catchAsync(async(req,res,next)=>{
const{title,subTitle,catagory,level,tags,price,description}= req.body;
const imageRandom = (byte = 32) => crypto.randomBytes(byte).toString("hex");
const imageName = imageRandom()
 await imageStore(req.file,imageName)
 const url =  await imageAccess(imageName)
    console.log(url)

    const course =  await Course.create({
      tutorId: req.user.id,
    title,
    subTitle,
    catagory,
    level,tags,price,description,
    image:url
    })
    return   res.status(201).json("courses are  uploaded")
  })

  export const  getCourses = catchAsync( async (req,res,next) => {
       const course = await Course.find()
       res.status(200).json({course})

  })