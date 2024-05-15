import express from "express";
import { signUpValidator, signvalidation } from "../middleware/validation.js";
import {
  userSignUp,
  userSignIn,
  otpValidation,
  emailVerification,
  resetPassword,
  signOut,
  changeProfile,
} from "../controller/userController.js";
import { profileMulter } from "../utils/multer.js";
import { passportController } from "../utils/passport.js";
import {
  getCourses,
  aboutCourse,
  purchaseCoures,
  purchaseSuccess,
  getModuleList,
  getSearch,
  getNewCourses,
  addReviews
 
} from "../controller/courseController.js";
import { cloudflare } from "../middleware/CloudFire.js";
import { verifyToken } from "../middleware/isAuth.js";
const router = express.Router();

router.post("/signUp", signUpValidator, userSignUp);
router.post("/signIn", cloudflare, signvalidation, userSignIn);
router.post("/otp", otpValidation);
router.post("/verification/", emailVerification);
router.post("/change_Password/:id/:token", resetPassword);
router.get("/logout", signOut);
router.get("/courses", getCourses);
router.get("/getDetails/:id", aboutCourse);
router.get("/search",getSearch)
router.get("/new-courses",getNewCourses)
router.post("/review/:id",verifyToken,addReviews)

router.put(
  "/profile",
  verifyToken,
  profileMulter.single("image"),
  changeProfile
);
router.post("/payment", verifyToken, purchaseCoures);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  purchaseSuccess
);
router.get("/modules/:id", verifyToken, getModuleList);

router.get(
  "/googleAuth",
  passportController.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passportController.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

export default router;
