const express = require("express");
const router = express.Router();
const { calculateSlip, generateSlip, getSlips, getSlipById } = require("../controllers/salarySlipController");

router.post("/calculate", calculateSlip);
router.post("/", generateSlip);
router.get("/", getSlips);
router.get("/:id", getSlipById);

module.exports = router;