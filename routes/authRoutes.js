const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendLoginNotificationEmail } = require('../utils/emailService');
const router = express.Router();

const generateToken = (userId) => {
    console.log("Generating JWT token for user:", userId);
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
    console.log("Token generated successfully");
    return token;
};

// Google OAuth
router.get('/google', (req, res, next) => {
    console.log("\n=== Initiating Google OAuth ===");
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })(req, res, next);
});

router.get('/google/callback',
    (req, res, next) => {
        console.log("\n=== Google OAuth Callback Received ===");
        console.log("Query parameters:", req.query);
        passport.authenticate('google', { 
            failureRedirect: '/login.html?error=google_auth_failed', 
            session: false 
        })(req, res, next);
    },
    async (req, res) => {
        console.log("\n=== Processing Google OAuth Callback ===");
        console.log("User object from Passport:", req.user ? {
            id: req.user._id,
            email: req.user.email,
            name: req.user.name
        } : 'No user object');

        if (!req.user || !req.user._id) {
            console.error("User object or user._id is missing after Passport authentication!");
            return res.redirect('/login.html?error=auth_processing_error');
        }

        try {
            // --- RECORD LOGIN ACTIVITY FOR GOOGLE USERS ---
            const user = await User.findById(req.user._id); // Fetch user to update login activity
            if (user) {
                const todayStr = new Date().toISOString().split('T')[0];
                // Ensure loginActivity is a Map (handles old users)
                if (!(user.loginActivity instanceof Map)) {
                  user.loginActivity = new Map(Object.entries(user.loginActivity || {}));
                }
                const currentLoginsToday = user.loginActivity.get(todayStr) || 0;
                user.loginActivity.set(todayStr, currentLoginsToday + 1);
                user.lastLoginAt = new Date();
                console.log('Updating loginActivity for Google user:', user.loginActivity);
                await user.save();
                console.log('Google user loginActivity saved.');

                // Send login notification email
                try {
                    if (user && user.email && user.name) {
                        console.log(`[AUTH_CALLBACK] Preparing to send login notification to: ${user.email} (Name: ${user.name})`);
                        await sendLoginNotificationEmail(user.email, user.name);
                        console.log(`[AUTH_CALLBACK] Login notification email queued for ${user.email}`);
                    } else {
                        console.error('[AUTH_CALLBACK] User object or user.email/user.name is missing for email notification.');
                    }
                } catch (emailError) {
                    console.error(`[AUTH_CALLBACK] Failed to send login notification email to ${user.email}:`, emailError);
                    // Don't block the login process if email fails
                }
            } else {
                console.warn('User not found when trying to update login activity in Google callback:', req.user._id);
            }
            // --- END RECORD LOGIN ACTIVITY ---

            const token = generateToken(req.user._id);
            console.log("Setting cookie with token");
            // Keep the httpOnly cookie logic as a primary method, it might work sometimes
            // and is better if possible. The URL param is the fallback/temp fix.
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production' ? true : false, // Explicitly set secure based on NODE_ENV
                sameSite: process.env.NODE_ENV === 'production' ? 'Lax' : 'Lax', // Set SameSite to Lax for development
                path: '/',
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
             res.cookie('isAuthenticated', 'true', {
                 httpOnly: false, // This one can be non-httpOnly if needed by frontend checks
                 secure: process.env.NODE_ENV === 'production' ? true : false, // Explicitly set secure based on NODE_ENV
                 sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax', // Set SameSite to Lax for development
                 path: '/'
             });
            console.log("Cookie set successfully (attempted httpOnly and isAuthenticated).");

            // --- TEMPORARY DEV FIX: Pass token in URL for HTTP localhost --- 
            // This is less secure; the non-httpOnly cookie is preferred.
            // Removed the URL parameter passing as we will use a frontendToken cookie.
            // console.log("Redirecting to /index.html with token in URL query.");
            // res.redirect(`/index.html?token=${token}`); // Pass token as query parameter
            // --- END TEMPORARY DEV FIX ---

             // --- Frontend Accessible Token Cookie (for development without HTTPS) ---
             // This cookie is needed because frontend JS cannot read httpOnly cookies.
             res.cookie('frontendToken', token, {
                 httpOnly: false, // Make accessible to frontend JS
                 secure: process.env.NODE_ENV === 'production' ? true : false, // Explicitly set secure based on NODE_ENV
                 sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax', // Set SameSite to Lax for development
                 path: '/',
                 maxAge: 24 * 60 * 60 * 1000, // Match httpOnly token expiry
             });
             console.log("Frontend accessible token cookie 'frontendToken' set.");

            // Redirect with token in URL for immediate frontend access
            console.log("Redirecting to /index.html with token in URL");
            res.redirect(`/index.html?token=${token}`);

        } catch (error) {
            console.error("Error in callback processing:", error);
            res.redirect('/login.html?error=token_error');
        } finally {
            console.log("=== Google OAuth Callback Processing Complete ===\n");
        }
    }
);

