// src/pages/QuizResult.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const QuizResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [resultRes, quizRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/quiz/${id}/result`),
        axios.get(`http://localhost:5000/api/quiz/${id}`),
      ]);
      setResult(resultRes.data.data);
      setQuiz(quizRes.data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishQuiz = async () => {
    setPublishing(true);
    try {
      await axios.patch(`http://localhost:5000/api/quiz/${id}/toggle-public`);
      setPublished(true);
    } catch (error) {
      console.error("Publish quiz error:", error);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="alert alert-error max-w-2xl mx-auto">
        <span>Result not found</span>
      </div>
    );
  }

  const percentage = ((result.score / result.totalQuestions) * 100).toFixed(1);
  const minutes = Math.floor(result.timeTaken / 60);
  const seconds = result.timeTaken % 60;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <h2 className="text-3xl font-bold mb-2">Quiz Completed</h2>

          <div className="stats stats-vertical lg:stats-horizontal shadow my-6">
            <div className="stat">
              <div className="stat-title">Score</div>
              <div className="stat-value text-primary">
                {result.score}/{result.totalQuestions}
              </div>
              <div className="stat-desc">{percentage}% Correct</div>
            </div>

            <div className="stat">
              <div className="stat-title">Time Taken</div>
              <div className="stat-value text-secondary">
                {minutes}m {seconds}s
              </div>
              <div className="stat-desc">Total time spent</div>
            </div>

            <div className="stat">
              <div className="stat-title">Performance</div>
              <div className="stat-value text-accent">
                {percentage >= 80 ? "A" : percentage >= 60 ? "B" : "C"}
              </div>
              <div className="stat-desc">
                {percentage >= 80
                  ? "Excellent!"
                  : percentage >= 60
                  ? "Good Job!"
                  : "Keep Practicing!"}
              </div>
            </div>
          </div>

          <div className="card-actions justify-center gap-4 mt-4 flex-wrap">
            <Link to={`/quiz/${id}/review`} className="btn btn-primary">
              Review Answers
            </Link>

            {quiz && !quiz.isPublic && !published && (
              <button
                onClick={handlePublishQuiz}
                className={`btn btn-success ${publishing ? "loading" : ""}`}
                disabled={publishing || published}
              >
                {publishing ? "Publishing..." : "Save & Publish Quiz"}
              </button>
            )}

            {published && (
              <div className="alert alert-success">
                <span>Quiz published successfully!</span>
              </div>
            )}

            <Link to="/dashboard" className="btn btn-outline">
              Back to Dashboard
            </Link>

            <button
              onClick={() => navigate(`/quiz/${id}`)}
              className="btn btn-ghost"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
