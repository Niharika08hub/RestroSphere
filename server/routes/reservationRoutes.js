const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
  getReservations,
  getCustomerReservations,
  createReservation,
  updateReservationStatus,
  deleteReservation,
} = require("../controllers/reservationController");
const router = express.Router();
// Customer's own reservations
router.get(
  "/customer",
  protect,
  getCustomerReservations
);

// Get all reservations
router.get("/", protect, getReservations);

// Create reservation
router.post("/", protect, createReservation);

// Update reservation status
router.patch("/:id/status", protect, updateReservationStatus);

// Delete reservation
router.delete("/:id", protect, deleteReservation);

module.exports = router;