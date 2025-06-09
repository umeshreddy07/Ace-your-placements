const mongoose = require('mongoose');

const codeReviewSchema = new mongoose.Schema({
    submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    aiReview: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        suggestions: [{
            type: String
        }],
        improvements: [{
            type: String
        }],
        detailedAnalysis: String,
        performanceMetrics: {
            timeComplexity: String,
            spaceComplexity: String,
            executionTime: Number,
            memoryUsage: Number
        },
        bestPractices: [{
            type: String
        }],
        securityIssues: [{
            type: String
        }]
    },
    userFeedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comments: String,
        helpful: {
            type: Boolean,
            default: false
        }
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
codeReviewSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
codeReviewSchema.index({ submission: 1, user: 1 });
codeReviewSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('CodeReview', codeReviewSchema); 