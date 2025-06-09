const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');

// Get all assessments
router.get('/', auth, async (req, res) => {
    try {
        const assessments = await Assessment.find()
            .sort({ startDate: 1 })
            .select('-sections.questions.correctAnswer');
        console.log('Assessments fetched from DB:', assessments);
        res.json(assessments);
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ message: 'Error fetching assessments' });
    }
});

// Get a specific assessment
router.get('/:id', auth, async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id)
            .select('-sections.questions.correctAnswer');
        
        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        // Check if user has already submitted
        const submission = await Submission.findOne({
            assessment: req.params.id,
            user: req.user.userId
        });

        if (submission) {
            assessment.submission = submission;
        }

        res.json(assessment);
    } catch (error) {
        console.error('Error fetching assessment:', error);
        res.status(500).json({ message: 'Error fetching assessment' });
    }
});

// Submit an assessment
router.post('/:id/submit', auth, async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        // Check if assessment is still active
        const now = new Date();
        if (now < assessment.startDate || now > assessment.endDate) {
            return res.status(400).json({ message: 'Assessment is not currently active' });
        }

        // Check if user has already submitted
        const existingSubmission = await Submission.findOne({
            assessment: req.params.id,
            user: req.user.userId
        });

        if (existingSubmission) {
            return res.status(400).json({ message: 'You have already submitted this assessment' });
        }

        // Create new submission
        const submission = new Submission({
            assessment: req.params.id,
            user: req.user.userId,
            answers: req.body.answers,
            startTime: req.body.startTime,
            endTime: new Date()
        });

        await submission.save();
        res.status(201).json({ message: 'Assessment submitted successfully', submission });
    } catch (error) {
        console.error('Error submitting assessment:', error);
        res.status(500).json({ message: 'Error submitting assessment' });
    }
});

// Get submission results
router.get('/submissions/:id', auth, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('assessment')
            .populate('user', 'name email');

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Check if the user is authorized to view this submission
        if (submission.user._id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to view this submission' });
        }

        res.json(submission);
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ message: 'Error fetching submission' });
    }
});

module.exports = router; 