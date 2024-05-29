import express from "express";
import "dotenv/config";
import cors from "cors";
import connection from "./db/db.js";
import userRouter from "./Route/userRouter.js";
import tutorRoute from "./Route/tutorRoute.js";
import adminRoute from "./Route/adminRoute.js";
import Tutor from "./model/tutorModel.js";
import User from "./model/userModel.js";
import cron from "node-cron";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import chatRouter from "./Route/chatRouter.js";

import http from "http";

import jwt from "jsonwebtoken"

const app = express();
connection();


app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/public", express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", userRouter);
app.use("/tutor", tutorRoute);
app.use("/admin", adminRoute);
app.use("/chat", chatRouter);



app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Error";
  res.status(statusCode).json({
    status: "Error",
    statusCode,
    message,
  });
});
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN,
    credentials:true
  }});

  io.use((socket,next)=>{
    const cookies = {}
    const token = socket.handshake.headers.cookie?.split(";").forEach((cookie)=>{
      const [key,value] = cookie.split("=")
      cookies[key] = value
    })
    if(cookies?.access_token){
      jwt.verify(cookies.access_token,process.env.SECRET,async(err,decoded)=>{
        if (err) return next(new Error('Authentication error'));
        const user = await User.findById(decoded._id)
        socket.user = user;
         return next();

      })
      
    }else{
        if(!cookies?.refresh_token){
          return next(new Error("Forbidden"))
        }
        socket.emit("expired")
    }
    
      
    
  })
    
  io.on("connection", (socket) => {
    console.log("a user connected" )

  // socket.on('joinRoom', ({ currentUserId}) => {
  //   const room = `${currentUserId}`

  //   socket.join(room);
  //   console.log(`User joined room: ${room}`);
  // });

  // socket.on('message', async (data) => {
  //     console.log(data)
  //      const room = `${data.tutorId}_${data.userId}`
       
  //   io.to(room).emit('recive', data);
    
    
  //   const { tutorId, userId, message, senderId  } = data;
 
  //   const newChat = await chatModel.create({
  //     senderId,
  //     recieverId: senderId === tutorId ? userId : tutorId,
  //     message,

  //   });
       
  // });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
})




cron.schedule("*/30 * * * *", async () => {
  try {
    await Tutor.deleteMany({ isVerified: false });
    await User.deleteMany({ isVerified: false });
  } catch (err) {
    console.error("Error occurred:", err);
  }
});

const port = process.env.PORT;

server.listen(port, () => {
  console.log("server is connected");
});
