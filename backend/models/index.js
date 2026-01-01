const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Reaction = require('./Reaction');
const Notification = require('./Notification');

// User associations
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
User.hasMany(Reaction, { foreignKey: 'userId', as: 'reactions' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// Post associations
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Post.hasMany(Reaction, { 
  foreignKey: 'targetId', 
  as: 'reactions',
  scope: { targetType: 'post' }
});

// Comment associations
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
Comment.hasMany(Reaction, { 
  foreignKey: 'targetId', 
  as: 'reactions',
  scope: { targetType: 'comment' }
});

// Reaction associations
Reaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Reaction.belongsTo(Post, { 
  foreignKey: 'targetId', 
  as: 'post',
  constraints: false,
  scope: { targetType: 'post' }
});
Reaction.belongsTo(Comment, { 
  foreignKey: 'targetId', 
  as: 'comment',
  constraints: false,
  scope: { targetType: 'comment' }
});

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });
Notification.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Notification.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

module.exports = {
  User,
  Post,
  Comment,
  Reaction,
  Notification
};
