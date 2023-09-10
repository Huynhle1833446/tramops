const express = require ("express");
const authRoutes = require ("./auth.js");
const userRoutes = require ("./user.js");
const carRoutes = require ("./car.js");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/car", carRoutes);

module.exports = router;
