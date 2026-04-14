const express = require('express');
const router = express.Router();
const { getJobs, createJob, updateJob, deleteJob, getAnalytics, getAdminJobs, getAdminStats, adminDeleteJob } = require('../controllers/jobController');
const { ensureAuth } = require('../middleware/auth');

// Admin routes
// ./api/jobs
router.get('/admin/all', ensureAuth, getAdminJobs);
router.get('/admin/stats', ensureAuth, getAdminStats);
router.delete('/admin/:id', ensureAuth, adminDeleteJob);

// Analytics route (must be before /:id)
router.get('/analytics', ensureAuth, getAnalytics);

// Main CRUD routes
router.route('/')
  .get(ensureAuth, getJobs)
  .post(ensureAuth, createJob);

router.route('/:id')
  .put(ensureAuth, updateJob)
  .delete(ensureAuth, deleteJob);

module.exports = router;
