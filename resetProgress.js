// resetProgress.js - FINAL CORRECTED VERSION

const mongoose = require('mongoose');
const User = require('./models/User'); 
// This line is essential to load the variables from your .env file
require('dotenv').config(); 

// THIS IS THE CORRECT WAY TO ACCESS THE VARIABLE
const MONGODB_URI = process.env.MONGO_URI; 
const USER_EMAIL_TO_RESET = 'reddyumesh912@gmail.com';

const resetUserProgress = async () => {
  // This check will now work correctly
  if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI not found in your .env file. Please check the file and variable name.');
    return;
  }

  try {
    console.log(`Connecting to database...`);
    // Mongoose will use the string from process.env.MONGO_URI
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected successfully.');

    console.log(`Searching for user with email: ${USER_EMAIL_TO_RESET}`);
    const user = await User.findOne({ email: USER_EMAIL_TO_RESET });

    if (!user) {
      console.error(`ERROR: User with email ${USER_EMAIL_TO_RESET} not found.`);
      return;
    }

    console.log(`User found: ${user.name}. Resetting progress...`);

    // 1. Reset all completed subject arrays to be empty
    user.completedSubjects.set('aptitude', []);
    user.completedSubjects.set('coding', []);
    user.completedSubjects.set('technical', []);
    user.completedSubjects.set('hr_interview', []);

    // 2. Reset all progress percentages to zero
    user.progress.set('aptitude', 0);
    user.progress.set('coding', 0);
    user.progress.set('technical', 0);
    user.progress.set('hr_interview', 0);
    user.progress.set('overall', 0);

    // 3. Tell Mongoose that these Maps have been modified
    user.markModified('completedSubjects');
    user.markModified('progress');

    // 4. Save the changes to the database
    await user.save();

    console.log('✅✅✅ SUCCESS! ✅✅✅');
    console.log(`Progress for ${user.email} has been reset to zero in the database.`);
    console.log('New progress values:', Object.fromEntries(user.progress));

  } catch (error) {
    console.error('A critical error occurred:', error);
  } finally {
    // 5. Always disconnect from the database
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
};

// Run the function
resetUserProgress();