const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { User, Post, Report } = require('../models');

const router = express.Router();
const bcrypt = require('bcryptjs'); // added for bootstrapping

// --- Admin Bootstrap Hook ---
// Safely injects the first admin account into the database if NONE exist.
router.post('/bootstrap', async (req, res) => {
  try {
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount > 0) {
      return res.status(403).json({ message: 'An admin already exists. Bootstrap access denied.' });
    }

    const defaultPassword = 'Admin@123';
    // User model automatically hashes on beforeCreate hook, so we pass plain text
    const masterAdmin = await User.create({
      username: 'masteradmin',
      email: 'admin@discussev.com',
      password: defaultPassword,
      firstName: 'Master',
      lastName: 'Admin',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    res.status(201).json({
      message: 'Master Admin account initialized successfully!',
      credentials: {
        email: masterAdmin.email,
        password: defaultPassword,
        disclaimer: 'Please login and change this password immediately.'
      }
    });
  } catch (error) {
    console.error('Bootstrap Error:', error);
    res.status(500).json({ message: 'Failed to bootstrap admin account' });
  }
});

router.use(authenticateToken); // Shared authentication for remaining routes

// --- Moderation Queue ---
router.get('/reports', authorizeRoles('admin'), async (req, res) => {
  try {
    const reports = await Report.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// Log a report (Any Authenticated User)
router.post('/reports', async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    const report = await Report.create({
      reporterId: req.user.id,
      targetType,
      targetId,
      reason
    });
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit report' });
  }
});

// Resolve a report (Admin only)
router.put('/reports/:id/resolve', authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'resolved' or 'dismissed'
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    await report.update({ status });
    res.json({ message: 'Report status updated', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve report' });
  }
});

// --- User Management ---
// Deactivate or Ban a user
router.put('/users/:id/status', authorizeRoles('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({ isActive });
    res.json({ message: `User ${isActive ? 'activated' : 'deactivated/banned'}`, user: user.getPublicProfile() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// --- Post Moderation ---
// Force delete or archive a post
router.delete('/posts/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await post.update({ isArchived: true });
    res.json({ message: 'Post archived/deleted by admin' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

module.exports = router;
