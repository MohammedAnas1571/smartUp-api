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
import chatModel from "./model/chatModel.js";

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
  },
});

io.on("connection", (socket) => {
  console.log("a user connected" + socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("chat message", (msg) => {
    console.log(msg)
    const { recieverId,senderId,message} = msg
    const newChat = chatModel.create({
      sender: senderId,
      reciever: recieverId,
      message,
    });

    io.emit("recive", msg);
  });
});

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
