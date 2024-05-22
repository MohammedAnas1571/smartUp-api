import express from 'express'
import {  userChats } from '../controller/chatController.js'
const router = express.Router()


router.get('/:userId/:tutorId',userChats)
// router.get('/find/:firstId/:secondId',findChat)
// router.post('/message',addMessage)
// router.get("/message/:chatId",getMessages)
export default router