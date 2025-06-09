const asyncHandler = require('express-async-handler');
const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');

// @desc    Start a new assessment submission
// @route   POST /api/submissions/:assessmentId/start
// @access  Private
const startAssessmentSubmission = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params;
    const userId = req.user.userId; // Assuming user ID is available from auth middleware

    // Check if an active submission already exists for this user and assessment
    const existingSubmission = await Submission.findOne({
        user: userId,
        assessment: assessmentId,
        status: 'in_progress'
    });

    if (existingSubmission) {
        res.status(400).json({ message: 'You have already started this assessment', submission: existingSubmission });
        return;
    }

    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
        res.status(404).json({ message: 'Assessment not found' });
        return;
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + assessment.duration * 60 * 1000); // Add duration in milliseconds

    const submission = new Submission({
        user: userId,
        assessment: assessmentId,
        startTime,
        endTime,
        status: 'in_progress',
        answers: [] // Initialize with empty answers
    });

    const createdSubmission = await submission.save();
    res.status(201).json(createdSubmission);
});

// @desc    Submit answers for an ongoing assessment
// @route   POST /api/submissions/:submissionId/submit
// @access  Private
const submitAssessmentAnswers = asyncHandler(async (req, res) => {
    const { submissionId } = req.params;
    const { answers } = req.body;
    const userId = req.user.userId;

    const submission = await Submission.findOne({ _id: submissionId, user: userId });

    if (!submission) {
        res.status(404).json({ message: 'Submission not found or not authorized' });
        return;
    }

    if (submission.status === 'completed' || submission.status === 'graded') {
        res.status(400).json({ message: 'You have already submitted this assessment' });
        return;
    }

    submission.answers = answers;
    submission.endTime = new Date(); // Record end time on submission
    submission.status = 'completed';

    // TODO: Implement grading logic here
    // For now, we'll just save answers and mark as completed

    const updatedSubmission = await submission.save();
    res.json(updatedSubmission);
});

// @desc    Get a specific submission by ID
// @route   GET /api/submissions/:submissionId
// @access  Private
const getSubmissionById = asyncHandler(async (req, res) => {
    const { submissionId } = req.params;
    const userId = req.user.userId;

    const submission = await Submission.findOne({ _id: submissionId, user: userId })
        .populate('assessment', 'title description type duration totalMarks sections');

    if (!submission) {
        res.status(404).json({ message: 'Submission not found or not authorized' });
        return;
    }

    res.json(submission);
});

// @desc    Get an in-progress or completed submission for a specific assessment and user
// @route   GET /api/submissions/byAssessment/:assessmentId
// @access  Private
const getSubmissionByAssessmentAndUser = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params;
    const userId = req.user.userId;

    const submission = await Submission.findOne({
        user: userId,
        assessment: assessmentId,
    }).populate('assessment', 'title description type duration totalMarks sections');

    if (!submission) {
        res.status(404).json({ message: 'Submission not found for this assessment and user' });
        return;
    }

    res.json(submission);
});

// @desc    Get the results of a submitted assessment
// @route   GET /api/submissions/:submissionId/results
// @access  Private
const getSubmissionResults = asyncHandler(async (req, res) => {
    const { submissionId } = req.params;
    const userId = req.user.userId;

    const submission = await Submission.findOne({ _id: submissionId, user: userId });

    if (!submission) {
        res.status(404).json({ message: 'Submission not found or not authorized' });
        return;
    }

    if (submission.status !== 'completed' && submission.status !== 'graded') {
        res.status(400).json({ message: 'Assessment not yet completed or graded' });
        return;
    }

    // TODO: More detailed results processing and AI review integration here
    // For now, return basic submission data
    res.json(submission);
});

module.exports = {
    startAssessmentSubmission,
    submitAssessmentAnswers,
    getSubmissionById,
    getSubmissionByAssessmentAndUser,
    getSubmissionResults,
}; 