// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateQuiz from "./pages/CreateQuiz";
import AIQuiz from "./pages/AIQuiz";
import TakeQuiz from "./pages/TakeQuiz";
import QuizResult from "./pages/QuizResult";
import ReviewAnswers from "./pages/ReviewAnswers";
import Profile from "./pages/Profile";
import BrowseQuizzes from "./pages/BrowseQuizzes";
import MyQuizzes from "./pages/MyQuizzes";
import UserProfile from "./pages/UserProfile";
import SearchUsers from "./pages/SearchUsers";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-base-200">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              element={
                <ProtectedRoute>
                  <Navbar />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-quiz" element={<CreateQuiz />} />
              <Route path="/ai-quiz" element={<AIQuiz />} />
              <Route path="/quiz/:id" element={<TakeQuiz />} />
              <Route path="/quiz/:id/result" element={<QuizResult />} />
              <Route path="/quiz/:id/review" element={<ReviewAnswers />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route path="/browse" element={<BrowseQuizzes />} />
              <Route path="/my-quizzes" element={<MyQuizzes />} />
              <Route path="/search-users" element={<SearchUsers />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
