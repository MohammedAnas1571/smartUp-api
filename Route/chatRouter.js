import express from 'express'
import {  userChats,chattedUsers} from '../controller/chatController.js'
const router = express.Router()


router.get('/getChat/:userId/:tutorId',userChats)
router.get('/getUsers/:tutorId',chattedUsers)
// router.post('/message',addMessage)
// router.get("/message/:chatId",getMessages)
export default router