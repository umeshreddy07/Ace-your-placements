const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true
    },
    answers: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        answer: mongoose.Schema.Types.Mixed, // Can be string for MCQ, object for coding
        isCorrect: Boolean,
        marksObtained: Number,
        feedback: String,
        // For coding submissions
        code: String,
        language: String,
        executionTime: Number,
        memoryUsed: Number,
        testCasesPassed: Number,
        totalTestCases: Number,
        aiFeedback: {
            suggestions: [String],
            improvements: [String],
            rating: Number,
            detailedAnalysis: String
        }
    }],
    totalMarks: {
        type: Number,
        required: true
    },
    marksObtained: {
        type: Number,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'abandoned'],
        default: 'in_progress'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
submissionSchema.index({ user: 1, assessment: 1 });
submissionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema); 