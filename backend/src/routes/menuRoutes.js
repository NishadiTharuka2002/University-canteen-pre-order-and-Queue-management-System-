import { Router } from "express";
import MenuItem from "../models/MenuItem.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();

// Get all menu items
router.get("/", async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      filter.category = category;
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });

    res.json(items);
  } catch (error) {
    next(error);
  }
});

// Add a menu item
router.post(
  "/",
  protect,
  allowRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const item = await MenuItem.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  },
);

// Update a menu item
router.put(
  "/:id",
  protect,
  allowRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!item) {
        return res.status(404).json({
          message: "Menu item not found",
        });
      }

      res.json(item);
    } catch (error) {
      next(error);
    }
  },
);

// Delete a menu item
router.delete("/:id", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Menu item not found",
      });
    }

    res.json({ message: "Menu item deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
