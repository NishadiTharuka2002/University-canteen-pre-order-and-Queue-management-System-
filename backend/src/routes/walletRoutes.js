import { Router } from "express";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import Order from "../models/Order.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();

// Get wallet balance
router.get("/", protect, async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user.id,
        balance: 0,
      });
    }

    res.json(wallet);
  } catch (error) {
    next(error);
  }
});

// Add money to wallet (demo top-up)
router.post("/topup", protect, async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Enter a valid top-up amount",
      });
    }

    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user.id,
        balance: 0,
      });
    }

    wallet.balance += amount;
    await wallet.save();

    const transaction = await Transaction.create({
      user: req.user.id,
      type: "TopUp",
      amount,
      description: "Wallet top-up",
    });

    res.json({
      message: "Wallet topped up successfully",
      wallet,
      transaction,
    });
  } catch (error) {
    next(error);
  }
});

// Pay for an order using wallet
router.post("/pay/:orderId", protect, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        message: "This order has already been paid",
      });
    }

    const wallet = await Wallet.findOne({
      user: req.user.id,
    });

    if (!wallet || wallet.balance < order.totalAmount) {
      return res.status(400).json({
        message: "Insufficient wallet balance",
      });
    }

    wallet.balance -= order.totalAmount;
    await wallet.save();

    order.paymentStatus = "Paid";
    await order.save();

    const transaction = await Transaction.create({
      user: req.user.id,
      type: "Payment",
      amount: order.totalAmount,
      order: order._id,
      description: `Payment for order ${order._id}`,
    });

    res.json({
      message: "Payment successful",
      wallet,
      order,
      transaction,
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction history
router.get("/transactions", protect, async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
    })
      .populate("order", "totalAmount status")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

// Admin/staff: refund an order
router.post(
  "/refund/:orderId",
  protect,
  allowRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      if (order.paymentStatus !== "Paid") {
        return res.status(400).json({
          message: "Only paid orders can be refunded",
        });
      }

      let wallet = await Wallet.findOne({ user: order.user });

      if (!wallet) {
        wallet = await Wallet.create({
          user: order.user,
          balance: 0,
        });
      }

      wallet.balance += order.totalAmount;
      await wallet.save();

      order.paymentStatus = "Refunded";
      order.status = "Cancelled";
      await order.save();

      const transaction = await Transaction.create({
        user: order.user,
        type: "Refund",
        amount: order.totalAmount,
        order: order._id,
        description: `Refund for order ${order._id}`,
      });

      res.json({
        message: "Refund successful",
        wallet,
        order,
        transaction,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
