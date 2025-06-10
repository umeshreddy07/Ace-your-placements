const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function() { return !this.googleId; }
  },
  name: { type: String, required: true },
  leetcodeUsername: { type: String, trim: true, default: null },
  school: { type: String, default: "AYP ACADEMY" },
  location: { type: String, default: "HYDERABAD" },
  profilePicture: { type: String, default: 'static/default-profile.jpg' },
  hackerrankUsername: { type: String },
  completedSubjects: {
    type: Map,
    of: [String],
    default: () => new Map([
      ['aptitude', []],
      ['coding', []],
      ['technical', []],
      ['hr_interview', []]
    ])
  },
  progress: {
    type: Map,
    of: Number,
    default: () => new Map([
      ['aptitude', 0],
      ['coding', 0],
      ['technical', 0],
      ['hr_interview', 0],
      ['overall', 0]
    ])
  },
  loginActivity: {
    type: Map,
    of: Number,
    default: () => new Map()
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