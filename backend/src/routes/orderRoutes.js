import { Router } from "express";
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Create a pre-order
router.post("/", protect, async (req, res, next) => {
  try {
    const { items, pickupTime } = req.body;

    if (!items || items.length === 0 || !pickupTime) {
      return res.status(400).json({
        message: "Items and pickup time are required"
      });
    }

    const selectedPickupTime = new Date(pickupTime);

    if (Number.isNaN(selectedPickupTime.getTime())) {
      return res.status(400).json({
        message: "Invalid pickup time"
      });
    }

    if (selectedPickupTime <= new Date()) {
      return res.status(400).json({
        message: "Pickup time must be in the future"
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of items) {
      const menuItem = await MenuItem.findById(cartItem.menuItem);

      if (!menuItem || !menuItem.available) {
        return res.status(400).json({
          message: "A selected menu item is unavailable"
        });
      }

      const quantity = Number(cartItem.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > menuItem.stock
      ) {
        return res.status(400).json({
          message: `Invalid quantity for ${menuItem.name}`
        });
      }

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity
      });

      totalAmount += menuItem.price * quantity;
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      pickupTime: selectedPickupTime
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

// Get logged-in user's order history
router.get("/my", protect, async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Get one order belonging to logged-in user
router.get("/:id", protect, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

export default router;
