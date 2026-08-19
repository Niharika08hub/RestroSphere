const express = require("express");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");

const {
  getTables,
  createTable,
  updateTableStatus,
  deleteTable,
} = require("../controllers/tableController");

const router =
  express.Router();

// =====================================
// GET TABLES
// OWNER + MANAGER
// =====================================

router.get(
  "/",
  protect,
  authorizeRoles(
    "owner",
    "manager",
    "waiter",
    "customer"
  ),
  getTables
);

// =====================================
// CREATE TABLE
// OWNER ONLY
// =====================================

router.post(
  "/",
  protect,
  authorizeRoles("owner"),
  createTable
);

// =====================================
// UPDATE TABLE STATUS
// OWNER + MANAGER
// =====================================

router.patch(
  "/:id/status",
  protect,
  authorizeRoles(
    "owner",
    "manager"
  ),
  updateTableStatus
);

// =====================================
// DELETE TABLE
// OWNER ONLY
// =====================================

router.delete(
  "/:id",
  protect,
  authorizeRoles("owner"),
  deleteTable
);

module.exports = router;