require('dotenv').config("./.env");
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');

// Debug: Verify Clerk keys are loaded
if (!process.env.CLERK_SECRET_KEY) {
  console.error('❌ CLERK_SECRET_KEY is missing from .env!');
  process.exit(1);
}
console.log('✅ Clerk Secret Key loaded');

const app = express();


// Database Connection
const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
    //   console.log('Using local/undefined MongoDB. Starting in-memory server for convenience...');
    //   const mongoServer = await MongoMemoryServer.create();
    //   uri = mongoServer.getUri();
    // }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Enhanced CORS for local development
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173',"http://127.0.0.1:4173","http://localhost:4173", `${process.env.FRONTEND_URL}`],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-action']
}));

// Clerk Express Middleware
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

// Debug endpoint
app.get('/api/test-auth', (req, res) => {
  const auth = typeof req.auth === 'function' ? req.auth() : req.auth;

  console.log('Auth logic check:', !!req.auth, auth?.userId);
  if (auth?.userId) {
    res.json({ status: 'Authenticated', userId: auth.userId });
  } else {
    res.json({ 
      status: 'Not authenticated', 
      auth: req.auth ? 'userId missing' : 'req.auth is undefined',
      hint: 'Ensure you are sending Authorization: Bearer <token> in headers'
    });
  }
});

// Routes
app.use('/api/jobs', require('./routes/jobRoutes'));

// Basic error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.get("/", (req, res) => {
  res.send("Server is working ✅");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));