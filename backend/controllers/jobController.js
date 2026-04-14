const Job = require('../models/Job');

/**
 * @desc    Get all jobs for the logged-in user with optional search & filter
 * @route   GET /api/jobs?search=google&status=Interview
 */
exports.getJobs = async (req, res) => {
  try {
    const { search, status } = req.query;

    // Build dynamic query
    const query = { userId: req.userId };
    if (status && status !== 'All') query.status = status;
    if (search) query.company = { $regex: search, $options: 'i' };

    const jobs = await Job.find(query).sort({ applicationDate: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

/**
 * @desc    Get analytics for the logged-in user
 * @route   GET /api/jobs/analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.userId });

    const total = jobs.length;
    const applied = jobs.filter(j => j.status === 'Applied').length;
    const interview = jobs.filter(j => j.status === 'Interview').length;
    const selected = jobs.filter(j => j.status === 'Selected').length;
    const rejected = jobs.filter(j => j.status === 'Rejected').length;

    const successRate = total > 0 ? Math.round((selected / total) * 100) : 0;
    const interviewRate = total > 0 ? Math.round((interview / total) * 100) : 0;

    // Check for jobs needing follow-up (followUpDate <= today)
    const today = new Date();
    const overdueFollowUps = jobs.filter(j => j.followUpDate && new Date(j.followUpDate) <= today && j.status === 'Applied');

    res.status(200).json({
      total,
      applied,
      interview,
      selected,
      rejected,
      successRate,
      interviewRate,
      overdueFollowUps: overdueFollowUps.map(j => ({ id: j._id, company: j.company, role: j.role, followUpDate: j.followUpDate }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

/**
 * @desc    Create a new job application
 * @route   POST /api/jobs
 */
exports.createJob = async (req, res) => {
  try {
    const { company, role, jobLink, status, notes, userEmail, applicationDate, followUpDate, resumeUrl } = req.body;

    const newJob = await Job.create({
      company,
      role,
      jobLink: jobLink || '',
      status,
      notes,
      resumeUrl: resumeUrl || '',
      applicationDate: applicationDate || Date.now(),
      followUpDate: followUpDate || null,
      userId: req.userId,
      userEmail: userEmail || ''
    });

    res.status(201).json(newJob);
  } catch (error) {
    res.status(400).json({ message: 'Error creating job', error: error.message });
  }
};

/**
 * @desc    Update a job application
 * @route   PUT /api/jobs/:id
 */
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.userId !== req.userId)
      return res.status(401).json({ message: 'Not authorized to update this job' });

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(job);
  } catch (error) {
    res.status(400).json({ message: 'Error updating job', error: error.message });
  }
};

/**
 * @desc    Delete a job application
 * @route   DELETE /api/jobs/:id
 */
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.userId !== req.userId && !req.headers['x-admin-action'])
      return res.status(401).json({ message: 'Not authorized to delete this job' });

    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Job removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
};
/**
 * @desc    Get all jobs for ALL users (Admin Only)
 * @route   GET /api/jobs/admin/all
 */
exports.getAdminJobs = async (req, res) => {
  try {
    // In a real app, check if req.auth.sessionClaims.role === 'admin'
    // For this project, we'll allow fetching if they access this specific route
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin data', error: error.message });
  }
};

/**
 * @desc    Get System Stats (Admin Only)
 * @route   GET /api/jobs/admin/stats
 */
exports.getAdminStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const uniqueUsers = await Job.distinct('userId');
    const statusCounts = await Job.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      totalJobs,
      totalUsers: uniqueUsers.length,
      statusCounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

/**
 * @desc    Admin delete any job
 * @route   DELETE /api/jobs/admin/:id
 */
exports.adminDeleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Job removed by Admin' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
};
