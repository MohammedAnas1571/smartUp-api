import express from  'express';
import { getUser,blockUser, getTutor, addCatagory,getCatagory,adminLogin,editCatagory,deleteCatagory,getCourses,setApproval,blockInstructor,createSubscriptions,getSubscription,deleteSubscription,dashBordDetails } from '../controller/adminController.js';
import { verifyToken } from '../middleware/isAuth.js';
 const router = express.Router()
router.get("/dashboard",verifyToken,dashBordDetails)
router.get("/users",verifyToken,getUser)
router.get("/tutor",verifyToken,getTutor)
router.put("/block-user",verifyToken,blockUser)
router.put("/block-instructor",verifyToken,blockInstructor)
router.get("/catagory",verifyToken,getCatagory)
router.post("/catagory",verifyToken,addCatagory)
router.post("/login",adminLogin)
router.put("/editCatagory",verifyToken,editCatagory)
router.put("/deleteCatagory/:id",verifyToken,deleteCatagory)
router.get("/getCourses",verifyToken,getCourses)
router.put("/approval/:id/status",verifyToken,setApproval)
router.get("/subscription",verifyToken,getSubscription)
router.post("/subscription",verifyToken,createSubscriptions)
router.delete("/subscription/:id",verifyToken,deleteSubscription)



export default router
