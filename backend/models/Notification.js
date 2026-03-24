const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fromUserId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  commentId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM(
      'comment',
      'reaction',
      'mention',
      'follow',
      'post_approved',
      'post_rejected',
      'system'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['fromUserId'] },
    { fields: ['isRead'] },
    { fields: ['createdAt'] },
    { fields: ['type'] }
  ]
});

module.exports = Notification;
