// src/pages/BrowseQuizzes.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BrowseQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, [search]);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quiz/public', {
        params: { search }
      });
      setQuizzes(response.data.data);
    } catch (error) {
      console.error('Fetch quizzes error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Browse Public Quizzes</h1>

      <div className="form-control mb-6">
        <input
          type="text"
          placeholder="Search quizzes..."
          className="input input-bordered"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <p className="text-gray-500">No public quizzes found</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-lg">{quiz.title}</h3>
                <p className="text-sm text-gray-500">
                  By @{quiz.createdBy?.username || 'Unknown'}
                </p>
                <p className="text-sm text-gray-500">
                  {quiz.questions.length} questions • {quiz.timeLimit} minutes
                </p>

                <div className="card-actions justify-end mt-4">
                  <Link 
                    to={`/quiz/${quiz._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Take Quiz
                  </Link>
                  <Link 
                    to={`/profile/${quiz.createdBy._id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    View Creator
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseQuizzes;