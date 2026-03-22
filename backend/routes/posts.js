const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  getTrendingPosts,
  getFeedPosts
} = require('../controllers/postController');

const router = express.Router();

// Validation rules
const postValidation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),
  body('content')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters')
    .trim(),
  body('type')
    .optional()
    .isIn(['question', 'article', 'discussion', 'news', 'review'])
    .withMessage('Invalid post type'),
  body('category')
    .optional()
    .isIn([
      'charging-stations',
      'maintenance',
      'news',
      'technology',
      'policy',
      'reviews',
      'general',
      'troubleshooting'
    ])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// Routes
router.post('/', authenticateToken, postValidation, createPost);
router.get('/', optionalAuth, getPosts);
router.get('/trending', optionalAuth, getTrendingPosts);
router.get('/feed', authenticateToken, getFeedPosts);
router.get('/:id', optionalAuth, getPostById);
router.put('/:id', authenticateToken, postValidation, updatePost);
router.delete('/:id', authenticateToken, deletePost);
router.post('/:id/like', authenticateToken, likePost);

module.exports = router;
