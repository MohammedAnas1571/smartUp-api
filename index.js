import express from "express";
import "dotenv/config";
import cors from "cors";
import connection from "./db/db.js";
import userRouter from "./Route/userRouter.js";
import tutorRoute from "./Route/tutorRoute.js";
import adminRoute from './Route/adminRoute.js'
import Tutor from "./model/tutorModel.js";
import User from "./model/userModel.js";
import cron from "node-cron";

const app = express();
connection();

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", userRouter);
app.use("/tutor", tutorRoute);
app.use("/admin",adminRoute)

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Error";
  res.status(statusCode).json({
    status: "Error",
    statusCode,
    message,
  });
});

cron.schedule("0 0 * * *", async () => {
  try {
    await Tutor.deleteMany({ isVerified: false });
    await User.deleteMany({ isVerified: false });
  } catch (err) {
    console.error("Error occurred:", err);
  }
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log("server is connected");
});
