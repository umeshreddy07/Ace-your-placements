const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { generateOtp, storeOtp, verifyOtp } = require('../utils/otpStore');
const { sendOtpEmail } = require('../utils/emailService');
const { sendOtpSms } = require('../utils/smsService');
const validator = require('validator');
const jwt = require('jsonwebtoken');

// Define module totals and percentage increases as constants
const MODULE_TOTALS = {
  aptitude: 12, // Sync with frontend count on aptitude.html
  coding: 36, // 5+5+5+10+11 = 36 total coding checkboxes
  technical: 8, // 8 total technical category checkboxes
  hr_interview: 21,
};

// Define fixed percentage increases for each category
const PERCENTAGE_INCREASES = {
  aptitude: 100 / 12, // ~8.33%
  coding: 100 / 36,   // ~2.78%
  technical: 100 / 8, // 12.5%
  hr_interview: 100 / 21, // ~4.76% -- Let's use a fixed 5% as you had
};

// Define categories to remove
const CATEGORIES_TO_REMOVE = ['roadmap', 'logical_reasoning', 'verbal_ability'];

router.post('/register', async (req, res) => {
    const { name, username, email, password } = req.body;

    try {
        // --- Backend Validation ---
        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        // --- End Validation ---

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        let userByUsername = await User.findOne({ username });
        if (userByUsername) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        // Hash the password explicitly before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            username,
            email,
            password: hashedPassword, // Use the hashed password
        });

        await user.save();

        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ token, user: userResponse, message: 'User registered successfully' });

    } catch (err) {
        console.error('Registration error:', err.message);
        if (err.code === 11000) {
            if (err.keyPattern && err.keyPattern.email) {
                return res.status(400).json({ message: 'User already exists with this email.' });
            }
            if (err.keyPattern && err.keyPattern.username) {
                 return res.status(400).json({ message: 'Username is already taken.' });
            }
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('[Backend Login] Received login attempt for email:', email);
        console.log('[Backend Login] Received password length:', password ? password.length : 'null/undefined');
        // TEMPORARILY REMOVED: console.log('[Backend Login] Received password string:', password); // <--- TEMPORARY: LOGGING RAW PASSWORD FOR DEBUG
        // --- Backend Validation ---
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        // --- End Validation ---

        let user = await User.findOne({ email });
        if (!user) {
            console.log('[Backend Login] User not found for email:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('[Backend Login] User found. Comparing provided password with stored hash.');
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('[Backend Login] Password comparison failed for email:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('[Backend Login] Password comparison successful for email:', email);
        user.lastLoginAt = new Date();
        const today = new Date().toISOString().split('T')[0];
        const currentActivity = user.loginActivity.get(today) || 0;
        user.loginActivity.set(today, currentActivity + 1);
        await user.save();

        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({ token, user: userResponse, message: 'Login successful' });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'An error occurred during login' });
    }
});

router.get('/profile', auth, userController.getProfile);

