import express from  'express';
import {signUpValidator,signvalidation} from "../middleware/validation.js"
import { tutorSignUp,tutorSignIn,emailVerification,resetPassword } from "../controller/tutorController.js"
 const router = express.Router()

 router.post("/signUp",signUpValidator,tutorSignUp)
 router.post("/signIn",signvalidation,tutorSignIn)

  router.post("/verification/",emailVerification)
  router.post("/change_Password/:id/:token",resetPassword)

export default router
