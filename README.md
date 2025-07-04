# Personal Finance Tracker

A full-stack web application for tracking personal finances, setting budgets, and visualizing spending patterns.

## Features

- User authentication (register, login, logout)
- Expense tracking with categories
- Monthly budget management
- Visual reports and dashboards
- Responsive design for mobile and desktop

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- Chakra UI for styling
- Recharts for data visualization
- Axios for API requests

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- RESTful API architecture

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/personal-finance-tracker.git
cd personal-finance-tracker
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Set up environment variables
Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_tracker
JWT_SECRET=your_jwt_secret_key
```

4. Install frontend dependencies
```
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server
```
cd backend
npm run dev
```

2. Start the frontend development server
```
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/users` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)

### Expenses
- `GET /api/expenses` - Get all expenses for logged-in user
- `POST /api/expenses` - Create a new expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense
- `GET /api/expenses/summary` - Get expense summary by category

### Budgets
- `GET /api/budgets` - Get all budgets for logged-in user
- `POST /api/budgets` - Create a new budget
- `PUT /api/budgets/:id` - Update a budget
- `DELETE /api/budgets/:id` - Delete a budget
- `GET /api/budgets/comparison` - Get budget vs actual spending comparison

## License

This project is licensed under the MIT License 