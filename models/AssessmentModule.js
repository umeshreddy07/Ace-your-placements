const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'text', 'code'], required: true },
    options: [String], // Only for MCQ
    correctAnswer: String, // Only for MCQ
    aiReview: { type: Boolean, default: false }, // For HR/Coding
    codeStarter: String // For coding questions (optional starter code)
});

const AssessmentModuleSchema = new mongoose.Schema({
    category: { type: String, enum: ['Aptitude', 'Technical', 'Coding', 'HR'], required: true },
    name: { type: String, required: true },
    description: { type: String },
    timerMinutes: { type: Number, default: 30 },
    questions: [QuestionSchema]
});

module.exports = mongoose.model('AssessmentModule', AssessmentModuleSchema); 