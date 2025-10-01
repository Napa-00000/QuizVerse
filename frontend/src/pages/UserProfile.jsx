// src/pages/UserProfile.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Avatar from "../components/Avatar";
import axios from "axios";

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsPrivate, setStatsPrivate] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const userRes = await axios.get(
        `http://localhost:5000/api/user/${userId}`
      );
      setUser(userRes.data.data);

      const quizzesRes = await axios.get(
        `http://localhost:5000/api/user/${userId}/created-quizzes`
      );
      setCreatedQuizzes(quizzesRes.data.data || []);

      try {
        const historyRes = await axios.get(
          `http://localhost:5000/api/user/${userId}/history`
        );
        setQuizHistory(historyRes.data.data || []);
        setStatsPrivate(false);
      } catch (err) {
        if (err.response?.status === 403) {
          setStatsPrivate(true);
        }
      }
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-error max-w-2xl mx-auto">
        <span>User not found</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <Avatar username={user.username} />
            <div>
              <h2 className="card-title text-2xl">{user.username}</h2>
              <p className="text-xs text-gray-400 mt-1">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Created Quizzes</h3>
            {createdQuizzes.length === 0 ? (
              <p className="text-gray-500">No public quizzes</p>
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
                          {quiz.questions.length} questions
                        </p>
                      </div>
                      <Link
                        to={`/quiz/${quiz._id}`}
                        className="btn btn-xs btn-primary"
                      >
                        Take Quiz
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
            {statsPrivate ? (
              <div className="alert alert-info">
                <span>This user's quiz history is private</span>
              </div>
            ) : quizHistory.length === 0 ? (
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
                          {result.quizId?.isDeleted || !result.quizId
                            ? `${result.quizId?.title || "Quiz"} (Unavailable)`
                            : result.quizId.title}
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
                      {result.quizId &&
                        !result.quizId.isDeleted &&
                        result.quizId.isPublic && (
                          <Link
                            to={`/quiz/${result.quizId._id}`}
                            className="btn btn-xs btn-ghost"
                          >
                            Take Quiz
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

export default UserProfile;
