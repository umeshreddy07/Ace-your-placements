const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' }); // Adjust path if your config.env is elsewhere

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('MongoDB URI not found. Please set MONGO_URI in your .env file or config/config.env');
    process.exit(1);
}

// Minimal schema for deletion - we only need the collection name
const AssessmentSchema = new mongoose.Schema({}, { collection: 'assessments', strict: false });
const Assessment = mongoose.model('Assessment', AssessmentSchema);

const SubmissionSchema = new mongoose.Schema({}, { collection: 'submissions', strict: false });
const Submission = mongoose.model('Submission', SubmissionSchema);

const deleteData = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB Connected...');

        console.log('Deleting all assessment data...');
        const assessmentResult = await Assessment.deleteMany({});
        console.log(`Deleted ${assessmentResult.deletedCount} assessments.`);

        console.log('Deleting all submission data...');
        const submissionResult = await Submission.deleteMany({});
        console.log(`Deleted ${submissionResult.deletedCount} submissions.`);

        console.log('All assessment and submission data deleted successfully.');
        mongoose.connection.close();
    } catch (err) {
        console.error(`Error deleting data: ${err.message}`);
        process.exit(1);
    }
};

deleteData(); 