const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { User, Post, Comment, Reaction, Tag } = require('../models');

const router = express.Router();
router.use(authenticateToken, authorizeRoles('admin'));

router.get('/engagement', async (req, res) => {
  try {
    const totalPosts = await Post.count();
    const totalComments = await Comment.count();
    const totalReactions = await Reaction.count();
    
    // Simulate real-time engagement score based on raw counts
    const engagementScore = (totalReactions * 2) + (totalComments * 5) + (totalPosts * 10);

    res.json({ 
      engagement: { 
        totalPosts, 
        totalComments, 
        totalReactions,
        engagementScore 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch engagement stats' });
  }
});

router.get('/tags/popular', async (req, res) => {
  try {
    // Return all tags if small, prioritizing those existing in DB
    const tags = await Tag.findAll({ limit: 20 });
    res.json({ popularTags: tags });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tags stats' });
  }
});

router.get('/growth', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const verifiedUsers = await User.count({ where: { isVerified: true } });

    res.json({ 
      growth: { 
        totalUsers, 
        activeUsers,
        verifiedUsers
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch growth stats' });
  }
});

module.exports = router;
