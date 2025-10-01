// models/QuizResult.js
const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number,
    required: true,
  },
  answers: [
    {
      questionIndex: Number,
      selectedAnswer: Number,
      correctAnswer: Number,
      isCorrect: Boolean,
    },
  ],
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
});

// Unique index to ensure one result per user per quiz
quizResultSchema.index({ userId: 1, quizId: 1 }, { unique: true });

module.exports = mongoose.model("QuizResult", quizResultSchema);
