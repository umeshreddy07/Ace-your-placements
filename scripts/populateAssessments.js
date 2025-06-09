require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const { ObjectId } = mongoose.Types;

// Define the start date of your placement assessment series (e.g., the start of Week 1)
// Change this date to the actual date your series began or will begin.
const PLACEMENT_SERIES_START_DATE = new Date('2026-06-01T00:00:00Z'); // Example: June 1st, 2026 UTC

// --- HELPER FUNCTIONS TO GENERATE QUESTIONS ---
function generateMCQ(id, questionText, options, correctAnswer, marks = 1) {
    return { 
        _id: new ObjectId(id), 
        question: questionText, 
        type: "mcq", 
        options, 
        correctAnswer, 
        marks, 
        testCases: [], 
        keyPoints: [] 
    };
}

function generateFillBlank(id, questionText, correctAnswer, marks = 1) {
    return { 
        _id: new ObjectId(id), 
        question: questionText, 
        type: "fill_blank", 
        correctAnswer, 
        marks, 
        options: [], 
        testCases: [], 
        keyPoints: [] 
    };
}

function generateCodingQuestion(id, questionText, marks = 10, testCases = []) {
    return { 
        _id: new ObjectId(id), 
        question: questionText, 
        type: "coding", 
        marks, 
        testCases, 
        options: [], 
        keyPoints: [] 
    };
}

function generateInterviewQuestion(id, questionText, marks = 5) {
    return { 
        _id: new ObjectId(id), 
        question: questionText, 
        type: "interview", 
        marks, 
        options: [], 
        testCases: [], 
        keyPoints: [] 
    };
}

