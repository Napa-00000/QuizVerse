// src/pages/TakeQuiz.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz) {
      handleSubmit();
    }
  }, [timeLeft]);

    const fetchQuiz = async () => {
    try {
        const response = await axios.get(`http://localhost:5000/api/quiz/${id}`);
        const quizData = response.data.data;
        setQuiz(quizData);
        setTimeLeft(quizData.timeLimit * 60);
        setAnswers(new Array(quizData.questions.length).fill(-1));
    } catch (err) {
        setError(err.response?.data?.message || "Failed to load quiz");
    } finally {
        setLoading(false);
    }
    };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/quiz/${id}/submit`,
        {
          answers,
          timeTaken,
        }
      );
      navigate(`/quiz/${id}/result`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit quiz");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error max-w-2xl mx-auto">
        <span>{error}</span>
      </div>
    );
  }

  if (!quiz) return null;

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">{quiz.title}</h2>
            <div className="badge badge-lg badge-primary">
              ⏱️ {formatTime(timeLeft)}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm mb-2">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </div>
            <progress
              className="progress progress-primary w-full"
              value={progress}
              max="100"
            ></progress>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">{question.question}</h3>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[currentQuestion] === index
                      ? "border-primary bg-primary bg-opacity-10"
                      : "border-base-300 hover:border-primary hover:bg-base-200"
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="answer"
                      className="radio radio-primary mr-3"
                      checked={answers[currentQuestion] === index}
                      onChange={() => handleAnswerSelect(index)}
                    />
                    <span className="font-semibold mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span>{option}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="btn btn-outline"
            >
              Previous
            </button>

            {currentQuestion === quiz.questions.length - 1 ? (
              <button onClick={handleSubmit} className="btn btn-primary">
                Submit Quiz
              </button>
            ) : (
              <button onClick={handleNext} className="btn btn-primary">
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
