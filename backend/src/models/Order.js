import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MenuItem",
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        items: {
            type: [orderItemSchema],
            required: true
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        pickupTime: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: [
                "Placed",
                "Confirmed",
                "Preparing",
                "Ready",
                "Collected",
                "Cancelled"
            ],
            default: "Placed"
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Refunded"],
            default: "Pending"
        }
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

