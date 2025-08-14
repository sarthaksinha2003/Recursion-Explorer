# Recursion Explorer 🌳

A modern, interactive web application that helps users visualize the step-by-step execution of recursion, backtracking, and memoization algorithms. Users can explore built-in algorithm examples or write their own code in the integrated Monaco editor and see the execution tree, stack trace, and variable changes in real-time.

## ✨ Features

### 🎯 Two Modes
- **Guest Mode**: No login required, explore built-in problems, use playground (session resets on page refresh)
- **User Mode**: Login/signup with email & password, create/save custom algorithms, bookmark favorites, access saved work from any device

### 💻 Code Editor
- **Monaco Editor**: Same as VS Code with syntax highlighting, auto-indentation, and bracket matching
- **Multi-language Support**: JavaScript (executable) and Java (display only)
- **Real-time Error Display**: Syntax and runtime error panel

### 🎨 Visualization Panel
- **Enhanced Execution Tree**: D3.js-powered tree diagram with expand/collapse nodes
- **Color Coding**: Active calls (blue), completed calls (green), pruned paths (red)
- **Call Stack View**: Real-time function stack visualization
- **Variable Tracker**: Panel showing variable values at each step
- **Step Controls**: Play, Pause, Next Step, Previous Step, Restart

### 📚 Problem Library
Built-in algorithm examples categorized by:
- **Recursion Basics**: Factorial, Fibonacci
- **Backtracking**: N-Queens, Sudoku Solver, Rat in a Maze, Subsets
- **Memoization**: DP Fibonacci, Knapsack with Memoization

### 💾 Save & Share
- **For Logged Users**: Save custom problems and visualizations
- **Share Functionality**: Generate public links to visualizations (read-only mode)
- **Export Options**: Save execution trees as PNG/SVG

### ⚙️ Settings & Personalization
- **Execution Speed**: Adjustable from 0.25x to 8x speed
- **View Modes**: Toggle between tree view and stack-focused view
- **Theme Support**: Light/Dark/System theme toggle
- **Auto-play**: Configurable automatic visualization start

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Code Editor**: Monaco Editor
- **Visualizations**: D3.js for tree rendering, Chart.js for analytics
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Storage**: LocalStorage for guest mode

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Joi and express-validator

### Deployment
- **Frontend**: Vercel / Netlify ready
- **Backend**: Render / Railway / Heroku compatible
- **Database**: MongoDB Atlas (free tier)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)

### Frontend Setup
```bash
# Clone the repository
git clone <repository-url>
cd recursion-explorer

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your environment variables
VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Add your environment variables (see Configuration section)

# Start development server
npm run dev
```

## ⚙️ Configuration

### Backend Environment Variables
```env
# Database
MONGODB_URI=your-url

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables
```env
# API Base URL
VITE_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
recursion-explorer/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── visualizer/         # Visualization components
│   │   └── seo/                # SEO components
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilities and configurations
│   ├── pages/                  # Page components
│   └── main.tsx               # App entry point
├── backend/                     # Backend source code
│   ├── models/                 # MongoDB models
│   ├── routes/                 # Express routes
│   ├── middleware/             # Express middleware
│   └── server.js              # Server entry point
├── public/                     # Static assets
└── package.json               # Frontend dependencies
```

## 🎯 User Flow Example

1. **Guest enters site** → sees welcome screen → chooses Guest Mode or Login
2. **In Guest Mode** → picks a problem → sees description + "Visualize" button
3. **Code editor loads** → clicks run → visualization appears
4. **If they try to save** → prompt to create an account
5. **In User Mode** → can create their own problem, save, and share

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Build the project
npm run build

# Deploy to Vercel
npx vercel --prod
```

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables in Render dashboard

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get connection string and add to backend environment variables
4. Whitelist your deployment IP addresses

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/settings` - Update user settings
- `POST /api/auth/bookmark/:exampleId` - Toggle bookmark

### Algorithms
- `GET /api/algorithms` - Get algorithms (with pagination)
- `GET /api/algorithms/:id` - Get single algorithm
- `POST /api/algorithms` - Create new algorithm
- `PUT /api/algorithms/:id` - Update algorithm
- `DELETE /api/algorithms/:id` - Delete algorithm
- `POST /api/algorithms/:id/like` - Toggle like

### Users
- `GET /api/users/profile` - Get user profile with stats
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard` - Get dashboard data
- `DELETE /api/users/account` - Delete user account

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Monaco Editor for the excellent code editing experience
- D3.js for powerful data visualization capabilities
- shadcn/ui for beautiful and accessible UI components
- The open-source community for inspiration and tools

## 📞 Support

If you have any questions or need help with deployment, please open an issue on GitHub.

---

**Happy Coding!** 🚀