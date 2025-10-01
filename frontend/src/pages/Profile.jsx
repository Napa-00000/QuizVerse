// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import axios from "axios";

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const [quizHistory, setQuizHistory] = useState([]);
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const [showStatsPublicly, setShowStatsPublicly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setShowStatsPublicly(user.showStatsPublicly);
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [historyRes, quizzesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/user/${user._id}/history`),
        axios.get(`http://localhost:5000/api/user/${user._id}/created-quizzes`),
      ]);
      setQuizHistory(historyRes.data.data || []);
      setCreatedQuizzes(quizzesRes.data.data || []);
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

const handleToggleVisibility = async () => {
  const newValue = !showStatsPublicly;

  try {
    const response = await axios.patch(
      "http://localhost:5000/api/user/stats-visibility",
      {
        showStatsPublicly: newValue,
      }
    );

    console.log("Toggle response:", response.data);

    // Update local state
    setShowStatsPublicly(response.data.data.showStatsPublicly);

    // Force refresh user from server
    const userResponse = await axios.get("http://localhost:5000/api/user/me");
    console.log("Refreshed user:", userResponse.data.data);
  } catch (error) {
    console.error("Toggle visibility error:", error);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <Avatar username={user?.username || ""} />
            <div className="flex-1">
              <h2 className="card-title text-2xl">{user?.username}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Member since{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="divider"></div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show my stats publicly</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={showStatsPublicly}
                onChange={handleToggleVisibility}
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">
              When enabled, other users can see your quiz history and scores
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">My Created Quizzes</h3>
            {createdQuizzes.length === 0 ? (
              <p className="text-gray-500">No quizzes created yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {createdQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="p-3 border rounded hover:bg-base-200"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold">{quiz.title}</p>
                        <p className="text-sm text-gray-500">
                          {quiz.questions.length} questions •
                          {quiz.isPublic ? " Public" : " Private"}
                        </p>
                      </div>
                      <Link to="/my-quizzes" className="btn btn-xs btn-ghost">
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Quiz History</h3>
            {quizHistory.length === 0 ? (
              <p className="text-gray-500">No quiz attempts yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {quizHistory.map((result) => (
                  <div
                    key={result._id}
                    className="p-3 border rounded hover:bg-base-200"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold">
                          {result.quizId?.isDeleted
                            ? `${result.quizId.title} (Unavailable)`
                            : result.quizId?.title || "Quiz Unavailable"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Score: {result.score}/{result.totalQuestions} •
                          {Math.floor(result.timeTaken / 60)}m{" "}
                          {result.timeTaken % 60}s
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(result.attemptedAt).toLocaleDateString()}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
