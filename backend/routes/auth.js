// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Register
router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return next(new AppError("Please provide all required fields", 400));
    }

    if (password.length < 6) {
      return next(new AppError("Password must be at least 6 characters", 400));
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(new AppError("User already exists", 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        showStatsPublicly: user.showStatsPublicly,
      },
    });
  })
);

// Login
router.post(
  "/login",
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        showStatsPublicly: user.showStatsPublicly,
      },
    });
  })
);

module.exports = router;
