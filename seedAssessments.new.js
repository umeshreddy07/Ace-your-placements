const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Assessment = require('./models/Assessment');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ace_your_placement';

const sampleAssessments = [
    {
        title: "Advanced Quantitative Aptitude",
        description: "A comprehensive test covering advanced quantitative concepts including time and work, percentages, and mathematical reasoning.",
        type: "technical",  // This is correct as it's a technical assessment
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Advanced Quantitative Aptitude",
                description: "Questions on advanced arithmetic, algebra, and mathematical reasoning.",
                type: "mcq",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "mcq",
                        questionText: "A booster pump can be used for filling as well as for emptying a tank. The capacity of the tank is 2400 m^3. The emptying capacity of the tank is 10 m^3 per minute higher than its filling capacity and the pump needs 8 minutes lesser to empty the tank than it needs to fill it. What is the filling capacity of the pump?",
                        options: ["40 m^3/min", "50 m^3/min", "60 m^3/min", "30 m^3/min"],
                        correctAnswer: "50 m^3/min",
                        marks: 10
                    },
                    // ... rest of the questions ...
                ]
            }
        ]
    },
    {
        title: "Complex Logical Reasoning",
        description: "A comprehensive test covering advanced logical reasoning concepts including coding-decoding, blood relations, series completion, and analytical reasoning.",
        type: "technical",  // This is correct as it's a technical assessment
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Complex Logical Reasoning",
                description: "Questions on coding-decoding, blood relations, series completion, and analytical reasoning.",
                type: "mcq",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "mcq",
                        questionText: "Pointing to a photograph, a man said, 'I have no brothers and sisters, but that man's father is my father's son.' Who is in the photograph?",
                        options: ["His son", "His father", "His cousin", "He himself"],
                        correctAnswer: "His son",
                        marks: 10
                    },
                    // ... rest of the questions ...
                ]
            }
        ]
    },
    {
        title: "System Design Fundamentals",
        description: "A comprehensive test covering system design concepts including scalability, reliability, and distributed systems.",
        type: "coding",  // Changed to coding as it's a coding/system design assessment
        duration: 45,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "System Design Fundamentals",
                description: "Questions on system design principles and implementation.",
                type: "coding",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "coding",
                        questionText: "Design a scalable URL shortening service like TinyURL.",
                        codeStarter: "class URLShortener {\n    // Your code here\n}",
                        marks: 10
                    },
                    // ... rest of the questions ...
                ]
            }
        ]
    },
    {
        title: "HR Interview Preparation",
        description: "A comprehensive test covering HR interview questions and scenarios.",
        type: "hr",  // Changed to hr as it's an HR assessment
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "HR Interview Preparation",
                description: "Questions on HR interview scenarios and responses.",
                type: "interview",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "interview",
                        questionText: "Tell me about yourself and your career goals.",
                        sampleAnswer: "I am a final year Computer Science student with a passion for software development...",
                        keyPoints: ["Professional background", "Technical skills", "Career objectives"],
                        marks: 10
                    },
                    // ... rest of the questions ...
                ]
            }
        ]
    }
];

async function seed() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing assessments
        await Assessment.deleteMany({});
        console.log('Cleared existing assessments');

        // Create new assessments
        const createdAssessments = await Assessment.insertMany(sampleAssessments);
        console.log(`Successfully created ${createdAssessments.length} assessments`);

        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seed();

module.exports = {
    sampleAssessments
}; 