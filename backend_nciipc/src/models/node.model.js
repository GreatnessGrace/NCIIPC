'use strict';
const {
  Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {

  class Node extends Model {
  
  }

  Node.init({
    node_id : {
        type: DataTypes.INTEGER(10),
        autoIncrement: true,
        primaryKey: true
      },    
    node_location: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    node_reg_date: {
      type: 'TIMESTAMP',
      allowNull: true
    },
    email_address: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    mac_address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    network_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    node_status: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    last_up_time:{
        type:  'TIMESTAMP',
        allowNull: true
    },
    base_ip:{
        type: DataTypes.STRING(15),
        allowNull: true
    },
    node_ip:{
        type: DataTypes.STRING(20),
        allowNull: true
    },
    wan_ip:{
        type: DataTypes.STRING(15),
        allowNull: true
    },
    port:{
        type: DataTypes.STRING(5),
        allowNull: true
    },
    user:{
        type: DataTypes.STRING(25),
        allowNull: true
    },
    passwd:{
        type: DataTypes.STRING(25),
        allowNull: true
    }
  }, {
    sequelize,
    modelName: 'node',
    tableName: 'node',
    freezeTableName: true, // Model tableName will be the same as the model name
    timestamps: false,
  });

  return Node;
  
};