// routes/quiz.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const OpenAI = require("openai");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// Create manual quiz
router.post(
  "/create",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const { title, questions, timeLimit } = req.body;

    if (!title || !questions || !timeLimit) {
      return next(new AppError("Please provide all required fields", 400));
    }

    if (questions.length < 1) {
      return next(new AppError("Quiz must have at least 1 question", 400));
    }

    const quiz = new Quiz({
      title,
      createdBy: req.userId,
      questions,
      timeLimit,
      isPublic: false,
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      data: quiz,
    });
  })
);

// Generate AI quiz
router.post(
  "/generate-ai",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const { topic, difficulty, questionCount, timeLimit, saveQuiz } = req.body;

    if (!topic || !difficulty || !questionCount || !timeLimit) {
      return next(new AppError("Please provide all required fields", 400));
    }

    const prompt = `You are a quiz generator. Create ${questionCount} multiple choice questions about "${topic}" at ${difficulty} difficulty level.

    IMPORTANT RULES:
    - Questions should be factually accurate and up-to-date
    - Avoid outdated information or deprecated knowledge
    - Each question must have exactly 4 options
    - Only ONE option should be correct
    - Make incorrect options plausible but clearly wrong
    - Difficulty: ${difficulty} means questions should be ${
    difficulty === "easy"
        ? "straightforward and basic"
        : difficulty === "medium"
        ? "moderately challenging"
        : "advanced and detailed"
    }

    Return ONLY valid JSON in this exact format (no markdown, no extra text):
    [
    {
        "question": "question text here",
        "options": ["option A", "option B", "option C", "option D"],
        "correctAnswer": 0
    }
    ]

    The correctAnswer is the index (0-3) of the correct option.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    let questions;

    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      questions = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (parseError) {
      return next(
        new AppError("Failed to parse AI response. Please try again.", 500)
      );
    }

    if (saveQuiz) {
      const quiz = new Quiz({
        title: `${topic} - ${difficulty}`,
        createdBy: req.userId,
        questions,
        timeLimit,
        isPublic: false,
        isAIGenerated: true,
      });

      await quiz.save();
      return res.status(201).json({
        success: true,
        quiz,
        saved: true,
      });
    }

    res.json({
      success: true,
      questions,
      timeLimit,
      saved: false,
    });
  })
);

// Get all public quizzes
router.get(
  "/public",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const { search } = req.query;

    const query = { isPublic: true, isDeleted: false };
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const quizzes = await Quiz.find(query)
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quizzes,
    });
  })
);

// Get user's created quizzes
router.get(
  "/my-quizzes",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const quizzes = await Quiz.find({
      createdBy: req.userId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quizzes,
    });
  })
);

// Get single quiz by ID
router.get(
  "/:id",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const quiz = await Quiz.findById(req.params.id).populate(
      "createdBy",
      "username"
    );

    if (!quiz || quiz.isDeleted) {
      return next(new AppError("Quiz not found", 404));
    }

    // Check if user has access
    if (!quiz.isPublic && quiz.createdBy._id.toString() !== req.userId) {
      return next(new AppError("This quiz is private", 403));
    }

    res.json({
      success: true,
      data: quiz,
    });
  })
);

// Toggle quiz public status
router.patch(
  "/:id/toggle-public",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return next(new AppError("Quiz not found", 404));
    }

    if (quiz.createdBy.toString() !== req.userId) {
      return next(new AppError("Not authorized to modify this quiz", 403));
    }

    quiz.isPublic = !quiz.isPublic;
    await quiz.save();

    res.json({
      success: true,
      data: quiz,
    });
  })
);

// Delete quiz (soft delete)
router.delete(
  "/:id",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return next(new AppError("Quiz not found", 404));
    }

    if (quiz.createdBy.toString() !== req.userId) {
      return next(new AppError("Not authorized to delete this quiz", 403));
    }

    quiz.isDeleted = true;
    await quiz.save();

    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  })
);

// Submit quiz attempt
router.post(
  "/:id/submit",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const { answers, timeTaken } = req.body;

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz || quiz.isDeleted) {
      return next(new AppError("Quiz not found", 404));
    }

    // Calculate score
    let score = 0;
    const detailedAnswers = answers.map((answer, index) => {
      const isCorrect = answer === quiz.questions[index].correctAnswer;
      if (isCorrect) score++;

      return {
        questionIndex: index,
        selectedAnswer: answer,
        correctAnswer: quiz.questions[index].correctAnswer,
        isCorrect,
      };
    });

    // Update or create result
    const result = await QuizResult.findOneAndUpdate(
      { userId: req.userId, quizId: quiz._id },
      {
        score,
        totalQuestions: quiz.questions.length,
        timeTaken,
        answers: detailedAnswers,
        attemptedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: result,
    });
  })
);

// Get quiz result
router.get(
  "/:id/result",
  authMiddleware,
  catchAsync(async (req, res, next) => {
    const result = await QuizResult.findOne({
      userId: req.userId,
      quizId: req.params.id,
    }).populate("quizId", "title questions");

    if (!result) {
      return next(new AppError("No result found for this quiz", 404));
    }

    res.json({
      success: true,
      data: result,
    });
  })
);

module.exports = router;
