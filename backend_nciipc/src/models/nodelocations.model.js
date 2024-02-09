'use strict';
const {
  Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {

  class NodeLocations extends Model {
  
  }

  NodeLocations.init({
    id : {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true
      },    
    lat: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    lng: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    place: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    sector: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    organization: {
      type: DataTypes.STRING(200),
      allowNull: false
    },


  }, {
    sequelize,
    modelName: 'node_location',
    tableName: 'node_location',
    freezeTableName: true, // Model tableName will be the same as the model name
    timestamps: false,
  });

  return NodeLocations;
  
};