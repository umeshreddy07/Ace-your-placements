const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.appleId;
    }
  },
  name: {
    type: String,
    required: function() {
      return !this.googleId && !this.appleId;
    }
  },
  leetcodeUsername: { type: String, trim: true, default: null },
  school: { type: String, default: "AYP ACADEMY" },
  location: { type: String, default: "HYDERABAD" },
  profilePicture: { type: String, default: 'static/default-profile.jpg' },
  hackerrankUsername: { type: String },
  completedSubjects: {
    type: Map,
    of: [String],
    default: {
      aptitude: [],
      coding: [],
      technical: [],
      roadmap: [],
      hr_interview: [],
      logical_reasoning: [],
      verbal_ability: []
    }
  },
  progress: {
    type: Map,
    of: Number,
    default: {
      aptitude: 0,
      coding: 0,
      technical: 0,
      roadmap: 0,
      hr_interview: 0,
      logical_reasoning: 0,
      verbal_ability: 0
    }
  },
  loginActivity: {
    type: Map,
    of: Number,
    default: new Map()
  },
  lastLoginAt: {
    type: Date
  },
  phoneNumber: { type: String, unique: true, sparse: true },
  googleId: { type: String, unique: true, sparse: true },
  appleId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User; 