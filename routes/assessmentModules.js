const express = require('express');
const router = express.Router();
const AssessmentModule = require('../models/AssessmentModule');
const auth = require('../middleware/auth'); // Use your existing auth middleware if needed
const mongoose = require('mongoose');

// GET /api/assessment/modules - List all modules grouped by category
router.get('/modules', async (req, res) => {
  try {
    const modules = await AssessmentModule.find({}, 'name description category timerMinutes').lean();
    console.log("Backend fetched (lean) modules:", modules);
    // Group by category
    const grouped = modules.reduce((acc, mod) => {
      const category = mod.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push({
        _id: mod._id,
        name: mod.name,
        description: mod.description,
        timerMinutes: mod.timerMinutes
      });
      return acc;
    }, {});
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching modules' });
  }
});

// GET /api/assessment/module/:id - Get questions for a module
router.get('/module/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Received request for module ID: ${id}`);
  try {
    const objectId = new mongoose.Types.ObjectId(id);
    const mod = await AssessmentModule.findById(objectId);
    console.log(`Result of findById for ${id}:`, mod ? 'Found' : 'Not Found');
    if (!mod) {
      console.log(`Module with ID ${id} not found in DB.`);
      return res.status(404).json({ message: 'Module not found' });
    }
    console.log(`Module ${mod.name} found. Sending questions.`);
    res.json(mod);
  } catch (err) {
    console.error(`Error fetching module ${id}:`, err); // Log the actual error
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 