const express = require("express");

const {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
} = require("../controllers/inventoryController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// OWNER INVENTORY MANAGEMENT
// Login + owner required
// =====================================

router.get("/", protect, getInventory);

router.post("/", protect, createInventory);

router.patch("/:id", protect, updateInventory);

router.delete("/:id", protect, deleteInventory);

module.exports = router;