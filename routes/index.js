const express = require ("express");
const authRoutes = require ("./auth.js");
const userRoutes = require ("./user.js");
const carRoutes = require ("./car.js");
const locationRoutes = require ("./location.js");
const stageRoutes = require ("./stage.js");
const tripRoutes = require ("./trip.js");
const ticketRoutes = require ("./ticket.js");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/car", carRoutes);
router.use("/location", locationRoutes);
router.use("/stage", stageRoutes);
router.use("/trip", tripRoutes);
router.use("/ticket", ticketRoutes);

module.exports = router;
