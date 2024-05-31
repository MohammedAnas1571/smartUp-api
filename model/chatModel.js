import mongoose from "mongoose";

const chatSchema = mongoose.Schema(
  {
    senderID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    receiverID: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamp: true,
  }
);
const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
