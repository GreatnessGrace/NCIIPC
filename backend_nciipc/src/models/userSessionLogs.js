'use strict';
const {
  Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {

  class userSessionLogs extends Model {
  
    static associate(models) {
    
    }
  }

  userSessionLogs.init({
    id : {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true
      },    
      user_session_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    datetime: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    createdBy: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    alterredUser: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    
  }, {
    sequelize,
    modelName: 'userSessionLogs',
    timestamps: false,
  });

  return userSessionLogs;
  
};