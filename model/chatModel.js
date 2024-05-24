import mongoose from "mongoose";

const chatSchema = mongoose.Schema(
  {
    sender: {
      type:  mongoose.Schema.Types.ObjectId,
      ref:'User',
      required:true
    },
    reciever:{
      type:  mongoose.Schema.Types.ObjectId,
      ref:'Tutor',
      required:true
    },
    message: { type:String,required:true },
  },
  {
    timeStamps: true,
  }
);
const chatModel = mongoose.model("Chat", chatSchema);

export default chatModel;