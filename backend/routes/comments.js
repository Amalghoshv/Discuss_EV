const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { Comment, User, Post } = require('../models');

const router = express.Router();

// Validation rules
const commentValidation = [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters')
    .trim(),
  body('postId')
    .isUUID()
    .withMessage('Valid post ID is required'),
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Valid parent comment ID is required')
];

// Create comment
router.post('/', authenticateToken, commentValidation, async (req, res) => {
  try {
    const { content, postId, parentId } = req.body;
    const userId = req.user.id;

    // Verify post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      content,
      postId,
      parentId,
      userId
    });

    // Increment comment count on post
    await post.increment('commentCount');

    // If it's a reply, increment reply count on parent comment
    if (parentId) {
      await Comment.increment('replyCount', { where: { id: parentId } });
    }

    const createdComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        }
      ]
    });

    res.status(201).json({
      message: 'Comment created successfully',
      comment: createdComment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Failed to create comment' });
  }
});

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: {
        postId,
        parentId: null, // Only top-level comments
        isDeleted: false
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          where: { isDeleted: false },
          required: false,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalComments: count
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// Update comment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    // Store edit history
    const editHistory = comment.editHistory || [];
    editHistory.push({
      content: comment.content,
      editedAt: new Date()
    });

    await comment.update({
      content,
      isEdited: true,
      editHistory
    });

    res.json({ message: 'Comment updated successfully' });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Failed to update comment' });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user can delete (author, moderator, or admin)
    if (comment.userId !== userId && !['moderator', 'admin'].includes(userRole)) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.update({
      isDeleted: true,
      deletedAt: new Date()
    });

    // Decrement comment count on post
    await Post.decrement('commentCount', { where: { id: comment.postId } });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

module.exports = router;
