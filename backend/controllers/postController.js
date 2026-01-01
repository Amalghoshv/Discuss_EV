const { validationResult } = require('express-validator');
const { Post, User, Comment, Reaction } = require('../models');
const { Op } = require('sequelize');

const createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, type, category, tags } = req.body;
    const userId = req.user.id;

    const post = await Post.create({
      title,
      content,
      type,
      category,
      tags: tags || [],
      userId
    });

    // Fetch the created post with author information
    const createdPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        }
      ]
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: createdPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

const getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      tags
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { isArchived: false };

    // Add filters
    if (category) whereClause.category = category;
    if (type) whereClause.type = type;
    if (tags) {
      whereClause.tags = {
        [Op.contains]: Array.isArray(tags) ? tags : [tags]
      };
    }
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id'],
          limit: 1,
          order: [['createdAt', 'DESC']]
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalPosts: count,
        hasNext: offset + posts.length < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar', 'bio']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
            }
          ],
          where: { isDeleted: false },
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    await post.increment('viewCount');

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user can edit (author, moderator, or admin)
    if (post.userId !== userId && !['moderator', 'admin'].includes(userRole)) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    const { title, content, type, category, tags } = req.body;
    
    await post.update({
      title: title || post.title,
      content: content || post.content,
      type: type || post.type,
      category: category || post.category,
      tags: tags || post.tags
    });

    const updatedPost = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        }
      ]
    });

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Failed to update post' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user can delete (author, moderator, or admin)
    if (post.userId !== userId && !['moderator', 'admin'].includes(userRole)) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.destroy();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { type = 'like' } = req.body;

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already reacted
    const existingReaction = await Reaction.findOne({
      where: {
        userId,
        targetId: id,
        targetType: 'post'
      }
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction if same type
        await existingReaction.destroy();
        await post.decrement('likeCount');
        return res.json({ message: 'Reaction removed', liked: false });
      } else {
        // Update reaction type
        await existingReaction.update({ type });
        return res.json({ message: 'Reaction updated', liked: true, type });
      }
    } else {
      // Create new reaction
      await Reaction.create({
        userId,
        targetId: id,
        targetType: 'post',
        type
      });
      await post.increment('likeCount');
      return res.json({ message: 'Post liked', liked: true, type });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to like post' });
  }
};

const getTrendingPosts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const posts = await Post.findAll({
      where: { isArchived: false },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        }
      ],
      order: [
        ['likeCount', 'DESC'],
        ['viewCount', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit)
    });

    res.json({ posts });
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({ message: 'Failed to fetch trending posts' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  getTrendingPosts
};
