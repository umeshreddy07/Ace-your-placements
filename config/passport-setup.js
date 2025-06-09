const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const crypto = require('crypto');

// Basic validation of required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("FATAL ERROR: Google OAuth credentials not found in environment variables!");
    process.exit(1);
}

module.exports = function(passport) {
    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log("\n=== Google OAuth Callback Start ===");
            console.log("Profile ID:", profile.id);
            console.log("Profile Email:", profile.emails?.[0]?.value);
            console.log("Profile Name:", profile.displayName);
            
            // Check if user exists with Google ID
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                console.log("Found existing user by Google ID:", user.email);
                return done(null, user);
            }

            // Check if user exists with email
            const email = profile.emails?.[0]?.value;
            if (!email) {
                console.error("No email found in Google profile!");
                return done(new Error("No email provided by Google"), false);
            }

            user = await User.findOne({ email });
            if (user) {
                console.log("Found existing user by email:", user.email);
                // Link Google ID to existing user
                user.googleId = profile.id;
                if (!user.name && profile.displayName) {
                    user.name = profile.displayName;
                }
                if (!user.profilePicture && profile.photos?.[0]?.value) {
                    user.profilePicture = profile.photos[0].value;
                }
                try {
                    await user.save();
                    console.log("Successfully linked Google ID to existing user");
                    return done(null, user);
                } catch (saveError) {
                    console.error("Error saving user with Google ID:", saveError);
                    return done(saveError, false);
                }
            }

            // Create new user
            console.log("Creating new user for email:", email);
            const username = email.split('@')[0] + "_" + Math.random().toString(36).substring(2, 7);
            const newUserData = {
                googleId: profile.id,
                email: email,
                name: profile.displayName || email.split('@')[0],
                username: username,
                profilePicture: profile.photos?.[0]?.value || 'static/default-profile.jpg',
                password: crypto.randomBytes(32).toString('hex'),
                school: "AYP ACADEMY",
                location: "HYDERABAD"
            };

            console.log("Attempting to create new user with data:", {
                ...newUserData,
                password: '[REDACTED]'
            });

            const newUser = new User(newUserData);
            try {
                await newUser.save();
                console.log("Successfully created new user:", newUser.email);
                return done(null, newUser);
            } catch (saveError) {
                console.error("Error saving new user:", saveError);
                if (saveError.name === 'ValidationError') {
                    console.error("Validation errors:", saveError.errors);
                }
                return done(saveError, false);
            }
        } catch (err) {
            console.error("Unexpected error in Google Strategy:", err);
            return done(err, false);
        } finally {
            console.log("=== Google OAuth Callback End ===\n");
        }
    }));

    passport.serializeUser((user, done) => {
        console.log("Serializing user:", user.id);
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            console.log("Deserializing user:", id);
            const user = await User.findById(id);
            if (!user) {
                console.error("User not found during deserialization:", id);
                return done(new Error("User not found"), null);
            }
            done(null, user);
        } catch (err) {
            console.error("Error deserializing user:", err);
            done(err, null);
        }
    });
}; 