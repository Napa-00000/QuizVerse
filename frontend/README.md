# QuizVerse - AI-Powered Quiz Platform

A full-stack MERN application that allows users to create, share, and take quizzes with AI-powered quiz generation.

## Features

- **User Authentication**: JWT-based secure authentication with bcrypt password hashing
- **Manual Quiz Creation**: Create custom quizzes with multiple-choice questions
- **AI Quiz Generation**: Generate quizzes on any topic using OpenAI API
- **Quiz Management**: Publish/unpublish, delete quizzes (soft delete)
- **Quiz Taking**: Real-time timer, progress tracking, instant results
- **Results & Review**: Detailed score breakdown with answer review
- **User Profiles**: Customizable privacy settings for quiz history
- **Social Features**: Browse public quizzes, search users, view profiles

## Tech Stack

**Frontend:**
- React.js
- React Router
- Axios
- DaisyUI + Tailwind CSS

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt.js
- OpenAI API (via OpenRouter)

## Installation

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openrouter_api_key
PORT=5000
NODE_ENV=development
```

Start backend:

```bash
node server.js
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Quiz
- `POST /api/quiz/create` - Create quiz
- `POST /api/quiz/generate-ai` - Generate AI quiz
- `GET /api/quiz/public` - Get all public quizzes
- `GET /api/quiz/my-quizzes` - Get user's quizzes
- `GET /api/quiz/:id` - Get single quiz
- `POST /api/quiz/:id/submit` - Submit quiz attempt
- `PATCH /api/quiz/:id/toggle-public` - Publish/unpublish
- `DELETE /api/quiz/:id` - Delete quiz

### User
- `GET /api/user/me` - Get current user
- `GET /api/user/:id` - Get user profile
- `GET /api/user/search` - Search users
- `PATCH /api/user/stats-visibility` - Update privacy

## License

MIT
