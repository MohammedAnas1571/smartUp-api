import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import jwt from "jsonwebtoken";

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
import Chat from "./model/chatModel.js";
import Message from "./model/messageModel.js";

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
    credentials: true,
  },
});

io.use((socket, next) => {
  const cookies = {};
  const cookieHeader = socket.handshake.headers.cookie;

  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const [key, value] = cookie.trim().split("=");
      cookies[key] = value;
    });
  }

  if (!cookies?.access_token) {
    return next(new Error("AuthenticationRequired"));
  }

  jwt.verify(cookies.access_token, process.env.TOKEN, async (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error"));
    }
    let user;
    if (decoded.role === "User") {
      user = await User.findById(decoded.id).select("-password");
    } else {
      user = await Tutor.findById(decoded.id).select("-password");
    }
    socket.user = user;
    return next();
  });
});

io.on("connection", (socket) => {
  console.log(
    socket.user.username + "with role: " + socket.user.role + " connected ",
    socket.user._id
  );

  socket.join(socket.user?._id.toString());

  socket.on("messages_page", async (tutorID) => {
    console.log(socket.user._id);
    const conversations = await Chat.findOne({
      $or: [
        { senderID: socket.user._id, receiverID: tutorID },
        { senderID: tutorID, receiverID: socket.user._id },
      ],
    }).populate("messages");
    console.log(JSON.stringify(conversations));
    socket.emit("messages", conversations);
  });

  socket.on("sidebar_users", async (entityID) => {
    const senders = await Chat.distinct("senderID", { receiverID: entityID });
    const receivers = await Chat.distinct("receiverID", { senderID: entityID });

    const usersID = Array.from(new Set([senders, receivers]));

    console.log(usersID);

    const users = await User.find({ _id: { $in: usersID } });

    socket.emit("users", users);
  });

  socket.on("send_message", async ({ senderID, receiverID, message }) => {
    let conversation = await Chat.findOne({
      $or: [
        { senderID, receiverID },
        { senderID: receiverID, recieverID: senderID },
      ],
    });

    if (!conversation) {
      conversation = await Chat.create({
        senderID,
        receiverID,
      });
    }

    const newMessage = await Message.create({
      senderID,
      receiverID,
      message,
    });

    await conversation.updateOne({
      $push: {
        messages: newMessage._id,
      },
    });

    io.to(senderID).emit("message", newMessage);
    io.to(receiverID).emit("message", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
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
