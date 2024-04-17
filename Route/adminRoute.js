import express from  'express';
import { getUser,blockUser, getTutor, addCatagory,getCatagory } from '../controller/adminController.js';
 const router = express.Router()

router.get("/users",getUser)
router.get("/tutor",getTutor)
router.put("/block",blockUser)
router.get("/catagory",getCatagory)
router.post("/catagory",addCatagory)


export default router
