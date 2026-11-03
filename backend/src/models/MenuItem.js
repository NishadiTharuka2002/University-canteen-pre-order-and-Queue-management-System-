import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    available: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("MenuItem", menuItemSchema);
