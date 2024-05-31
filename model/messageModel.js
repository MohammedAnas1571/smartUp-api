import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    senderID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    receiverID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    message: {
      type: String,
    },
  },
  {
    timeStamp: true,
  }
);
const Message = mongoose.model("Message", messageSchema);
export default Message;
