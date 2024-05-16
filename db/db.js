import mongoose from "mongoose";

const connection = async () => {
  try {
    const db = process.env.MONGO; 
    await mongoose.connect(db);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    throw error;
  }
};

mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err));

export default connection;
