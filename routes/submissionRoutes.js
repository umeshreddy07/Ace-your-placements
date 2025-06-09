const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { 
    startAssessmentSubmission,
    submitAssessmentAnswers,
    getSubmissionById,
    getSubmissionByAssessmentAndUser,
    getSubmissionResults
} = require('../controllers/submissionController');

// Route to start a new assessment submission
router.post('/:assessmentId/start', verifyToken, startAssessmentSubmission);

// Route to submit answers for an ongoing assessment
router.post('/:submissionId/submit', verifyToken, submitAssessmentAnswers);

// Route to get a specific submission by its ID
router.get('/:submissionId', verifyToken, getSubmissionById);

// Route to get an in-progress or completed submission for a specific assessment and user
router.get('/byAssessment/:assessmentId', verifyToken, getSubmissionByAssessmentAndUser);

// Route to get the results of a submitted assessment
router.get('/:submissionId/results', verifyToken, getSubmissionResults);

module.exports = router; 