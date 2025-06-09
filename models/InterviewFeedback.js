const mongoose = require('mongoose');

const interviewFeedbackSchema = new mongoose.Schema({
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
    submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
        required: true
    },
    sections: [{
        name: {
            type: String,
            required: true
        },
        score: {
            type: Number,
            required: true
        },
        maxScore: {
            type: Number,
            required: true
        },
        feedback: {
            strengths: [String],
            areasForImprovement: [String],
            detailedFeedback: String
        }
    }],
    overallScore: {
        type: Number,
        required: true
    },
    maxScore: {
        type: Number,
        required: true
    },
    aiFeedback: {
        communication: {
            rating: Number,
            feedback: String
        },
        problemSolving: {
            rating: Number,
            feedback: String
        },
        technicalKnowledge: {
            rating: Number,
            feedback: String
        },
        confidence: {
            rating: Number,
            feedback: String
        },
        overallAssessment: String,
        recommendations: [String]
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
interviewFeedbackSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
interviewFeedbackSchema.index({ user: 1, assessment: 1 });
interviewFeedbackSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewFeedback', interviewFeedbackSchema); 