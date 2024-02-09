const { sequelize, DataTypes } = require('../../config/sequelize');
const notifications = require('../models/notifications.model')(sequelize, DataTypes);
const userController = require('../controllers/users.controller');
const NodeLocations = require('../models/nodelocations.model')(sequelize, DataTypes);

exports.addUserNotifications = async (user) => {
    let adminIds = await userController.getAllSuperAdmins();
    await notifications.create({ user_id: user.user_id, notification_type: 'user_add', notification_read_users: adminIds });
}

exports.addUserNodeNotification = async (req, ids, user_id) => {
    let loggedUser = await userController.getLogedUser(req);
    let adminIds = await userController.getAllSuperAdmins();
    nodeIdsData = await NodeLocations.findAll({
        attributes: ['id', 'organization'], where: {
            id: ids
        }
    });
    for (let node of nodeIdsData) {
        await notifications.create({ user_id: user_id, notification_type: 'user_node_update', user_created_by:  loggedUser.dataValues.user_id, node_id: node.id, node_location: node.organization, notification_read_users: adminIds });
    }
}

exports.updateUserNotifications = async (user_id) => {
    notifications.update({is_user_approved: '1'}, {where: {notification_type: 'user_add', user_id: user_id}});
}
