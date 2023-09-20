const express = require ("express");
const authRoutes = require ("./auth.js");
const userRoutes = require ("./user.js");
const carRoutes = require ("./car.js");
const locationRoutes = require ("./location.js");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/car", carRoutes);
router.use("/location", locationRoutes);

module.exports = router;
