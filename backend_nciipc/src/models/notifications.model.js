'use strict';
const {
    Model, ENUM
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Notifications extends Model { }

    Notifications.init({
        id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },
        user_id: DataTypes.INTEGER(11),
        notification_type: DataTypes.ENUM('node_add', 'user_add', 'user_node_update', 'node_down', 'node_up'),
        node_id: DataTypes.INTEGER(11),
        node_location: DataTypes.TEXT,
        notification_read_users: DataTypes.TEXT,
        user_created_by: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0
        },
        is_user_approved: {
            type: DataTypes.ENUM('0', '1'),
            defaultValue: '0'
        }
    }, {
        sequelize,
        tableName: 'notifications',
        freezeTableName: true,
    });

    return Notifications;
};