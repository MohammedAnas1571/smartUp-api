import mongoose from "mongoose";

const tutorSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    about: {
      type: String,
    },
    profession: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "Tutor",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePhoto: {
      type: String,
      default: "public/userprofile.png",
    },
  },
  { timestamps: true }
);

const Tutor = mongoose.model("Tutor", tutorSchema);

export default Tutor;
