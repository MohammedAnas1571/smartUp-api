import mongoose from "mongoose";

const chatSchema = mongoose.Schema(
  {
    senderID: {
      type: mongoose.Schema.Types.ObjectId,

      required: true,
    },
    receiverID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  },
  {
    timestamp: { type: Date, default: Date.now },
  }
);
const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
