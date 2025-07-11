const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('./database');

// Define Document model
const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ownerId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'owner_id'
  },
  folderId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'folder_id'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const tags = this.getDataValue('tags');
      return tags || [];
    }
  }
}, {
  tableName: 'documents',
  timestamps: true,
  underscored: true
});

// Model methods
Document.prototype.toJSON = function() {
  const values = { ...this.get() };
  // Convert snake_case to camelCase for API response
  return {
    id: values.id,
    title: values.title,
    content: values.content,
    ownerId: values.owner_id,
    folderId: values.folder_id,
    tags: values.tags,
    createdAt: values.created_at,
    updatedAt: values.updated_at
  };
};

// Static methods for backward compatibility
Document.findByOwner = function(ownerId) {
  return this.findAll({
    where: { ownerId }
  });
};

module.exports = Document;