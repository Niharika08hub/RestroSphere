const express = require("express");

const {
  getPublicMenu,
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// PUBLIC MENU
router.get("/public", getPublicMenu);

// OWNER + MANAGER
router.get("/", protect, getMenu);

// OWNER
router.post("/", protect, addMenuItem);

// OWNER + MANAGER
router.patch("/:id", protect, updateMenuItem);

// OWNER
router.delete("/:id", protect, deleteMenuItem);

module.exports = router;