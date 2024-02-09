'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserLog.init({
    id : {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true
    }, 
    user_id: DataTypes.INTEGER,
    organisation_type: DataTypes.STRING,
    organisation_value: DataTypes.TEXT,
    download_date: DataTypes.DATE,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    status: DataTypes.INTEGER,
    json: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'UserLog',
  });
  return UserLog;
};