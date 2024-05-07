import mongoose from "mongoose";

const subscribedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  subscriptionId: {
    type: mongoose.Types.ObjectId,
    ref: "Subscription",
    required: true,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
  expireAt: { type: Date, required: true },
});

const subscribedModel = mongoose.model("Subscribed", subscribedSchema);

export { subscribedModel as Subscribed };
