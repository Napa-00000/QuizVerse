// src/pages/ReviewAnswers.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const ReviewAnswers = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/quiz/${id}/result`
      );
      setResult(response.data.data);
    } catch (error) {
      console.error("Fetch result error:", error);
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

  if (!result) {
    return (
      <div className="alert alert-error max-w-2xl mx-auto">
        <span>Result not found</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Review Answers</h1>
      </div>

      <div className="space-y-6">
        {result.quizId.questions.map((question, index) => {
          const answer = result.answers[index];
          const isCorrect = answer.isCorrect;

          return (
            <div key={index} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <h3 className="card-title text-lg">Question {index + 1}</h3>
                  <div
                    className={`badge ${
                      isCorrect ? "badge-success" : "badge-error"
                    }`}
                  >
                    {isCorrect ? "✓ Correct" : "✗ Wrong"}
                  </div>
                </div>

                <p className="text-base mt-2 mb-4">{question.question}</p>

                <div className="space-y-2">
                  {question.options.map((option, optIndex) => {
                    const isSelected = answer.selectedAnswer === optIndex;
                    const isCorrectAnswer = answer.correctAnswer === optIndex;

                    let className = "p-3 border-2 rounded-lg ";

                    if (isCorrectAnswer) {
                      className += "border-success bg-success bg-opacity-10";
                    } else if (isSelected && !isCorrect) {
                      className += "border-error bg-error bg-opacity-10";
                    } else {
                      className += "border-base-300";
                    }

                    return (
                      <div key={optIndex} className={className}>
                        <div className="flex items-center">
                          <span className="font-semibold mr-2">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span>{option}</span>
                          {isCorrectAnswer && (
                            <span className="ml-auto badge badge-success">
                              Correct Answer
                            </span>
                          )}
                          {isSelected && !isCorrect && (
                            <span className="ml-auto badge badge-error">
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-8 gap-4">
        <Link to={`/quiz/${id}/result`} className="btn btn-primary">
          Back to Results
        </Link>
        <Link to="/dashboard" className="btn btn-outline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ReviewAnswers;
