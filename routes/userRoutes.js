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
function categorize(subtopic) {
  if (subtopic.startsWith('aptitude_')) return 'aptitude';
  if (subtopic.startsWith('coding_')) return 'coding';
  if (subtopic.startsWith('technical_')) return 'technical';
  if (subtopic.startsWith('hr_interview_')) return 'hr_interview';
  return null;
}

// GET /api/users/me/progress
router.get('/me/progress', auth, async (req, res) => {
  console.log(`\n[Backend] GET /api/users/me/progress called by user: ${req.user.userId}`);
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log(`[Backend] User not found: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure completedSubjects and progress are Maps and initialize if necessary
    if (!user.completedSubjects || !(user.completedSubjects instanceof Map)) {
        user.completedSubjects = new Map();
    }
    
    // Only ensure categories that are still active exist
    const activeCategories = [
      'aptitude', 'coding', 'technical', 'hr_interview'
    ];
    
    // Clean up removed categories from completedSubjects if they exist
    const categoriesToRemove = ['roadmap', 'logical_reasoning', 'verbal_ability'];
    let needsSave = false;
    categoriesToRemove.forEach(cat => {
        if (user.completedSubjects.has(cat)) {
            user.completedSubjects.delete(cat);
            needsSave = true;
        }
    });

    activeCategories.forEach(cat => {
      if (!user.completedSubjects.has(cat) || !Array.isArray(user.completedSubjects.get(cat))) {
        user.completedSubjects.set(cat, []);
        needsSave = true;
      }
    });

    if (!user.progress || !(user.progress instanceof Map)) {
        user.progress = new Map();
    }

     // Define moduleTotals only for active categories
    const moduleTotals = {
      aptitude: 12, // Sync with frontend count on aptitude.html
      coding: 25,
      technical: 15,
      hr_interview: 7,
    };

    // Clean up removed categories from progress if they exist
     categoriesToRemove.forEach(cat => {
        if (user.progress.has(cat)) {
            user.progress.delete(cat);
            needsSave = true;
        }
    });
     if (user.progress.has('overall') && !user.progress.get('overall')) { // Remove overall if it's 0, will be recalculated
         user.progress.delete('overall');
         needsSave = true;
     }

     // Recalculate progress for active categories and overall
    const allCategoriesForProgress = Object.keys(moduleTotals);

    let totalOverallProgress = 0;
    let validCategoriesCount = 0;

    for (const moduleName of allCategoriesForProgress) { // Iterate through defined modules
      const completedArray = user.completedSubjects.has(moduleName) ? 
        user.completedSubjects.get(moduleName) : [];
        
      const completedInModule = Array.isArray(completedArray) ? completedArray.length : 0;
      const totalInModule = moduleTotals[moduleName] || 0;
      let percentage = 0;

      if (totalInModule > 0) {
        percentage = Math.round((completedInModule / totalInModule) * 100);
      }
      
      // Update the progress Map entry
      user.progress.set(moduleName, percentage);

      // Accumulate for overall progress, only if the category exists in completedSubjects
       if (user.completedSubjects.has(moduleName)) { 
           totalOverallProgress += percentage;
           validCategoriesCount++;
       }
    }
    
    // Calculate and set overall progress
    const overallPercentage = validCategoriesCount > 0 ? Math.round(totalOverallProgress / validCategoriesCount) : 0;
    user.progress.set('overall', overallPercentage);
    needsSave = true; // Always save after recalculating progress

    if (needsSave) {
        await user.save();
        console.log(`[Backend] User ${user.email} progress structure updated/cleaned.`);
    }

    console.log(`[Backend] Sending progress data for user ${user.email}:`, {
      completedSubjects: Object.fromEntries(user.completedSubjects),
      progress: Object.fromEntries(user.progress)
    });

    res.json({
      completedSubjects: Object.fromEntries(user.completedSubjects), // Send back as object for frontend ease
      progress: Object.fromEntries(user.progress) // Send back as object
    });

  } catch (err) {
    console.error('[Backend] Server error in GET /me/progress:', err.message, err.stack);
    res.status(500).json({ message: 'Server error fetching progress', error: err.message });
  }
});

// POST /api/users/me/progress
router.post('/me/progress', auth, async (req, res) => {
  console.log(`\n[Backend] POST /api/users/me/progress called by user: ${req.user.userId}`);
  try {
    const { subtopicId, completed } = req.body;
    console.log(`[Backend] Received subtopicId: ${subtopicId}, completed: ${completed}`);

    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log(`[Backend] User not found: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const category = categorize(subtopicId);
    if (!category) {
      console.log(`[Backend] Invalid category for subtopicId: ${subtopicId}. It might belong to a removed category.`);
      return res.status(400).json({ message: 'Invalid or removed subtopic ID category' });
    }

    // Ensure completedSubjects is a Map and category array exists
    if (!user.completedSubjects || !(user.completedSubjects instanceof Map)) {
        user.completedSubjects = new Map();
    }
    if (!user.completedSubjects.has(category) || !Array.isArray(user.completedSubjects.get(category))) {
        user.completedSubjects.set(category, []);
    }

    let completedInCategory = user.completedSubjects.get(category);

    console.log(`[Backend] User ${user.email} - Initial completedSubjects for category '${category}':`, completedInCategory);

    if (completed) {
      if (!completedInCategory.includes(subtopicId)) {
        completedInCategory.push(subtopicId);
        console.log(`[Backend] Added ${subtopicId} to category '${category}'`);
      } else {
        console.log(`[Backend] ${subtopicId} already in category '${category}'`);
      }
    } else {
      const initialLength = completedInCategory.length;
      completedInCategory = completedInCategory.filter(id => id !== subtopicId);
      // Update the Map entry with the filtered array
      user.completedSubjects.set(category, completedInCategory);

      if (completedInCategory.length < initialLength) {
        console.log(`[Backend] Removed ${subtopicId} from category '${category}'`);
      } else {
        console.log(`[Backend] ${subtopicId} was not in category '${category}' to remove`);
      }
    }

    // Recalculate all progress percentages for active categories and update the user.progress Map
     const moduleTotals = {
      aptitude: 12, // Sync with frontend count on aptitude.html
      coding: 25,
      technical: 15,
      hr_interview: 7,
    };

    // Ensure user.progress is a Map
    if (!user.progress || !(user.progress instanceof Map)) {
        user.progress = new Map();
    }

    const allCategories = Object.keys(moduleTotals); // Use keys from moduleTotals for consistency

    let totalOverallProgress = 0;
    let validCategoriesCount = 0;

    for (const moduleName of allCategories) { // Iterate through defined modules
      const completedArray = user.completedSubjects.has(moduleName) ? 
        user.completedSubjects.get(moduleName) : [];
        
      const completedInModule = Array.isArray(completedArray) ? completedArray.length : 0;
      const totalInModule = moduleTotals[moduleName] || 0;
      let percentage = 0;

      if (totalInModule > 0) {
        percentage = Math.round((completedInModule / totalInModule) * 100);
      }
      
      // Update the progress Map entry
      user.progress.set(moduleName, percentage);

      // Accumulate for overall progress
       if (user.completedSubjects.has(moduleName)) { 
           totalOverallProgress += percentage;
           validCategoriesCount++;
       }
    }
    
    // Calculate and set overall progress
    const overallPercentage = validCategoriesCount > 0 ? Math.round(totalOverallProgress / validCategoriesCount) : 0;
    user.progress.set('overall', overallPercentage);

    console.log(`[Backend] User ${user.email} - State before saving:`, { 
        completedSubjects: Object.fromEntries(user.completedSubjects),
        progress: Object.fromEntries(user.progress)
    });

    await user.save();
    console.log(`[Backend] User ${user.email} - Progress saved successfully to DB.`);

    // Respond with the updated state
    res.json({
      message: `Progress for ${subtopicId} updated to ${completed}`,
      completedSubjects: Object.fromEntries(user.completedSubjects), // Send back as object for frontend ease
      progress: Object.fromEntries(user.progress) // Send back as object
    });

  } catch (err) {
    console.error('[Backend] Server error in POST /me/progress:', err.message, err.stack);
    res.status(500).json({ message: 'Server error updating progress', error: err.message });
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