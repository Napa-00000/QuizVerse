// src/pages/Dashboard.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const { user } = useAuth();
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quizzesRes, historyRes] = await Promise.all([
        axios.get("http://localhost:5000/api/quiz/my-quizzes"),
        axios.get(`http://localhost:5000/api/user/${user._id}/history`),
      ]);
      setMyQuizzes(quizzesRes.data.data?.slice(0, 5) || []);
      setQuizHistory(historyRes.data.data?.slice(0, 5) || []);
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Welcome back, {user?.username}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/create-quiz"
          className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
        >
          <div className="card-body">
            <h2 className="card-title text-xl">Create Your Own Quiz</h2>
            <p>Build a custom quiz with your own questions</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Create Quiz</button>
            </div>
          </div>
        </Link>

        <Link
          to="/ai-quiz"
          className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
        >
          <div className="card-body">
            <h2 className="card-title text-xl">AI Practice Quiz</h2>
            <p>Generate quizzes on any topic with AI</p>
            <div className="card-actions justify-end">
              <button className="btn btn-secondary">Generate Quiz</button>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">My Created Quizzes</h2>
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : myQuizzes.length === 0 ? (
              <p className="text-gray-500">
                You haven't created any quizzes yet
              </p>
            ) : (
              <div className="space-y-2">
                {myQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="p-3 border rounded hover:bg-base-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{quiz.title}</p>
                        <p className="text-sm text-gray-500">
                          {quiz.questions.length} questions •{" "}
                          {quiz.isPublic ? "Public" : "Private"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="card-actions justify-end mt-4">
              <Link to="/my-quizzes" className="btn btn-sm btn-ghost">
                View All
              </Link>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Recent Quiz History</h2>
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : quizHistory.length === 0 ? (
              <p className="text-gray-500">You haven't taken any quizzes yet</p>
            ) : (
              <div className="space-y-2">
                {quizHistory.map((result) => (
                  <div
                    key={result._id}
                    className="p-3 border rounded hover:bg-base-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {result.quizId?.title || "Quiz Unavailable"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Score: {result.score}/{result.totalQuestions} •{" "}
                          {Math.floor(result.timeTaken / 60)}m{" "}
                          {result.timeTaken % 60}s
                        </p>
                      </div>
                      {result.quizId && !result.quizId.isDeleted && (
                        <Link
                          to={`/quiz/${result.quizId._id}/review`}
                          className="btn btn-xs btn-ghost"
                        >
                          Review
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="card-actions justify-end mt-4">
              <Link to="/profile" className="btn btn-sm btn-ghost">
                View All History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
