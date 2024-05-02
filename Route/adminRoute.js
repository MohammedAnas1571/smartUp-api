import express from  'express';
import { getUser,blockUser, getTutor, addCatagory,getCatagory,adminLogin,editCatagory,deleteCatagory,getCourses,setApproval } from '../controller/adminController.js';
import { verifyToken } from '../middleware/isAuth.js';
 const router = express.Router()

router.get("/users",verifyToken,getUser)
router.get("/tutor",verifyToken,getTutor)
router.put("/block",verifyToken,blockUser)
router.get("/catagory",verifyToken,getCatagory)
router.post("/catagory",verifyToken,addCatagory)
router.post("/login",verifyToken,adminLogin)
router.put("/editCatagory",verifyToken,editCatagory)
router.delete("/deleteCatagory/:id",verifyToken,deleteCatagory)
router.get("/getCourses",verifyToken,getCourses)
router.put("/approval/:id/status",verifyToken,setApproval)



export default router
