import express from  'express';
import { getUser,blockUser, getTutor } from '../controller/adminController.js';
 const router = express.Router()

router.get("/users",getUser)
router.get("/tutor",getTutor)
router.put("/block",blockUser)
router.put("/block-instructor")


export default router
