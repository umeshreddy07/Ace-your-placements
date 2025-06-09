const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    answer: String, // User's answer (text, code, or option)
    aiReview: {
        feedback: String,
        rating: Number,
        categories: {
            correctness: Number,
            complexity: Number,
            style: Number,
            security: Number,
            clarity: Number,
            relevance: Number,
            communication: Number,
            professionalism: Number,
            improvements: [String],
            suggestions: [String]
        },
        detailedAnalysis: String,
        timestamp: { type: Date, default: Date.now }
    },
    isCorrect: Boolean,
    marksAwarded: Number
});

const UserAssessmentSubmissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentModule', required: true },
    answers: [AnswerSchema],
    score: { type: Number, required: true },
    totalPossibleScore: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
    timeTaken: { type: Number, default: 0 }, // in seconds, with default value
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'completed'],
        default: 'pending'
    },
    aiReviewStatus: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'failed'],
        default: 'pending'
    },
    aiReviewError: String
});

// Index for faster queries
UserAssessmentSubmissionSchema.index({ userId: 1, moduleId: 1 });
UserAssessmentSubmissionSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('UserAssessmentSubmission', UserAssessmentSubmissionSchema); 