async function populateAssessments() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true, // Not needed in Mongoose 6+
            // useFindAndModify: false // Not needed in Mongoose 6+
        });
        console.log('Connected to MongoDB successfully for assessment population.');

        console.log('Clearing existing assessments...');
        await Assessment.deleteMany({});
        console.log('Successfully cleared existing assessments.');

        const assessmentsToCreate = [];
        const now = new Date(); // Server's current time
        const farFuture = new Date(now.getFullYear() + 5, 0, 1);
        const pastStartDate = new Date(now.getFullYear() - 1, 0, 1);

        // --- Calculate Week Number Relative to Series Start ---
        const timeDiff = now.getTime() - PLACEMENT_SERIES_START_DATE.getTime();
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        // Calculate week number (add a small offset to ensure partial weeks count correctly, adjust if needed)
        // Week 1 starts on PLACEMENT_SERIES_START_DATE. Days 0-6 are Week 1, 7-13 are Week 2, etc.
        const calculatedWeekNumber = Math.max(1, Math.floor(daysDiff / 7) + 1); // Ensure week number is at least 1
        console.log(`Calculated Week Number relative to series start (${PLACEMENT_SERIES_START_DATE.toISOString()}): ${calculatedWeekNumber}`);

        // --- 1. Create PRACTICE ASSESSMENTS (for weekdays) ---
        console.log('Defining practice assessments...');

        // APTITUDE PRACTICE (20 questions)
        const aptitudeQuestions = [
            generateMCQ(new ObjectId(), "If a train travels at 60 km/h for 2.5 hours, how far does it go?", 
                ["120 km", "150 km", "180 km", "200 km"], "150 km", 1),
            generateMCQ(new ObjectId(), "What comes next in the sequence: 2, 4, 8, 16, ...?", 
                ["24", "32", "30", "28"], "32", 1),
            generateMCQ(new ObjectId(), "If 20% of a number is 40, what is the number?", 
                ["160", "200", "240", "280"], "200", 1),
            generateMCQ(new ObjectId(), "A clock shows 3:15. What is the angle between the hour and minute hands?", 
                ["7.5°", "15°", "22.5°", "30°"], "7.5°", 1),
            generateMCQ(new ObjectId(), "If all Zips are Zaps and all Zaps are Zops, then:", 
                ["All Zips are Zops", "Some Zips are not Zops", "No Zips are Zops", "None of these"], "All Zips are Zops", 1),
            // Add more aptitude questions...
        ];

        assessmentsToCreate.push({
            type: 'aptitude_practice',
            title: 'Comprehensive Aptitude Practice',
            description: 'Sharpen your analytical and problem-solving skills with these 20 aptitude questions.',
            totalMarks: 20,
            duration: 30,
            startDate: pastStartDate,
            endDate: farFuture,
            isActive: true,
            sections: [{
                name: "Mixed Aptitude",
                type: "mcq",
                questions: aptitudeQuestions,
                totalMarks: 20
            }]
        });

        // TECHNICAL PRACTICE (20 questions)
        const technicalQuestions = [
            // Database Questions
            generateMCQ(new ObjectId(), "What is the primary purpose of an index in a database?", 
                ["To speed up data retrieval", "To store backup data", "To validate data", "To encrypt data"], 
                "To speed up data retrieval", 1),
            generateMCQ(new ObjectId(), "Which of these is NOT a type of database relationship?", 
                ["One-to-One", "One-to-Many", "Many-to-Many", "One-to-All"], 
                "One-to-All", 1),
            generateFillBlank(new ObjectId(), "The process of organizing data to minimize redundancy is called ____.", 
                "normalization", 1),
            
            // OS Questions
            generateMCQ(new ObjectId(), "What is the main function of an operating system's kernel?", 
                ["Manage hardware resources", "Run applications", "Store user data", "Connect to the internet"], 
                "Manage hardware resources", 1),
            generateFillBlank(new ObjectId(), "The technique where the OS moves processes between main memory and disk is called ____.", 
                "swapping", 1),
            
            // Networking Questions
            generateMCQ(new ObjectId(), "What protocol operates at the Transport layer of the OSI model?", 
                ["TCP", "IP", "HTTP", "FTP"], 
                "TCP", 1),
            generateFillBlank(new ObjectId(), "The unique identifier for a device on a network is called a ____ address.", 
                "MAC", 1),
            // Add more technical questions...
        ];

        assessmentsToCreate.push({
            type: 'technical_practice',
            title: 'Core Technical Concepts Review',
            description: 'Test your fundamentals in Databases, OS, and Networking (20 questions).',
            totalMarks: 20,
            duration: 30,
            startDate: pastStartDate,
            endDate: farFuture,
            isActive: true,
            sections: [{
                name: "Core CS Fundamentals",
                type: "mixed",
                questions: technicalQuestions,
                totalMarks: 20
            }]
        });

        // CODING PRACTICE - ARRAYS
        const arrayQuestions = [
            generateCodingQuestion(
                new ObjectId(),
                "Find the maximum element in an array. Implement a function that takes an array of integers and returns the maximum value.",
                10,
                [
                    {input: "[1, 5, 2, 8, 3]", output: "8"},
                    {input: "[-1, -5, -2]", output: "-1"},
                    {input: "[0, 0, 0]", output: "0"}
                ]
            ),
            generateCodingQuestion(
                new ObjectId(),
                "Rotate an array to the right by k steps. For example, with input [1,2,3,4,5,6,7] and k=3, the output should be [5,6,7,1,2,3,4].",
                10,
                [
                    {input: "nums = [1,2,3,4,5,6,7], k = 3", output: "[5,6,7,1,2,3,4]"},
                    {input: "nums = [-1,-100,3,99], k = 2", output: "[3,99,-1,-100]"}
                ]
            ),
            generateCodingQuestion(
                new ObjectId(),
                "Find two numbers in an array that add up to a target value. Return the indices of these numbers.",
                10,
                [
                    {input: "nums = [2,7,11,15], target = 9", output: "[0,1]"},
                    {input: "nums = [3,2,4], target = 6", output: "[1,2]"}
                ]
            )
        ];

        assessmentsToCreate.push({
            type: 'coding_practice',
            title: 'Coding Practice: Arrays',
            description: 'Solve 3 coding problems focused on array manipulations.',
            totalMarks: 30,
            duration: 45,
            startDate: pastStartDate,
            endDate: farFuture,
            isActive: true,
            sections: [{
                name: "Array Problems",
                type: "coding",
                totalMarks: 30,
                questions: arrayQuestions
            }]
        });

        // CODING PRACTICE - STRINGS
        const stringQuestions = [
            generateCodingQuestion(
                new ObjectId(),
                "Check if a string is a palindrome. A palindrome reads the same forwards and backwards.",
                10,
                [
                    {input: "'madam'", output: "true"},
                    {input: "'racecar'", output: "true"},
                    {input: "'hello'", output: "false"}
                ]
            ),
            generateCodingQuestion(
                new ObjectId(),
                "Find the first non-repeating character in a string. Return its index or -1 if none exists.",
                10,
                [
                    {input: "'leetcode'", output: "0"},
                    {input: "'loveleetcode'", output: "2"},
                    {input: "'aabb'", output: "-1"}
                ]
            ),
            generateCodingQuestion(
                new ObjectId(),
                "Implement atoi which converts a string to an integer. The function should handle whitespace, signs, and overflow.",
                10,
                [
                    {input: "'42'", output: "42"},
                    {input: "'   -42'", output: "-42"},
                    {input: "'4193 with words'", output: "4193"}
                ]
            )
        ];

        assessmentsToCreate.push({
            type: 'coding_practice',
            title: 'Coding Practice: Strings',
            description: 'Tackle 3 coding challenges based on string operations.',
            totalMarks: 30,
            duration: 45,
            startDate: pastStartDate,
            endDate: farFuture,
            isActive: true,
            sections: [{
                name: "String Manipulations",
                type: "coding",
                totalMarks: 30,
                questions: stringQuestions
            }]
        });

        // HR INTERVIEW PRACTICE (20 questions)
        const hrQuestions = [
            generateInterviewQuestion(
                new ObjectId(),
                "Tell me about a time when you had to manage conflicting priorities. How did you handle it?",
                2
            ),
            generateInterviewQuestion(
                new ObjectId(),
                "Describe a situation where you demonstrated leadership skills. What was the outcome?",
                2
            ),
            generateInterviewQuestion(
                new ObjectId(),
                "How do you handle stress and pressure in a work environment?",
                2
            ),
            generateInterviewQuestion(
                new ObjectId(),
                "What are your biggest weaknesses and how do you work on improving them?",
                2
            ),
            generateInterviewQuestion(
                new ObjectId(),
                "Why are you interested in this field? What motivates you?",
                2
            ),
            // Add more HR questions...
        ];

        assessmentsToCreate.push({
            type: 'hr_practice',
            title: 'Comprehensive HR Interview Practice',
            description: 'Practice answering a variety of common HR interview questions (20 questions).',
            totalMarks: 40,
            duration: 60,
            startDate: pastStartDate,
            endDate: farFuture,
            isActive: true,
            sections: [{
                name: "Behavioral & Situational Questions",
                type: "interview",
                questions: hrQuestions,
                totalMarks: 40
            }]
        });

        // --- 2. Create SEPARATE Weekend Challenges for Saturday & Sunday ---
        console.log('Defining separate Saturday & Sunday weekend challenges...');

        // --- SATURDAY CHALLENGE ---
        const today = new Date(now); // Use a fresh copy of now
        const saturdayChallengeDate = new Date(today); // Start with today's date
        saturdayChallengeDate.setFullYear(2026); // Explicitly set year to 2026
        const currentDay = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        const daysUntilSaturday = (6 - currentDay + 7) % 7; // Days to add to reach next Sat
        saturdayChallengeDate.setDate(today.getDate() + daysUntilSaturday);
        saturdayChallengeDate.setHours(10, 0, 0, 0); // Saturday 10:00 AM Local Start
        const saturdayChallengeEnd = new Date(saturdayChallengeDate);
        saturdayChallengeEnd.setHours(saturdayChallengeDate.getHours() + 3); // Saturday 1:00 PM Local End (3-hour duration from start)

        assessmentsToCreate.push({
            type: 'weekend_challenge',
            title: `Weekend Challenge - Aptitude & Technical (Week ${calculatedWeekNumber})`,
            description: 'Comprehensive assessment covering aptitude and technical concepts.',
            totalMarks: 50,
            duration: 120,
            weekNumber: calculatedWeekNumber,
            startDate: saturdayChallengeDate,
            endDate: saturdayChallengeEnd,
            isActive: true,
            sections: [
                {
                    name: "Aptitude",
                    type: "mcq",
                    questions: aptitudeQuestions.slice(0, 10),
                    totalMarks: 25
                },
                {
                    name: "Technical",
                    type: "mixed",
                    questions: technicalQuestions.slice(0, 10),
                    totalMarks: 25
                }
            ]
        });
        console.log(`Defined Saturday Challenge: Start - ${saturdayChallengeDate.toISOString()}, End - ${saturdayChallengeEnd.toISOString()}`);

        // --- SUNDAY CHALLENGE ---
        const sundayChallengeDate = new Date(today); // Start with today's date
        sundayChallengeDate.setFullYear(2026); // Explicitly set year to 2026
        const daysUntilSunday = (7 - currentDay + 7) % 7; // Days to upcoming Sunday relative to *today*
        sundayChallengeDate.setDate(today.getDate() + daysUntilSunday);
         if (sundayChallengeDate.getDay() === saturdayChallengeDate.getDay() && sundayChallengeDate.getTime() <= saturdayChallengeEnd.getTime()) {
            // If Sunday calculation resulted in the same day as Saturday and the time is before/during Saturday's end,
            // add 7 days to get *next* Sunday. Handles running script on Sat/Sun morning.
            sundayChallengeDate.setDate(sundayChallengeDate.getDate() + 7);
        }
        sundayChallengeDate.setHours(10, 0, 0, 0); // Sunday 10:00 AM Local Start
        const sundayChallengeEnd = new Date(sundayChallengeDate);
        sundayChallengeEnd.setHours(sundayChallengeDate.getHours() + 3); // Sunday 1:00 PM Local End

        assessmentsToCreate.push({
            type: 'weekend_challenge',
            title: `Weekend Challenge - Coding & HR (Week ${calculatedWeekNumber})`,
            description: 'Comprehensive assessment covering coding and HR interview questions.',
            totalMarks: 50,
            duration: 120,
            weekNumber: calculatedWeekNumber,
            startDate: sundayChallengeDate,
            endDate: sundayChallengeEnd,
            isActive: true,
            sections: [
                {
                    name: "Coding",
                    type: "coding",
                    questions: [...arrayQuestions, ...stringQuestions].slice(0, 4),
                    totalMarks: 40
                },
                {
                    name: "HR Interview",
                    type: "interview",
                    questions: hrQuestions.slice(0, 2),
                    totalMarks: 10
                }
            ]
        });
        console.log(`Defined Sunday Challenge: Start - ${sundayChallengeDate.toISOString()}, End - ${sundayChallengeEnd.toISOString()}`);

        console.log('Attempting to insert assessments into database...');
        await Assessment.insertMany(assessmentsToCreate);
        console.log('Successfully populated assessments with detailed structure!');

        // Optional: Log all data to verify
        // const allNewAssessments = await Assessment.find({});
        // console.log("\nAll assessments currently in database:", JSON.stringify(allNewAssessments, null, 2));

    } catch (error) {
        console.error('Error during assessment population script:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB after population.');
    }
}

populateAssessments(); 