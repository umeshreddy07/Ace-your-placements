const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['coding', 'technical', 'hr', 'weekly'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    totalMarks: {
        type: Number,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    weekNumber: {
        type: Number,
        required: function() {
            return this.type === 'weekly';
        }
    },
    startDate: {
        type: Date,
        required: true,
        default: function() {
            if (this.type === 'weekly') {
                // Set to next Saturday at 10:00 AM
                const nextSaturday = new Date();
                nextSaturday.setDate(nextSaturday.getDate() + (6 + 7 - nextSaturday.getDay()) % 7);
                nextSaturday.setHours(10, 0, 0, 0);
                return nextSaturday;
            }
            return undefined;
        }
    },
    endDate: {
        type: Date,
        required: true,
        default: function() {
            if (this.type === 'weekly') {
                // Set to next Sunday at 10:00 PM
                const nextSunday = new Date();
                nextSunday.setDate(nextSunday.getDate() + (7 + 7 - nextSunday.getDay()) % 7);
                nextSunday.setHours(22, 0, 0, 0);
                return nextSunday;
            }
            return undefined;
        }
    },
    sections: [{
        name: String,
        type: {
            type: String,
            enum: ['mcq', 'coding', 'fill_blank', 'interview'],
            required: true
        },
        questions: [{
            question: String,
            type: {
                type: String,
                enum: ['mcq', 'coding', 'fill_blank', 'interview'],
                required: true
            },
            options: [String], // For MCQ
            correctAnswer: String,
            marks: Number,
            explanation: String,
            // For coding questions
            testCases: [{
                input: String,
                expectedOutput: String,
                isHidden: Boolean
            }],
            // For interview questions
            sampleAnswer: String,
            keyPoints: [String]
        }],
        totalMarks: Number
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
assessmentSchema.index({ type: 1, weekNumber: 1 });
assessmentSchema.index({ startDate: 1, endDate: 1 });
assessmentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema); 