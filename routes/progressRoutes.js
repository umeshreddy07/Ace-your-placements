const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

const allCategories = [
    'aptitude', 'coding', 'technical', 'roadmap', 'hr_interview', 'logical_reasoning', 'verbal_ability'
];

function ensureAllCategories(subjects, progress) {
    allCategories.forEach(cat => {
        if (!Array.isArray(subjects[cat])) subjects[cat] = [];
        if (progress && typeof progress[cat] !== 'number') progress[cat] = 0;
    });
}

function categorizeSubtopic(subtopic) {
    if (subtopic.startsWith('aptitude_')) return 'aptitude';
    if (subtopic.startsWith('coding_')) return 'coding';
    if (subtopic.startsWith('technical_')) return 'technical';
    if (subtopic.startsWith('roadmap_')) return 'roadmap';
    if (subtopic.startsWith('hr_interview_')) return 'hr_interview';
    if (subtopic.startsWith('logical_reasoning_')) return 'logical_reasoning';
    if (subtopic.startsWith('verbal_ability_')) return 'verbal_ability';
    return null;
}

const calculateProgress = (completedSubjectsMap) => {
    const moduleTotals = {
        aptitude: 20, coding: 25, technical: 15, roadmap: 10, hr_interview: 7,
        logical_reasoning: 10, verbal_ability: 10
    };
    const progressResult = {};
    const allCategoriesForProgress = ['aptitude', 'coding', 'technical', 'roadmap', 'hr_interview', 'logical_reasoning', 'verbal_ability'];
    allCategoriesForProgress.forEach(cat => {
        progressResult[cat] = 0;
    });
    for (const moduleName in moduleTotals) {
        if (completedSubjectsMap) {
            const completedArray = completedSubjectsMap instanceof Map
                                   ? completedSubjectsMap.get(moduleName)
                                   : completedSubjectsMap[moduleName];
            const completedInModule = Array.isArray(completedArray) ? completedArray.length : 0;
        const totalInModule = moduleTotals[moduleName];
        if (totalInModule > 0) {
                progressResult[moduleName] = Math.round((completedInModule / totalInModule) * 100);
            }
        }
    }
    return progressResult;
};

// @route   GET /api/users/me/progress
// @desc    Get current user's progress
// @access  Private
router.get('/me/progress', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const allCategories = ['aptitude', 'coding', 'technical', 'roadmap', 'hr_interview', 'logical_reasoning', 'verbal_ability'];
        let needsSave = false;
        // Ensure completedSubjects Map exists and has all categories
        if (!user.completedSubjects) {
            user.completedSubjects = new Map();
            needsSave = true;
        }
        allCategories.forEach(cat => {
            if (!user.completedSubjects.has(cat) || !Array.isArray(user.completedSubjects.get(cat))) {
                user.completedSubjects.set(cat, []);
                needsSave = true;
            }
        });
        // Calculate progress and ensure progress Map has all categories
        const currentProgressObject = calculateProgress(user.completedSubjects);
        if (!user.progress) {
            user.progress = new Map();
            needsSave = true;
        }
        allCategories.forEach(cat => {
            const newProgressValue = currentProgressObject[cat] !== undefined ? currentProgressObject[cat] : 0;
            if (!user.progress.has(cat) || user.progress.get(cat) !== newProgressValue) {
                 user.progress.set(cat, newProgressValue);
                 needsSave = true;
            }
        });
        if (needsSave) {
            await user.save();
            console.log(`User ${user.email} structure initialized/updated on GET /me/progress.`);
        }
        const completedSubjectsObject = Object.fromEntries(user.completedSubjects);
        const progressObjectToRespondWith = Object.fromEntries(user.progress);
        res.json({
            completedSubjects: completedSubjectsObject,
            progress: progressObjectToRespondWith
        });
    } catch (err) {
        console.error('Server error in GET /me/progress:', err.message, err.stack);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// @route   POST /api/users/me/progress
// @desc    Update user's progress for a subtopic
// @access  Private
router.post('/me/progress', auth, async (req, res) => {
    try {
        const { subtopicId, completed } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const category = categorizeSubtopic(subtopicId);
        if (!category) return res.status(400).json({ message: 'Invalid subtopic ID category' });
        if (!user.completedSubjects) user.completedSubjects = new Map();
        if (!user.completedSubjects.has(category) || !Array.isArray(user.completedSubjects.get(category))) {
            user.completedSubjects.set(category, []);
        }
        let completedInCategory = user.completedSubjects.get(category);
        if (completed) {
            if (!completedInCategory.includes(subtopicId)) {
                completedInCategory.push(subtopicId);
            }
        } else {
            completedInCategory = completedInCategory.filter(id => id !== subtopicId);
            user.completedSubjects.set(category, completedInCategory);
        }
        const currentProgressObject = calculateProgress(user.completedSubjects);
        user.progress = new Map(Object.entries(currentProgressObject));
        await user.save();
        const completedSubjectsObject = Object.fromEntries(user.completedSubjects);
        res.json({
            completedSubjects: completedSubjectsObject,
            progress: currentProgressObject
        });
    } catch (err) {
        console.error('Server error in POST /me/progress:', err.message, err.stack);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router; 