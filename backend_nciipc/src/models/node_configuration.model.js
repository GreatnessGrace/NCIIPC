'use strict';
const {
  Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {

  class Node_configuration extends Model {
  
  }

  Node_configuration.init({
    u_conf_id : {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true
      },    
      conf_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    node_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      network_type: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      hp_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      honeypot_type: {
        type: DataTypes.STRING(25),
        allowNull: false
      },
    os_type: {
        type: DataTypes.STRING(25),
        allowNull: false
      },
      os_name: {
        type: DataTypes.STRING(25),
        allowNull: false
      },
      vm_type: {
        type: DataTypes.STRING(25),
        allowNull: false
    },
    vm_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    snapshot_name:{
        type: DataTypes.STRING(25),
        allowNull: false
    },
    honeypot_profile:{
        type: DataTypes.STRING(300),
        allowNull: true
    },
    honeypot_count:{
        type: DataTypes.INTEGER(11),
        allowNull: false,
    },
    start_date:{
        type:  'TIMESTAMP',
        allowNull: false
    },
    end_date:{
        type:  'TIMESTAMP',
        allowNull: true
    },
    health_status:{
        type: DataTypes.STRING(25),
        allowNull: true
    },
    ip_address:{
        type: DataTypes.STRING(25),
        allowNull: true
    },
    last_up_time:{
        type:  'TIMESTAMP',
        allowNull: true
    }
  }, {
    sequelize,
    modelName: 'node_configuration',
    tableName: 'node_configuration',
    freezeTableName: true, // Model tableName will be the same as the model name
    timestamps: false,
  });

  return Node_configuration;
  
};