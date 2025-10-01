// src/pages/CreateQuiz.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateQuiz = () => {
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(10);
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a quiz title");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        setError(`Question ${i + 1} is empty`);
        return;
      }
      if (questions[i].options.some((opt) => !opt.trim())) {
        setError(`All options for question ${i + 1} must be filled`);
        return;
      }
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/quiz/create", {
        title,
        questions,
        timeLimit,
      });
      navigate("/my-quizzes");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Quiz Title</span>
              </label>
              <input
                type="text"
                placeholder="Enter quiz title"
                className="input input-bordered"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-semibold">
                  Time Limit (minutes)
                </span>
              </label>
              <input
                type="number"
                min="1"
                max="180"
                className="input input-bordered"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                required
              />
            </div>
          </div>
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="card bg-base-100 shadow-xl mb-4">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h3 className="card-title">Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="btn btn-sm btn-error"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Question Text</span>
                </label>
                <textarea
                  placeholder="Enter your question"
                  className="textarea textarea-bordered"
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(qIndex, "question", e.target.value)
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="form-control">
                    <label className="label">
                      <span className="label-text">
                        Option {String.fromCharCode(65 + oIndex)}
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                      className="input input-bordered"
                      value={opt}
                      onChange={(e) =>
                        updateOption(qIndex, oIndex, e.target.value)
                      }
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Correct Answer</span>
                </label>
                <select
                  className="select select-bordered"
                  value={q.correctAnswer}
                  onChange={(e) =>
                    updateQuestion(
                      qIndex,
                      "correctAnswer",
                      parseInt(e.target.value)
                    )
                  }
                >
                  <option value={0}>A</option>
                  <option value={1}>B</option>
                  <option value={2}>C</option>
                  <option value={3}>D</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={addQuestion}
            className="btn btn-outline flex-1"
          >
            Add Question
          </button>
          <button
            type="submit"
            className={`btn btn-primary flex-1 ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
