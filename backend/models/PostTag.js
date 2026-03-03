const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PostTag = sequelize.define('PostTag', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    postId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Posts',
            key: 'id'
        }
    },
    tagId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Tags',
            key: 'id'
        }
    }
}, {
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['postId', 'tagId']
        }
    ]
});

module.exports = PostTag;
