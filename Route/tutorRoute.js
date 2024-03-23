import express from  'express';
import multer from'multer'
import {signUpValidator,signvalidation,courseValidation} from "../middleware/validation.js"
import{verifyToken}from'../middleware/isAuth.js'
import { tutorSignUp,tutorSignIn,emailVerification,resetPassword, } from "../controller/tutorController.js"
import { courseUpload,getCourses } from '../controller/courseController.js';
 const router = express.Router()
const upload = multer()

 router.post("/signUp",signUpValidator,tutorSignUp)
 router.post("/signIn",signvalidation,tutorSignIn)

  router.post("/verification/",emailVerification)
  router.post("/change_Password/:id/:token",resetPassword)
  router.post("/course",verifyToken,upload.single("image"),courseValidation,courseUpload)
  router.get("/course",getCourses)

export default router