// Apple OAuth
router.get('/apple', passport.authenticate('apple'));
router.post('/apple/callback',
    passport.authenticate('apple', { failureRedirect: '/login.html?error=apple_auth_failed', session: false }),
    (req, res) => {
        const token = generateToken(req.user._id);
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' ? true : false, sameSite: process.env.NODE_ENV === 'production' ? 'Lax' : 'Lax', maxAge: 24 * 60 * 60 * 1000 });
        res.cookie('isAuthenticated', 'true', { httpOnly: false, secure: process.env.NODE_ENV === 'production' ? true : false, sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax', path: '/' });
        res.cookie('frontendToken', token, { httpOnly: false, secure: process.env.NODE_ENV === 'production' ? true : false, sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax', path: '/', maxAge: 24 * 60 * 60 * 1000 });
        res.redirect('/index.html');
    }
);

// Standard Email/Password Login
router.post('/login', async (req, res) => {
    console.log("\n=== Standard Login Attempt ===");
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        console.log("Login attempt for email:", email, ", User found:", !!user);

        // Check if user exists and password is correct (assuming bcrypt or similar for password hashing)
        // NOTE: This assumes you have a method like user.comparePassword or use bcrypt directly
        // If using bcrypt directly, you'll need: const bcrypt = require('bcrypt');
        // const isMatch = user ? await bcrypt.compare(password, user.password) : false;

        // *** Placeholder for actual password comparison logic ***
        // Replace this placeholder with your actual password hashing/comparison method
        const isMatch = user ? (password === user.password) : false; // DANGER: Using plain text for demo - REPLACE THIS!
        console.log("Password match:", isMatch);
        // *** End Placeholder ***

        if (!user || !isMatch) {
            console.log("Login failed: Invalid credentials for email:", email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = generateToken(user._id);
        console.log("Login successful. Token generated.");

        // --- RECORD LOGIN ACTIVITY FOR STANDARD USERS ---
         // Fetch user again if necessary or ensure 'user' object is fully populated
         const userToUpdate = await User.findById(user._id); 
         if (userToUpdate) {
             const todayStr = new Date().toISOString().split('T')[0];
              if (!(userToUpdate.loginActivity instanceof Map)) {
                   userToUpdate.loginActivity = new Map(Object.entries(userToUpdate.loginActivity || {}));
              }
             const currentLoginsToday = userToUpdate.loginActivity.get(todayStr) || 0;
             userToUpdate.loginActivity.set(todayStr, currentLoginsToday + 1);
             userToUpdate.lastLoginAt = new Date();
             console.log('Updating loginActivity for standard user:', userToUpdate.loginActivity);
             await userToUpdate.save();
             console.log('Standard user loginActivity saved.');

             // Send login notification email (optional for standard login, but consistent)
             try {
                 if (userToUpdate && userToUpdate.email && userToUpdate.name) {
                     console.log(`[STANDARD_LOGIN] Preparing to send login notification to: ${userToUpdate.email} (Name: ${userToUpdate.name})`);
                      await sendLoginNotificationEmail(userToUpdate.email, userToUpdate.name);
                     console.log(`[STANDARD_LOGIN] Login notification email queued for ${userToUpdate.email}`);
                 } else {
                     console.error('[STANDARD_LOGIN] User object or user.email/user.name is missing for email notification.');
                 }
             } catch (emailError) {
                 console.error(`[STANDARD_LOGIN] Failed to send login notification email to ${userToUpdate.email}:`, emailError);
             }
         } else {
             console.warn('User not found when trying to update login activity after standard login:', user._id);
         }
        // --- END RECORD LOGIN ACTIVITY ---

        // Set cookies
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false, // Explicitly set secure based on NODE_ENV
            sameSite: process.env.NODE_ENV === 'production' ? 'Lax' : 'Lax', // Set SameSite to Lax for development
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.cookie('isAuthenticated', 'true', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production' ? true : false, // Explicitly set secure based on NODE_ENV
            sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax', // Set SameSite to Lax for development
            path: '/'
        });
        res.cookie('frontendToken', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production' ? true : false, // Explicitly set secure based on NODE_ENV
            sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax', // Set SameSite to Lax for development
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error("Error during standard login:", error);
        res.status(500).json({ message: 'Server error during login' });
    } finally {
        console.log("=== Standard Login Attempt Complete ===\n");
    }
});

router.get('/logout', (req, res) => {
    console.log('\n=== Handling Logout ===');
    // Clear the httpOnly token cookie
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Set expiry to a past date
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
    });
    // Clear the isAuthenticated cookie as well (if used by other parts of the frontend)
     res.cookie('isAuthenticated', '', { 
         httpOnly: false, 
         expires: new Date(0), 
         secure: process.env.NODE_ENV === 'production', 
         sameSite: 'Lax', 
         path: '/' 
     });
    console.log('Token and isAuthenticated cookies cleared. Redirecting to login page.');
    res.redirect('/login.html');
});

module.exports = router; 