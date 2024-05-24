import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    review: { type: String, required: true },
    rating: { type: Number, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId,ref:"Course", required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const review = mongoose.model("Reviews", reviewSchema);

export default review