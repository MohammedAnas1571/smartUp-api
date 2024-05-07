import express from "express";
import { profileMulter, s3Multer } from "../utils/multer.js";
import {
  signUpValidator,
  signvalidation,
  courseValidation,
} from "../middleware/validation.js";
import { verifyToken } from "../middleware/isAuth.js";
import {
  tutorSignUp,
  tutorSignIn,
  emailVerification,
  resetPassword,
  updateProfile,
  changeEmail,
  otpVerification,
  peymentForSubscription,
} from "../controller/tutorController.js";
import {
  courseUpload,
  myCourses,
  addingModule,
  publishCourse,
  getCatagory,deleteChapter,
  subscriptionPlan
} from "../controller/courseController.js";
const router = express.Router();

router.post("/signUp", signUpValidator, tutorSignUp);
router.post("/signIn", signvalidation, tutorSignIn);

router.post("/verification/", emailVerification);
router.post("/change_Password/:id/:token", resetPassword);

router.put(
  "/profile",
  verifyToken,
  profileMulter.single("image"),
  updateProfile
);
router.post(
  "/course",
  verifyToken,
  s3Multer.fields([
    { name: "preview", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  courseUpload
);
router.post("/addModule", verifyToken, s3Multer.single("video"), addingModule);
router.put("/publishCourse", verifyToken, publishCourse);
router.get("/catagory",verifyToken,getCatagory)

router.get("/myCourses", verifyToken, myCourses);
router.post("/change-email", verifyToken, changeEmail);
router.post("/verifyotp", verifyToken, otpVerification);
router.delete("/deleteChapter/:id",verifyToken,deleteChapter)
router.get("/subscription",verifyToken,subscriptionPlan)
router.post("/payment",verifyToken,peymentForSubscription)


export default router;
