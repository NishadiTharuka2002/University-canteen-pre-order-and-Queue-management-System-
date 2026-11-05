import { Router } from "express";
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import Feedback from "../models/Feedback.js";
import Transaction from "../models/Transaction.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();

// GET /api/analytics
router.get("/", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const [
      orders,
      transactions,
      popular,
      feedback,
      stock,
      dailySales
    ] = await Promise.all([
      Order.find({ status: { $ne: "Cancelled" } }),
      Transaction.find({ type: "Payment", status: "Success" }),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            quantity: { $sum: "$items.quantity" }
          }
        },
        { $sort: { quantity: -1 } },
        { $limit: 5 }
      ]),
      Feedback.find().populate("menuItem", "name"),
      MenuItem.find().select("name stock available"),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            sales: { $sum: "$total" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const sales = orders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    const peakHours = {};

    orders.forEach(order => {
      const hour = new Date(order.pickupTime).getHours();
      peakHours[hour] = (peakHours[hour] || 0) + 1;
    });

    const peakTimes = Object.entries(peakHours)
      .map(([hour, count]) => ({
        hour: Number(hour),
        orders: count
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    const averageRating = feedback.length
      ? feedback.reduce((sum, item) => sum + item.rating, 0) /
        feedback.length
      : 0;

    res.json({
      totalOrders: orders.length,
      sales,
      totalPayments: transactions.reduce(
        (sum, item) => sum + item.amount,
        0
      ),
      popular,
      peakHours: peakTimes,
      dailySales,
      stock,
      feedback,
      averageRating: Number(averageRating.toFixed(1))
    });
  } catch (error) {
    next(error);
  }
});

export default router;
