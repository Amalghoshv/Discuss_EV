const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { User, Post, Comment, Follow } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Search users
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q) {
      return res.json({ users: [] });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${q}%` } },
          { firstName: { [Op.iLike]: `%${q}%` } },
          { lastName: { [Op.iLike]: `%${q}%` } }
        ]
      },
      attributes: ['id', 'username', 'firstName', 'lastName', 'avatar', 'bio'],
      limit: parseInt(limit)
    });

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
});

// Get user profile
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Post,
          as: 'posts',
          where: { isArchived: false },
          required: false,
          limit: 10,
          order: [['createdAt', 'DESC']]
        },
        {
          model: User,
          as: 'followers',
          attributes: ['id'],
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'following',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user.getPublicProfile();
    userData.followerCount = user.followers.length;
    userData.followingCount = user.following.length;

    // Check if current user follows this user
    userData.isFollowing = false;
    if (currentUserId) {
      userData.isFollowing = user.followers.some(f => f.id === currentUserId);
    }

    // Clean up raw associations
    delete userData.followers;
    delete userData.following;

    res.json({ user: userData });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, bio, preferences, avatar } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      bio: bio || user.bio,
      preferences: preferences || user.preferences,
      avatar: avatar !== undefined ? avatar : user.avatar
    });

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    // The User model has a beforeUpdate hook that automatically hashes the password
    await user.update({ password: newPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Follow user
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const { id: followedId } = req.params;
    const followerId = req.user.id;

    if (followedId === followerId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findByPk(followedId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [follow, created] = await Follow.findOrCreate({
      where: { followerId, followedId }
    });

    if (!created) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Failed to follow user' });
  }
});

// Unfollow user
router.delete('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const { id: followedId } = req.params;
    const followerId = req.user.id;

    const follow = await Follow.findOne({
      where: { followerId, followedId }
    });

    if (!follow) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    await follow.destroy();

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Failed to unfollow user' });
  }
});

// Get user's posts
router.get('/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: posts } = await Post.findAndCountAll({
      where: {
        userId: id,
        isArchived: false
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalPosts: count
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Failed to fetch user posts' });
  }
});

// Admin only: Get all users
const { authorizeRoles } = require('../middleware/auth');
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;
