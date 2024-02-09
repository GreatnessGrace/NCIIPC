'use strict';
const {
  Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {

  class Node_id extends Model {
  
  }

  Node_id.init({
   
    node_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    permission: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    
  }, {
    sequelize,

    modelName: 'node_ids',
    tableName: 'node_ids',
    primaryKey: false,
    freezeTableName: true, // Model tableName will be the same as the model name
    timestamps: false,
   
  });
  
  return Node_id;
  
};