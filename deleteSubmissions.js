const mongoose = require('mongoose');
const Submission = require('./models/Submission'); // Adjust path if needed
require('dotenv').config(); // Load environment variables

const USER_ID_TO_DELETE = '683ef0778bfd768eb9a10cc2'; // Your user ID

async function deleteUserSubmissions() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ace_your_placement', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB.');

        console.log(`Attempting to delete submissions for user ID: ${USER_ID_TO_DELETE}`);

        // Find submissions before deleting to confirm their presence
        const submissionsToFind = await Submission.find({ user: USER_ID_TO_DELETE });
        if (submissionsToFind.length > 0) {
            console.log(`Found ${submissionsToFind.length} submissions for user ID ${USER_ID_TO_DELETE} before deletion:`);
            submissionsToFind.forEach(sub => console.log(` - Submission ID: ${sub._id}, Assessment ID: ${sub.assessment}, Status: ${sub.status}`));
        } else {
            console.log(`No submissions found for user ID ${USER_ID_TO_DELETE} before deletion.`);
        }

        const result = await Submission.deleteMany({ user: USER_ID_TO_DELETE });

        console.log(`Successfully deleted ${result.deletedCount} submissions for user ID: ${USER_ID_TO_DELETE}`);
    } catch (error) {
        console.error('Error deleting submissions:', error);
    } finally {
        console.log('Disconnecting from MongoDB...');
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

deleteUserSubmissions(); 