const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  try {
    console.log('Received signup request body:', req.body);
    const { name, email, password, username } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hashedPassword, username });
    await user.save();
    // Generate token after registration
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const userObj = user.toObject();
    if (userObj.loginActivity instanceof Map) {
      userObj.loginActivity = Object.fromEntries(userObj.loginActivity);
    }
    delete userObj.password;
    res.status(201).json({ token, user: userObj });
  } catch (err) {
    console.error("Signup Server Error:", err);
    res.status(500).json({ message: 'Server error', error: err.message, details: err });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`[LOGIN] User ${user.email}: Profile picture before modification: ${user.profilePicture}`);

    // For regular email/password login, ensure profile picture is the default if it was previously a Google picture
    if (!user.googleId && user.profilePicture && user.profilePicture !== 'static/default-profile.jpg') {
      user.profilePicture = 'static/default-profile.jpg'; // Explicitly set to default if it's not already
      console.log('Reset profilePicture to default for email login');
    }

    console.log(`[LOGIN] User ${user.email}: Profile picture after modification logic: ${user.profilePicture}`);

    // --- RECORD LOGIN ACTIVITY ---
    const todayStr = new Date().toISOString().split('T')[0];
    // Ensure loginActivity is a Map (handles old users)
    if (!(user.loginActivity instanceof Map)) {
      user.loginActivity = new Map(Object.entries(user.loginActivity || {}));
    }
    const currentLoginsToday = user.loginActivity.get(todayStr) || 0;
    user.loginActivity.set(todayStr, currentLoginsToday + 1);
    user.lastLoginAt = new Date();
    console.log('Updating loginActivity:', user.loginActivity);

    console.log(`[LOGIN] User ${user.email}: Profile picture before save: ${user.profilePicture}`);
    await user.save();
    console.log(`[LOGIN] User ${user.email}: Profile picture after save: ${user.profilePicture}`);

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    // Return user object (excluding password)
    const userObj = user.toObject();
    if (userObj.loginActivity instanceof Map) {
      userObj.loginActivity = Object.fromEntries(userObj.loginActivity);
    }
    delete userObj.password;

    console.log(`[LOGIN] User ${user.email}: Profile picture in response user object: ${userObj.profilePicture}`);

    // Set JWT as an HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 3600000, // 1 hour (in milliseconds)
      sameSite: 'strict', // Helps prevent CSRF attacks
    });

    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userObj = user.toObject();
    // Ensure loginActivity is always a plain object
    if (userObj.loginActivity instanceof Map) {
      userObj.loginActivity = Object.fromEntries(userObj.loginActivity);
    } else if (!userObj.loginActivity) {
      userObj.loginActivity = {};
    }
    console.log('Fetched user in getProfile:', userObj);
    res.json({ user: userObj });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};