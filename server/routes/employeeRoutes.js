const express = require("express");

const {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// OWNER EMPLOYEE MANAGEMENT
// Login + owner required
// =====================================

router.get("/", protect, getEmployees);

router.post("/", protect, createEmployee);

router.patch("/:id", protect, updateEmployee);

router.delete("/:id", protect, deleteEmployee);

module.exports = router;