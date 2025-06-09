// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
require('dotenv').config(); // Load environment variables

console.log("MONGO_URI: ", process.env.MONGO_URI); // Add this line

// Import User model for the /api/users/profile route defined in this file
const User = require('./models/User'); // Make sure User.js is in ./models/User.js

const app = express();

// --- CORS Configuration ---
app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}));

// --- Core Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // CRITICAL: This must be here and before routes needing cookies

// --- Passport Configuration & Initialization ---
require('./config/passport-setup')(passport); // Ensure User.js is correctly required within this if needed
app.use(passport.initialize());

// --- Route Imports ---
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const progressRoutes = require('./routes/progressRoutes');
const assessmentRoutes = require('./routes/assessment');
const assessmentModulesRoutes = require('./routes/assessmentModules');
const assessmentSubmissionRoutes = require('./routes/assessmentSubmission');

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ace_your_placement', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Static Files ---
app.use(express.static('public')); // Serve login.html, index.html etc. from here

// --- API Routes ---
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/assessment', assessmentModulesRoutes);
app.use('/api/assessment', assessmentSubmissionRoutes);

// --- Protected Profile Route ---
const auth = require('./middleware/auth'); // Ensure this line exists or add it if missing
app.get('/api/users/profile', auth, async (req, res) => {
    console.log(`\n--- /api/users/profile CALLED ---`);
    console.log(`Executing /api/users/profile route handler for userId: ${req.user.userId}`); // Use req.user.userId from auth middleware
    try {
        // auth middleware attaches user info to req.user
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            console.log(`/api/users/profile: User not found with ID: ${req.user.userId}`);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(`/api/users/profile: Successfully fetched profile for user: ${user.email}`);
        res.json({ user });
    } catch (err) {
        console.error(`/api/users/profile error:`, err);
        res.status(500).json({ message: 'Server error while fetching profile', error: err.message });
    }
});

// --- Root Route Handler ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Server Listening ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\nServer running on port ${PORT}`);
    console.log(`Frontend should be accessible at http://localhost:${PORT}`);
    console.log("Current NODE_ENV:", process.env.NODE_ENV);
    // Note: process.env.JWT_SECRET should be a strong, random string and kept secret.
    console.log("Ensure your .env file has correct GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, and JWT_SECRET.\n");
});

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
