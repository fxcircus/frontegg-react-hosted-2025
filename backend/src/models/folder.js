const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('./database');

// Define Folder model
const Folder = sequelize.define('Folder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'parent_id'
  },
  ownerId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'owner_id'
  },
  path: {
    type: DataTypes.STRING,
    defaultValue: '/'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'folders',
  timestamps: true,
  underscored: true
});

// Model methods
Folder.prototype.toJSON = function() {
  const values = { ...this.get() };
  // Convert snake_case to camelCase for API response
  return {
    id: values.id,
    name: values.name,
    parentId: values.parent_id,
    ownerId: values.owner_id,
    path: values.path,
    description: values.description,
    createdAt: values.created_at,
    updatedAt: values.updated_at
  };
};

// Static methods
Folder.findByOwner = function(ownerId) {
  return this.findAll({
    where: { ownerId }
  });
};

Folder.findByParent = function(parentId) {
  return this.findAll({
    where: { parentId }
  });
};

// Instance method to build full path
Folder.prototype.buildPath = async function() {
  const path = [this.name];
  let currentFolder = this;
  
  while (currentFolder.parentId) {
    currentFolder = await Folder.findByPk(currentFolder.parentId);
    if (currentFolder) {
      path.unshift(currentFolder.name);
    }
  }
  
  return '/' + path.join('/');
};

// Define associations
Folder.hasMany(Folder, { as: 'children', foreignKey: 'parentId' });
Folder.belongsTo(Folder, { as: 'parent', foreignKey: 'parentId' });

module.exports = Folder;