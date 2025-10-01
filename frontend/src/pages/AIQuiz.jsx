// src/pages/AIQuiz.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AIQuiz = () => {
  const [formData, setFormData] = useState({
    topic: "",
    difficulty: "medium",
    questionCount: 10,
    timeLimit: 15,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setError("");

    if (!formData.topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/quiz/generate-ai",
        {
          ...formData,
          saveQuiz: false,
        }
      );

      // Create quiz in DB
      const quizRes = await axios.post(
        "http://localhost:5000/api/quiz/create",
        {
          title: `${formData.topic} - ${formData.difficulty}`,
          questions: response.data.questions,
          timeLimit: formData.timeLimit,
        }
      );

      navigate(`/quiz/${quizRes.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Generate AI Quiz</h1>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Topic</span>
            </label>
            <input
              type="text"
              name="topic"
              placeholder="e.g., React Hooks, World War 2, Python"
              className="input input-bordered"
              value={formData.topic}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text font-semibold">Difficulty</span>
            </label>
            <select
              name="difficulty"
              className="select select-bordered"
              value={formData.difficulty}
              onChange={handleChange}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text font-semibold">
                Number of Questions
              </span>
            </label>
            <select
              name="questionCount"
              className="select select-bordered"
              value={formData.questionCount}
              onChange={handleChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text font-semibold">
                Time Limit (minutes)
              </span>
            </label>
            <input
              type="number"
              name="timeLimit"
              min="5"
              max="60"
              className="input input-bordered"
              value={formData.timeLimit}
              onChange={handleChange}
            />
          </div>

          <div className="card-actions justify-end mt-6">
            <button
              onClick={handleGenerate}
              className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Generating Quiz..." : "Generate & Start Quiz"}
            </button>
          </div>

          {loading && (
            <div className="alert alert-info mt-4">
              <span>
                Generating your quiz with AI... This may take a moment.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQuiz;
