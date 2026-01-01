const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reaction = sequelize.define('Reaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('like', 'love', 'laugh', 'wow', 'sad', 'angry', 'dislike'),
    allowNull: false
  },
  targetType: {
    type: DataTypes.ENUM('post', 'comment'),
    allowNull: false
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'targetId', 'targetType'],
      unique: true
    },
    {
      fields: ['targetId', 'targetType']
    },
    {
      fields: ['type']
    }
  ]
});

module.exports = Reaction;
