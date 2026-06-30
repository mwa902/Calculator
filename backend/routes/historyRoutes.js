import express from "express";
import mongoose from "mongoose";
import History from "../models/History.js";

const router = express.Router();

// GET /api/history — return all non-deleted records newest first
router.get("/", async (req, res) => {
  try {
    const history = await History.find({ deletedAt: null }).sort({
      createdAt: -1,
    });
    res.json(history);
  } catch (error) {
    console.error("GET /history error:", error);
    res.status(500).json({ error: "Failed to load history" });
  }
});

// POST /api/history — save a new calculation
router.post("/", async (req, res) => {
  try {
    const { expression, result, operation, valueA, valueB } = req.body;

    // validate required fields
    if (
      expression === undefined ||
      result === undefined ||
      operation === undefined ||
      valueA === undefined ||
      valueB === undefined
    ) {
      return res.status(400).json({
        error: "Missing required fields: expression, result, operation, valueA, valueB",
      });
    }

    const historyItem = new History({
      expression,
      result,
      operation,
      valueA: Number(valueA),
      valueB: Number(valueB),
    });

    await historyItem.save();
    res.status(201).json(historyItem);
  } catch (error) {
    console.error("POST /history error:", error);
    res.status(500).json({ error: "Failed to save history", detail: error.message });
  }
});

// PATCH /api/history/:id/soft-delete — mark item as deleted (not removed from DB)
router.patch("/:id/soft-delete", async (req, res) => {
  try {
    const { id } = req.params;

    // validate ObjectId format before hitting DB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid history item ID" });
    }

    const item = await History.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: "History item not found" });
    }

    res.json({ success: true, item });
  } catch (error) {
    console.error("PATCH /history/:id/soft-delete error:", error);
    res.status(500).json({ error: "Failed to soft-delete history item" });
  }
});

export default router;
