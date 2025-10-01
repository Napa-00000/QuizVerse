// routes/user.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Get current user profile
router.get(
  "/me",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.json({
      success: true,
      data: user,
    });
  })
);

// Search users - MUST BE BEFORE /:id
router.get(
  "/search",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const { query } = req.query;

    console.log("Search query:", query);

    if (!query || query.trim().length < 2) {
      return next(
        new AppError("Search query must be at least 2 characters", 400)
      );
    }

    const users = await User.find({
      username: { $regex: query.trim(), $options: "i" },
    })
      .select("username createdAt")
      .limit(10);

    console.log("Found users:", users);

    res.json({
      success: true,
      data: users,
    });
  })
);

// Get user by ID - MUST BE AFTER /search
router.get(
  "/:id",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).select("-password -email");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.json({
      success: true,
      data: user,
    });
  })
);

// Update stats visibility
router.patch(
  "/stats-visibility",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const { showStatsPublicly } = req.body;

    console.log("Toggle request:", { userId: req.userId, showStatsPublicly });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { showStatsPublicly },
      { new: true }
    ).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    console.log("Updated user:", user);

    res.json({
      success: true,
      data: user,
    });
  })
);

// Get user's quiz history
router.get(
  "/:id/history",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (userId !== req.userId && !user.showStatsPublicly) {
      return next(new AppError("This user's stats are private", 403));
    }

    const results = await QuizResult.find({ userId })
      .populate("quizId", "title isDeleted isPublic")
      .sort({ attemptedAt: -1 });

    res.json({
      success: true,
      data: results,
    });
  })
);

// Get user's created quizzes (public only for other users)
router.get(
  "/:id/created-quizzes",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const userId = req.params.id;

    const query = {
      createdBy: userId,
      isDeleted: false,
    };

    if (userId !== req.userId) {
      query.isPublic = true;
    }

    const quizzes = await Quiz.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quizzes,
    });
  })
);

module.exports = router;
