const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { customerAssistant } = require("../controllers/customerAiController");

const router = express.Router();

router.post("/customer-assistant", protect, customerAssistant);

module.exports = router;
