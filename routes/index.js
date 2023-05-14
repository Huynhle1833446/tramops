const express = require ("express");
const authRoutes = require ("./auth.js");
const userRoutes = require ("./user.js");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);

module.exports = router;
