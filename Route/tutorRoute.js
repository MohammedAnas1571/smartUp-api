import express from  'express';
import multer from'multer'
import path from 'path'
import {signUpValidator,signvalidation,courseValidation} from "../middleware/validation.js"
import{verifyToken}from'../middleware/isAuth.js'
import { tutorSignUp,tutorSignIn,emailVerification,resetPassword,getProfile,updateProfile } from "../controller/tutorController.js"
import {  courseUpload,myCourses,addingModule ,publishCourse } from '../controller/courseController.js';
 const router = express.Router()
 const profileMulter = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public');
    },
    filename: function (req, file, cb) {
     
      cb(null, Date.now() + path.extname(file.originalname));
    }
  })
});
const s3Multer = multer();

 router.post("/signUp",signUpValidator,tutorSignUp)
 router.post("/signIn",signvalidation,tutorSignIn)
 
 router.post("/verification/",emailVerification)
 router.post("/change_Password/:id/:token",resetPassword)
 router.get("/profile",verifyToken,getProfile)
 router.put("/profile",verifyToken,profileMulter.single("image"),updateProfile)
  router.post("/course",verifyToken, s3Multer.fields([{ name: 'preview', maxCount: 1 }, { name: 'image', maxCount: 1 }]),courseUpload)
  router.post("/addModule",verifyToken,s3Multer.single("video"),addingModule)
  router.put("/publishCourse",verifyToken,publishCourse)
 
  router.get("/myCourses/",verifyToken,myCourses)

export default router
