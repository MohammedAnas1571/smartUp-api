import mongoose from "mongoose";

const chatSchema = mongoose.Schema(
  {
    senderId: {
      type:  mongoose.Schema.Types.ObjectId,
      ref:'User',
      required:true
    },
    recieverId:{
      type:  mongoose.Schema.Types.ObjectId,
      ref:'Tutor',
      required:true
    },
    message: { type:String,required:true },
  },
  {
    timestamp: { type: Date, default: Date.now },
  }
);
const chatModel = mongoose.model("Chat", chatSchema);

export default chatModel;
