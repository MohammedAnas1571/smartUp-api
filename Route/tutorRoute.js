import express from  'express';
import multer from'multer'
import {signUpValidator,signvalidation,courseValidation} from "../middleware/validation.js"
import{verifyToken}from'../middleware/isAuth.js'
import { tutorSignUp,tutorSignIn,emailVerification,resetPassword, } from "../controller/tutorController.js"
import {  courseUpload,myCourses,addingModule } from '../controller/courseController.js';
 const router = express.Router()
const upload = multer()

 router.post("/signUp",signUpValidator,tutorSignUp)
 router.post("/signIn",signvalidation,tutorSignIn)

  router.post("/verification/",emailVerification)
  router.post("/change_Password/:id/:token",resetPassword)
  router.post("/course",verifyToken, upload.fields([{ name: 'preview', maxCount: 1 }, { name: 'image', maxCount: 1 }]),courseValidation,courseUpload)
  router.post("/addModule",verifyToken,upload.single("video"),addingModule)
 
  router.get("/myCourses/",verifyToken,myCourses)

export default router
