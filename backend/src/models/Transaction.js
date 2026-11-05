import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["TopUp", "Payment", "Refund"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Transaction", transactionSchema);
