import { Router } from "express";
import Order from "../models/Order.js";
import { protect, allowRoles } from "../middleware/auth.js";
import { getIO } from "../socket.js";

const router = Router();

const validStatuses = [
  "Confirmed",
  "Preparing",
  "Ready",
  "Collected",
  "Cancelled"
];

// Staff: View all orders
router.get(
  "/",
  protect,
  allowRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const orders = await Order.find()
        .populate("user", "name email")
        .sort({ createdAt: 1 });

      res.json(orders);
    } catch (error) {
      next(error);
    }
  }
);

// Staff: Update order status
router.patch(
  "/:id/status",
  protect,
  allowRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const { status } = req.body;

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status"
        });
      }

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        {
          new: true,
          runValidators: true
        }
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      // Notify the student in real time
      getIO()
        .to(`order-${order._id}`)
        .emit("orderStatusUpdated", {
          orderId: order._id,
          status: order.status
        });

      res.json(order);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
