const asyncHandler = require('express-async-handler');
const Assessment = require('../models/Assessment');

// @desc    Get all assessments
// @route   GET /api/assessments
// @access  Public
const getAssessments = asyncHandler(async (req, res) => {
    const assessments = await Assessment.find({});
    res.json(assessments);
});

// @desc    Get single assessment by ID
// @route   GET /api/assessments/:id
// @access  Public
const getAssessmentById = asyncHandler(async (req, res) => {
    const assessment = await Assessment.findById(req.params.id);

    if (assessment) {
        res.json(assessment);
    } else {
        res.status(404).json({ message: 'Assessment not found' });
    }
});

// @desc    Create a new assessment
// @route   POST /api/assessments
// @access  Private (Admin)
const createAssessment = asyncHandler(async (req, res) => {
    const { title, description, type, duration, totalMarks, sections } = req.body;

    const assessment = new Assessment({
        title,
        description,
        type,
        duration,
        totalMarks,
        sections,
    });

    const createdAssessment = await assessment.save();
    res.status(201).json(createdAssessment);
});

module.exports = {
    getAssessments,
    getAssessmentById,
    createAssessment
}; 