const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Company name is required']
  },
  role: {
    type: String,
    required: [true, 'Job role is required']
  },
  jobLink: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  userId: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    default: ''
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  followUpDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  resumeUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