// @route   PUT /api/users/profile/leetcode
// @desc    Update current user's LeetCode username
// @access  Private
router.put('/profile/leetcode', auth, async (req, res) => {
    const { leetcodeUsername } = req.body;
    const userId = req.user.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Received request to update LeetCode username:', leetcodeUsername, 'for user:', userId);
        user.leetcodeUsername = leetcodeUsername ? leetcodeUsername.trim() : null;
        await user.save();

        console.log(`LeetCode username updated for user ${userId} to: ${user.leetcodeUsername}`);
        res.json({
            message: 'LeetCode username updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                leetcodeUsername: user.leetcodeUsername
            }
        });
    } catch (err) {
        console.error('Error updating LeetCode username:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Helper to categorize subtopics
function categorizeSubtopic(subtopicId) {
    if (!subtopicId) return null;
    if (subtopicId.startsWith('hr_')) return 'hr_interview';
    if (subtopicId.startsWith('technical_')) return 'technical';
    if (subtopicId.startsWith('coding_')) return 'coding';
    if (subtopicId.startsWith('aptitude_')) return 'aptitude';
    return null;
}

// GET /api/users/me/progress
router.get('/me/progress', auth, async (req, res) => {
    try {
        // .lean() gets a plain, fast JavaScript object. 
        const user = await User.findById(req.user.userId).lean(); 
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // This route now ONLY reads and returns what is in the DB. It NEVER saves.
        res.json({
            completedSubjects: user.completedSubjects || {},
            progress: user.progress || {}
        });

    } catch (err) {
        console.error('[Backend] Error in GET /me/progress:', err.stack);
        res.status(500).json({ message: 'Server error fetching progress' });
    }
});

// POST /api/users/me/progress
router.post('/me/progress', auth, async (req, res) => {
  console.log(`\n[Backend] POST /me/progress`);
  try {
    const { subtopicId, completed } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!subtopicId || typeof completed !== 'boolean') return res.status(400).json({ message: 'Invalid request' });

    const category = categorizeSubtopic(subtopicId);
    if (!category) return res.status(400).json({ message: 'Invalid subtopic category' });

    // --- 1. Update the Completed Subjects List ---
    if (!user.completedSubjects) user.completedSubjects = new Map();
    let completedInCategory = user.completedSubjects.get(category) || [];

    if (completed) {
      if (!completedInCategory.includes(subtopicId)) {
        completedInCategory.push(subtopicId);
      }
    } else {
      completedInCategory = completedInCategory.filter(id => id !== subtopicId);
    }
    
    user.completedSubjects.set(category, completedInCategory);
    user.markModified('completedSubjects');

    // --- 2. Recalculate ALL Progress Values From Scratch ---
    if (!user.progress) user.progress = new Map();
    let totalOverallProgress = 0;
    const allModuleKeys = ['aptitude', 'coding', 'technical', 'hr_interview'];

    allModuleKeys.forEach(moduleName => {
        const currentCompletedArray = user.completedSubjects.get(moduleName) || [];
        const completedCount = currentCompletedArray.length;
        let percentage = 0;

        // Use the centralized calculation logic
        if (completedCount > 0) {
            // Using your desired fixed percentages
            if (moduleName === 'coding') percentage = completedCount * 2.78;
            else if (moduleName === 'technical') percentage = completedCount * 12.5;
            else if (moduleName === 'hr_interview') percentage = completedCount * 5;
            else if (moduleName === 'aptitude') percentage = completedCount * (100 / 12);
        }
        
        const finalPercentage = Math.min(100, Math.round(percentage));
        user.progress.set(moduleName, finalPercentage);
        totalOverallProgress += finalPercentage;
    });

    const overallPercentage = Math.round(totalOverallProgress / allModuleKeys.length);
    user.progress.set('overall', overallPercentage);
    user.markModified('progress');

    // --- 3. Save Everything to DB ---
    await user.save();
    console.log(`[Backend] DB SAVE SUCCESS. New Progress:`, Object.fromEntries(user.progress));

    // --- 4. Respond with the new, correct state ---
    res.json({
      message: `Progress for ${subtopicId} updated successfully.`,
      completedSubjects: Object.fromEntries(user.completedSubjects),
      progress: Object.fromEntries(user.progress)
    });

  } catch (err) {
    console.error('[Backend] CRITICAL ERROR in POST /me/progress:', err.stack);
    res.status(500).json({ message: 'Server error updating progress' });
  }
});

// POST /api/users/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email not found.' });
        }
        const otp = generateOtp();
        storeOtp(email, otp);
        await sendOtpEmail(email, otp);
        res.status(200).json({ message: 'OTP sent to your email address.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// POST /api/users/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }
        if (!verifyOtp(email, otp)) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/users/send-phone-otp
router.post('/send-phone-otp', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ message: 'Phone number is required.' });
        }
        const otp = generateOtp();
        storeOtp(phoneNumber, otp);
        await sendOtpSms(phoneNumber, otp);
        res.status(200).json({ message: 'OTP sent to your phone number.' });
    } catch (error) {
        console.error('Send phone OTP error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// POST /api/users/login-with-phone-otp
router.post('/login-with-phone-otp', async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        if (!phoneNumber || !otp) {
            return res.status(400).json({ message: 'Phone number and OTP are required.' });
        }
        if (!verifyOtp(phoneNumber, otp)) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
        let user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({ message: 'User with this phone number not found. Please sign up or use email login.' });
        }
        const token = generateToken(user._id);
        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email, phoneNumber: user.phoneNumber }
        });
    } catch (error) {
        console.error('Login with phone OTP error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/users/logout
// @desc    Logout user by clearing cookie
// @access  Public (client can request logout)
router.post('/logout', (req, res) => {
    console.log('[Backend Logout] Received logout request.');
    // Clear the JWT token cookie (httpOnly)
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        expires: new Date(0) // Explicitly set expiry to past
    });
    // Clear the frontend accessible token cookie
    res.clearCookie('frontendToken', {
        httpOnly: false, // This was set as false to be accessible by frontend JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        expires: new Date(0) // Explicitly set expiry to past
    });
    console.log('[Backend Logout] JWT and frontendToken cookies cleared.');
    res.status(200).json({ message: 'Logged out successfully' });
});

// @route   POST /api/users/activity/log
// @desc    Log user activity for a specific date
// @access  Private
router.post('/activity/log', auth, async (req, res) => {
    try {
        const { dateKey } = req.body;
        const userId = req.user.userId;

        if (!dateKey) {
            return res.status(400).json({ message: 'Date is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize loginActivity if it doesn't exist
        if (!user.loginActivity || !(user.loginActivity instanceof Map)) {
            user.loginActivity = new Map();
        }

        // Increment activity count for the given date
        const currentActivity = user.loginActivity.get(dateKey) || 0;
        user.loginActivity.set(dateKey, currentActivity + 1);
        
        // Save the user document
        await user.save();

        // Convert Map to object for response
        const loginActivityObj = Object.fromEntries(user.loginActivity);

        res.json({
            message: 'Activity logged successfully',
            activity: {
                date: dateKey,
                count: user.loginActivity.get(dateKey)
            },
            loginActivity: loginActivityObj
        });
    } catch (err) {
        console.error('Error logging activity:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router; 