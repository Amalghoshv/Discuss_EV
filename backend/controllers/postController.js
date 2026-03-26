const { validationResult } = require('express-validator');
const { Post, User, Comment, Reaction, Tag, PostTag, Notification } = require('../models');
const { Op } = require('sequelize');

const handleTags = async (post, tags) => {
  if (!tags || !Array.isArray(tags)) return;

  const tagInstances = await Promise.all(
    tags.map(async (tagName) => {
      const [tag] = await Tag.findOrCreate({
        where: { name: tagName.toLowerCase().trim() }
      });
      await tag.increment('usageCount');
      return tag;
    })
  );

  await post.setTagList(tagInstances);
};

const createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, type, category, tags, images } = req.body;
    const userId = req.user.id;

    const post = await Post.create({
      title,
      content,
      type,
      category,
      images: images || [],
      userId
    });

    // Handle relational tags
    if (tags && tags.length > 0) {
      await handleTags(post, tags);
    }

    // Fetch the created post with author information and tags
    const createdPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Tag,
          as: 'tagList',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
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
      search: searchParam,
      q,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      tags
    } = req.query;

    const search = searchParam || q;

    const offset = (page - 1) * limit;
    const whereClause = { isArchived: false };

    // Add filters
    if (category) whereClause.category = category;
    if (type) whereClause.type = type;

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const include = [
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
      },
      {
        model: Tag,
        as: 'tagList',
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      },
      {
        model: Reaction,
        as: 'reactions',
        where: req.user ? { userId: req.user.id } : { userId: null },
        required: false,
        attributes: ['type']
      }
    ];

    // Filter by tags if provided
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      include.push({
        model: Tag,
        as: 'tagList',
        where: {
          name: { [Op.in]: tagArray.map(t => t.toLowerCase()) }
        },
        through: { attributes: [] }
      });
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      include,
      distinct: true, // Required for proper count when including many-to-many
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
          model: Tag,
          as: 'tagList',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        },
        {
          model: Reaction,
          as: 'reactions',
          where: req.user ? { userId: req.user.id } : { userId: null },
          required: false,
          attributes: ['type']
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
          required: false,
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

    const { title, content, type, category, tags, images } = req.body;

    await post.update({
      title: title || post.title,
      content: content || post.content,
      type: type || post.type,
      category: category || post.category,
      images: images || post.images
    });

    // Update tags
    if (tags) {
      await handleTags(post, tags);
    }

    const updatedPost = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Tag,
          as: 'tagList',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        },
        {
          model: Reaction,
          as: 'reactions',
          where: req.user ? { userId: req.user.id } : { userId: null },
          required: false,
          attributes: ['type']
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
      const oldType = existingReaction.type;
      
      if (oldType === type) {
        // Remove reaction if same type
        await existingReaction.destroy();
        
        // Decrement the correct counter
        if (oldType === 'like') await post.decrement('likeCount');
        if (oldType === 'dislike') await post.decrement('dislikeCount');
        
        return res.json({ 
          message: 'Reaction removed', 
          liked: false,
          likeCount: post.likeCount,
          dislikeCount: post.dislikeCount
        });
      } else {
        // Update reaction type
        await existingReaction.update({ type });
        
        // Update counters: decrement old, increment new
        if (oldType === 'like') await post.decrement('likeCount');
        if (oldType === 'dislike') await post.decrement('dislikeCount');
        
        if (type === 'like') await post.increment('likeCount');
        if (type === 'dislike') await post.increment('dislikeCount');
        
        // Reload post to get updated counts
        await post.reload();
        
        return res.json({ 
          message: 'Reaction updated', 
          liked: type === 'like', 
          type,
          likeCount: post.likeCount,
          dislikeCount: post.dislikeCount
        });
      }
    } else {
      // Create new reaction
      await Reaction.create({
        userId,
        targetId: id,
        targetType: 'post',
        type
      });
      
      // Increment the correct counter
      if (type === 'like') await post.increment('likeCount');
      if (type === 'dislike') await post.increment('dislikeCount');

      // Reload post to get updated counts
      await post.reload();

      // Notify post author (skip self-likes, and only for 'like' type usually)
      if (post.userId !== userId && type === 'like') {
        try {
          const liker = await User.findByPk(userId, {
            attributes: ['firstName', 'lastName']
          });
          const shortTitle = post.title.length > 50
            ? post.title.slice(0, 50) + '...'
            : post.title;
          await Notification.create({
            userId: post.userId,
            fromUserId: userId,
            postId: post.id,
            type: 'reaction',
            title: 'Someone liked your post',
            message: `${liker.firstName} ${liker.lastName} liked "${shortTitle}"`,
            metadata: { postId: post.id }
          });
        } catch (notifErr) {
          console.error('Notification creation error (like):', notifErr);
        }
      }

      return res.json({ 
        message: type === 'like' ? 'Post liked' : 'Post disliked', 
        liked: type === 'like', 
        type,
        likeCount: post.likeCount,
        dislikeCount: post.dislikeCount
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to react to post' });
  }
};

const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(userId, {
      include: [{ model: User, as: 'following', attributes: ['id'], through: { attributes: [] } }]
    });

    const followingIds = user.following ? user.following.map(f => f.id) : [];

    // Fallback to trending if user doesn't follow anyone yet
    if (followingIds.length === 0) {
      return getTrendingPosts(req, res);
    }

    const posts = await Post.findAll({
      where: {
        userId: { [Op.in]: followingIds },
        isArchived: false
      },
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'firstName', 'lastName', 'avatar'] },
        { model: Tag, as: 'tagList', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
        {
          model: Reaction,
          as: 'reactions',
          where: { userId: userId },
          required: false,
          attributes: ['type']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ posts });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Failed to fetch feed' });
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
        },
        {
          model: Tag,
          as: 'tagList',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        },
        {
          model: Reaction,
          as: 'reactions',
          where: req.user ? { userId: req.user.id } : { userId: null },
          required: false,
          attributes: ['type']
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
  getTrendingPosts,
  getFeedPosts
};
