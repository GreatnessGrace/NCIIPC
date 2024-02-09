'use strict';
const {
  Model
} = require('sequelize');



module.exports = (sequelize, DataTypes) => {

  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      /* User.hasMany(models.user_activity, {
         foreignKey: 'user_id',
         as: 'user_activity'
       });*/
    }
  }

  User.init({
    
    user_id : {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true
      },    
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      email: true,
      unique: true
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    user_status: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    otp: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    
  }, {
    sequelize,
    modelName: 'users',
    timestamps: false
  });

  return User;
  
};