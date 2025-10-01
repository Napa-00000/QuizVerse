// src/pages/MyQuizzes.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/quiz/my-quizzes"
      );
      setQuizzes(response.data.data || []);
    } catch (error) {
      console.error("Fetch quizzes error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async (quizId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/quiz/${quizId}/toggle-public`
      );
      fetchQuizzes();
    } catch (error) {
      console.error("Toggle public error:", error);
    }
  };

  const openDeleteModal = (quizId) => {
    setQuizToDelete(quizId);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/quiz/${quizToDelete}`);
      setDeleteModal(false);
      setQuizToDelete(null);
      fetchQuizzes();
    } catch (error) {
      console.error("Delete quiz error:", error);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Quizzes</h1>
        <Link to="/create-quiz" className="btn btn-primary">
          Create New Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <p className="text-gray-500">You haven't created any quizzes yet</p>
            <Link to="/create-quiz" className="btn btn-primary mt-4">
              Create Your First Quiz
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">{quiz.title}</h3>
                <p className="text-sm text-gray-500">
                  {quiz.questions.length} questions • {quiz.timeLimit} minutes
                  {quiz.isAIGenerated && " • AI Generated"}
                </p>
                <div className="badge badge-outline mt-2">
                  {quiz.isPublic ? "Public" : "Private"}
                </div>

                <div className="card-actions justify-end mt-4">
                  <Link
                    to={`/quiz/${quiz._id}`}
                    className="btn btn-sm btn-ghost"
                  >
                    Take Quiz
                  </Link>
                  <button
                    onClick={() => handleTogglePublic(quiz._id)}
                    className="btn btn-sm btn-outline"
                  >
                    {quiz.isPublic ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => openDeleteModal(quiz._id)}
                    className="btn btn-sm btn-error"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Quiz</h3>
            <p className="py-4">
              Are you sure you want to delete this quiz? This action cannot be
              undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setQuizToDelete(null);
                }}
                className="btn"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-error">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQuizzes;
