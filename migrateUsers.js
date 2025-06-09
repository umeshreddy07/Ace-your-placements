const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed

// Helper to categorize subtopics
function categorize(subtopic) {
  if (subtopic.startsWith('aptitude_')) return 'aptitude';
  if (subtopic.startsWith('coding_')) return 'coding';
  if (subtopic.startsWith('technical_')) return 'technical';
  if (subtopic.startsWith('roadmap_')) return 'roadmap';
  if (subtopic.startsWith('hr_interview_')) return 'hr_interview';
  return 'other';
}

async function migrate() {
  await mongoose.connect('mongodb://localhost:27017/ace_your_placement');

  const users = await User.find({ completedSubtopics: { $exists: true } });
  console.log(`Found ${users.length} users to migrate.`);

  for (const user of users) {
    // Build the new completedSubjects object
    const completedSubjects = {
      aptitude: [],
      coding: [],
      technical: [],
      roadmap: [],
      hr_interview: []
    };

    if (Array.isArray(user.completedSubtopics)) {
      for (const sub of user.completedSubtopics) {
        const cat = categorize(sub);
        if (completedSubjects[cat]) {
          completedSubjects[cat].push(sub);
        }
      }
    }

    // Debug log to verify migration
    console.log('Migrating:', user.email, completedSubjects);

    // Use set() for Map fields to ensure Mongoose compatibility
    user.set('completedSubjects', completedSubjects);

    // Set default values if missing
    if (!user.school) user.school = "AYP ACADEMY";
    if (!user.location) user.location = "HYDERABAD";

    // Remove the old field
    user.set('completedSubtopics', undefined);

    await user.save();
    console.log(`Migrated user: ${user.email}`);
  }

  // Remove completedSubtopics from all users in case any remain
  await User.updateMany({}, { $unset: { completedSubtopics: "" } });
  console.log('Removed completedSubtopics from all users.');

  console.log('Migration complete!');
  mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration error:', err);
});