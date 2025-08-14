const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config(); // automatically looks in the same folder
const authRoutes = require('./routes/auth');
const algorithmRoutes = require('./routes/algorithms');
const userRoutes = require('./routes/users');
const Algorithm = require('./models/Algorithm');
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/recursion-explorer';
const mongoOptions = {};
if (process.env.MONGODB_DB_NAME) {
  mongoOptions.dbName = process.env.MONGODB_DB_NAME;
}

mongoose.set('strictQuery', true);
mongoose.connect(mongoUri, mongoOptions)
// mongoose.connect('mongodb://localhost:27017/recursion-explorer')
.then(async () => {
  console.log('MongoDB connected successfully');
  try {
    // Ensure Algorithm indexes are in sync; drop any legacy text indexes first
    const indexes = await Algorithm.collection.indexes();
    const textIndexesToDrop = indexes.filter(i => {
      const isText = Object.values(i.key || {}).some(v => v === 'text');
      const isNewIndex = i.name === 'algorithms_text_idx';
      return isText && !isNewIndex;
    });
    for (const idx of textIndexesToDrop) {
      await Algorithm.collection.dropIndex(idx.name);
    }
    await Algorithm.syncIndexes();
  } catch (e) {}
})
.catch(err => console.error('MongoDB connection error:', err));


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Recursion Explorer API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/algorithms', algorithmRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});