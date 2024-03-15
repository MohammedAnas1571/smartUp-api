import express from "express"
import {userValidator,signvalidation} from "../middleware/validation.js"
import { userSignUp,userSignIn,otpValidaion,emailVerification,resetPassword } from "../controller/AuthController.js"
 const router = express.Router()

 router.post("/signUp",userValidator,userSignUp)
 router.post("/signIn",signvalidation,userSignIn)
  router.post("/otp",otpValidaion)
  router.post("/verification/",emailVerification)
  router.post("/change_Password/:id/:token",resetPassword)






 export default router