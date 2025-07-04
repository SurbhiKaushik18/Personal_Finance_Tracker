# Frontend Fixes

## Issues Fixed

1. **Chakra UI Integration**
   - Updated package.json with compatible Chakra UI versions
   - Created a custom theme file (theme.ts)
   - Properly set up ColorModeScript in index.tsx
   - Added theme to ChakraProvider in App.tsx

2. **Component Issues**
   - Created ColorModeSwitcher component for better color mode toggling
   - Fixed table components by using TableContainer
   - Updated Header component to use ColorModeSwitcher

3. **Dependencies**
   - Ensured all necessary dependencies are installed with compatible versions
   - Fixed version conflicts between React and Chakra UI

## How to Run the Application

1. **Start MongoDB**
   - Ensure MongoDB is running locally or use MongoDB Atlas

2. **Set Up Environment Variables**
   - Create a .env file in the backend directory with:
     ```
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/finance_tracker
     JWT_SECRET=your_jwt_secret_key
     ```

3. **Install Dependencies**
   - Run `npm run install-all` from the root directory

4. **Start the Application**
   - Option 1: Run `npm run dev` from the root directory
   - Option 2: Run the start.bat file
   - Option 3: Start backend and frontend separately:
     - Backend: `cd backend && npm run dev`
     - Frontend: `cd frontend && npm start`

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Features

- User authentication (register, login, logout)
- Expense tracking with categories
- Monthly budget management
- Visual reports and dashboards
- Responsive design for mobile and desktop 