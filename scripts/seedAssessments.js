const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AssessmentModule = require('../models/AssessmentModule');
const path = require('path');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ace_your_placement';

async function seedAssessments() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing assessments
        await AssessmentModule.deleteMany({});
        console.log('Cleared existing assessments');

        // Import the raw sample assessments
        const rawSampleAssessments = require('../seedAssessments').sampleAssessments;

        // Transform rawSampleAssessments to AssessmentModule schema
        const transformedAssessments = rawSampleAssessments.map(assessment => {
            const moduleQuestions = [];
            assessment.sections.forEach(section => {
                section.questions.forEach(q => {
                    let questionType = q.type;
                    if (questionType === 'coding') {
                        questionType = 'code';
                    } else if (questionType === 'interview') { // Assuming interview questions are text-based
                        questionType = 'text';
                    }
                    moduleQuestions.push({
                        questionText: q.questionText,
                        type: questionType,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        // Add aiReview and codeStarter if they exist or set defaults
                        aiReview: q.aiReview || false,
                        codeStarter: q.codeStarter || undefined // Undefined will not store the field if not present
                    });
                });
            });

            // Mapping assessment 'type' to module 'category' based on AssessmentModule schema enum
            let category = 'Technical'; // Default to 'Technical' if mapping is unclear
            if (assessment.type === 'technical') {
                category = 'Technical';
            } else if (assessment.type === 'hr') {
                category = 'HR';
            } else if (assessment.type === 'aptitude_practice') {
                category = 'Aptitude';
            } else if (assessment.type === 'coding') { 
                category = 'Coding';
            }

            // Override category to 'Coding' if any section contains coding questions
            const hasCodingSection = assessment.sections.some(section => section.type === 'coding');
            if (hasCodingSection) {
                category = 'Coding';
            }

            return {
                name: assessment.title,
                description: assessment.description,
                category: category,
                timerMinutes: assessment.duration,
                questions: moduleQuestions
            };
        });


        // Create assessment modules
        const createdAssessmentModules = await AssessmentModule.insertMany(transformedAssessments);
        console.log(`Successfully created ${createdAssessmentModules.length} assessment modules`);

        // Close the database connection
        await mongoose.connection.close();
        console.log('Database connection closed');

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeding function
seedAssessments(); 