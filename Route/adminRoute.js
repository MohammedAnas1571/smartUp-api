import express from  'express';
import { getUser,blockUser } from '../controller/adminController.js';
 const router = express.Router()

router.get("/users",getUser)
router.put("/update",blockUser)

export default router
