const dbConn = require('../../config/db.config');
const UserModel = require('../models/users.model');
const auth = require("../../middleware/auth");
const jwt = require('jsonwebtoken');
const { sequelize, DataTypes } = require('../../config/sequelize');
const User = require('../models/user.model')(sequelize, DataTypes);
const NodeLocations = require('../models/nodelocations.model')(sequelize, DataTypes);
const Node_id = require('../models/node_id.model')(sequelize, DataTypes);
const Node = require('../models/node.model')(sequelize, DataTypes);
const UserLog = require('../../models/userlog')(sequelize, DataTypes);
const notifications = require('../models/notifications.model')(sequelize, DataTypes);
const notificationsCntrl = require('../controllers/notifications.controller');
const userSessionLogs = require('../models/userSessionLogs')(sequelize, DataTypes);
const nodeConfig = require('../models/node_configuration.model')(sequelize, DataTypes);
const { validationResult } = require('express-validator');

const fs = require('fs');

const os = require('os');
const bcrypt = require('bcrypt');
const { log } = require('console');
require("dotenv").config();
const config = process.env;


NodeLocations.hasMany(User, {
    foreignKey: 'user_id'
});

Node_id.hasOne(User, {
    foreignKey: 'user_id'
});

notifications.hasOne(User, {
    sourceKey: 'user_id',
    foreignKey: 'user_id'
});

notifications.hasOne(User, {
    sourceKey: 'user_created_by',
    foreignKey: 'user_id',
    as: 'admin_user'
});

User.hasMany(Node_id, {
    foreignKey: 'user_id'
});

nodeConfig.hasMany(Node, {
    foreignKey: 'node_id'
});

userSessionLogs.hasMany(User, {
    sourceKey: 'createdBy',
    foreignKey: 'user_id',
    as: 'user_superadmin'
})

userSessionLogs.hasMany(User, {
    sourceKey: 'alterredUser',
    foreignKey: 'user_id'
})

exports.getLogedUser = (req) => {
    return getLoggedUser(req);
}

exports.getAllSuperAdmins = async () => {
    let admin = await User.findAll({
        where: { 'role': 'superadmin', user_status: 'active' }, attributes: ['user_id'],
        raw: true
    });
    let adminIds = '';
    if (admin && admin.length) {
        let idsAray = admin.map(x => x.user_id);
        adminIds = idsAray.toString();
    }
    return adminIds;
}

async function getUserWithNodes(req) {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, config.JWT_PASSWORD_KEY);
    let user = await User.findOne({
        attributes: ['user_id', 'role'],
        include: [
            { model: Node_id, attributes: ['user_id', 'node_id'] }
        ], where: { username: decoded.data }
    });
    // if (user.node_ids[0].node_id == 0) {
    //     user.node_ids[0].node_id = await NodeLocations.findAll({ attributes: ['id'] });
    // }
    return user;
}


async function getUserNodesAssigned(req) {

    const token = req.headers.authorization;

    const decoded = jwt.verify(token, config.JWT_PASSWORD_KEY);

    const user = await User.findOne({ where: { username: decoded.data } });


    let allNodes = await Node_id.findAll({ attributes: [['node_id', 'id']], where: { user_id: user.dataValues.user_id } });
    if (allNodes[0].id == 0) {
        allNodes = await NodeLocations.findAll({ attributes: ['id'] });
    }
    let node = [];
    allNodes.forEach(val => {
        node.push(val?.dataValues?.id)
    });

    return node;

}
async function getLoggedUser(req) {
    const token = req.headers.authorization;

    const decoded = jwt.verify(token, config.JWT_PASSWORD_KEY);

    const user = await User.findOne({ where: { username: decoded.data } });
    return user;
}

async function getLoggedUserSession(user_id) {
    let sql = `SELECT * FROM user_session where user_id = ${user_id} order by id DESC limit 1`;

    let loginSession = await sequelize.query(sql);

    return loginSession[0];
}

// get users list
exports.getUserList = (req, res) => {
    UserModel.getAllUsers((err, user) => {
        if (err) {
            res.send(err)
        } else {
            res.send(user)
        }
    })

}

// get users list
exports.allcountries = (req, res) => {
    UserModel.allcountries((err, user) => {
        if (err) {
            res.send(err)
        } else {
            res.send(user)
        }
    })

}

// get user by ID
exports.getUserListByID = (req, res) => {
    UserModel.getUserListByID(req.params.id, (err, user) => {
        if (err) {
            res.send(err);
        } else {
            res.send(user)
        }
    })

}

// create new user
exports.createUser = async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        var extractedErrors = errors.array({ onlyFirstError: true });
        return res.status(400).json({
            status: 400,
            data: null,
            message: extractedErrors[0].msg,
            error: true,
        });
    }


    var loggedUser = [];
    var getSess = [];
    if (req.headers.authorization) {
        loggedUser = await getLoggedUser(req);
        getSess = await getLoggedUserSession(loggedUser.dataValues.user_id);
    }
    const emailExists = await User.findOne({ where: { email: req.body.email } });
    if (emailExists) {
        return res.status(400).send({details: 'Email already registered!'})
    }


    const userNameExists = await User.findOne({ where: { username: req.body.username } });
    if (userNameExists) {
        return res.send(400, {
            details: 'Username already registered!'
        })
    }


    UserModel.createUser(req, async (err, user) => {

        if (err) {
            res.send(err)
        } else {
            if (req.headers.authorization) {
                let start_date = new Date();
                let userlog = userSessionLogs.create({ alterredUser: user.user_id, datetime: start_date.toString(), user_session_id: getSess[0].id, action: "User Created", createdBy: loggedUser.dataValues.user_id });
            } else {
                notificationsCntrl.addUserNotifications(user)
            }
            return res.send(user)
        }
    })
};

exports.addUser = async (req, res) => {
    var loggedUser = [];
    var getSess = [];
    if (req.headers.authorization) {
        loggedUser = await getLoggedUser(req);
        getSess = await getLoggedUserSession(loggedUser.dataValues.user_id);
    }
    const emailExists = await User.findOne({ where: { email: req.body.email } });
    if (emailExists) {
        return res.send(400, {
            details: 'Email already registered!'
        })
    }


    const userNameExists = await User.findOne({ where: { username: req.body.username } });
    if (userNameExists) {
        return res.send(400, {
            details: 'Username already registered!'
        })
    }


    UserModel.addUser(req, async (err, user) => {

        if (err) {
            res.send(err)
        } else {
            if (req.headers.authorization) {
                let start_date = new Date();
                let userlog = userSessionLogs.create({ alterredUser: user.user_id, datetime: start_date.toString(), user_session_id: getSess[0].id, action: "User Created", createdBy: loggedUser.dataValues.user_id });
            } else {
                notificationsCntrl.addUserNotifications(user)
            }
            return res.send(user)
        }
    })
};

// login user
exports.loginUser = (async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        var extractedErrors = errors.array({ onlyFirstError: true });
        return res.status(400).json({
            status: 400,
            data: null,
            message: extractedErrors[0].msg,
            error: true,
        });
    }

    UserModel.loginUser(req, (err, user) => {
        if (err) {
            return res.status(400).send(err.message);
        } else {
            return res.status(200).send(user);
        }
    })
});

exports.nodeDetail = (async (req, res) => {

    const token = req.headers.authorization;

    const decoded = jwt.verify(token, config.JWT_PASSWORD_KEY);

    const user = await User.findOne({ where: { username: decoded.data } });

    try {
        let allNodes = await Node_id.findAll({ attributes: [['node_id', 'id']], where: { user_id: user.dataValues.user_id } });
        var node = allNodes.map((e) => {
            return e.id;
        });
        if (allNodes[0].id == 0) {
            let nodeData = await sequelize.query(`SELECT 
        n.node_id, 
        n.node_hardware, 
        n.node_location, 
        n.node_sensor_hp_type,
        n.email_address, 
        n.last_up_time, 
        n.node_reg_date, 
        n.mac_address, 
        n.network_type, 
        n.node_status, 
        n.base_ip,
        n.node_ip,
        node_location.sector, 
        node_location.city,
        node_location.state,
        COALESCE(nna.available, 0) AS available_hp,
        COALESCE(nnd.deployed, 0) AS deploye_hp
    FROM 
        node AS n
        LEFT JOIN node_location ON node_location.id = n.node_id
        LEFT JOIN (
            SELECT 
                node_id, 
                SUM(CASE WHEN status = 0 THEN counter_node ELSE 0 END) AS available,
                SUM(CASE WHEN status = 1 THEN counter_node ELSE 0 END) AS deploye_hp
            FROM (
                SELECT 
                    node_id, 
                    status, 
                    COUNT(node_network.node_id) AS counter_node
                FROM 
                    node_network
                WHERE 
                    type = 'public'
                GROUP BY 
                    node_id, 
                    status
            ) AS nn
            GROUP BY 
                node_id
        ) AS nna ON n.node_id = nna.node_id
        LEFT JOIN (
            SELECT 
                node_id, 
                SUM(CASE WHEN status = 1 THEN counter_node ELSE 0 END) AS deployed
            FROM (
                SELECT 
                    node_id, 
                    status, 
                    COUNT(node_network.node_id) AS counter_node
                FROM 
                    node_network
                WHERE 
                    type = 'public'
                GROUP BY 
                    node_id, 
                    status
            ) AS nn
            GROUP BY 
                node_id
        ) AS nnd ON n.node_id = nnd.node_id
    GROUP BY 
        n.node_id, 
        n.node_location, 
        n.email_address, 
        n.last_up_time, 
        n.node_reg_date, 
        n.mac_address, 
        n.network_type, 
        n.node_status, 
        n.node_ip,
        node_location.sector, 
        node_location.city,
        node_location.state,
        nna.available,
        nnd.deployed;
    
       `, {
                type: sequelize.QueryTypes.SELECT
            })

            return res.send(nodeData)
        }
        else {
            //   let  nodeData = await Node.findAll({attributes:['node_id','node_location','email_address','last_up_time','node_reg_date','mac_address','network_type','node_status','node_ip'],where:{node_id:node}});
            let nodeData = await sequelize.query(`
            SELECT
            n.node_id,
            n.node_location,
            n.node_sensor_hp_type,
            n.email_address,
            n.last_up_time,
            n.node_reg_date,
            n.mac_address,
            n.network_type,
            n.node_status,
            n.node_ip,
            n.base_ip,
            node_location.sector,
            node_location.city,
            node_location.state,
            COALESCE(nna.available, 0) AS available_hp,
            COALESCE(nnd.deployed, 0) AS deploye_hp
            FROM
            node AS n
            LEFT JOIN node_location ON node_location.id = n.node_id
            LEFT JOIN (
            SELECT
            node_id,
            SUM(CASE WHEN status = 0 THEN counter_node ELSE 0 END) AS available,
            SUM(CASE WHEN status = 1 THEN counter_node ELSE 0 END) AS deployed
            FROM (
            SELECT
            node_id,
            status,
            COUNT(node_network.node_id) AS counter_node
            FROM
            node_network
            WHERE
            type = 'public'
            GROUP BY
            node_id,
            status
            ) AS nn
            GROUP BY
            node_id
            ) AS nna ON n.node_id = nna.node_id
            LEFT JOIN (
            SELECT
            node_id,
            SUM(CASE WHEN status = 1 THEN counter_node ELSE 0 END) AS deployed
            FROM (
            SELECT
            node_id,
            status,
            COUNT(node_network.node_id) AS counter_node
            FROM
            node_network
            WHERE
            type = 'public'
            GROUP BY
            node_id,
            status
            ) AS nn
            GROUP BY
            node_id
            ) AS nnd ON n.node_id = nnd.node_id
            WHERE
            n.node_id IN (`+ node + `)
            GROUP BY
            n.node_id,
            n.node_location,
            n.email_address,
            n.last_up_time,
            n.node_reg_date,
            n.mac_address,
            n.network_type,
            n.node_status,
            n.node_ip,
            node_location.sector,
            node_location.city,
            node_location.state,
            nna.available,
            nnd.deployed;`, {
                type: sequelize.QueryTypes.SELECT
            })
            return res.send(nodeData)
        }
    } catch (error) {
        console.log('error at catch', error);
    }
});


exports.honeypotDetail = (async (req, result) => {

    const token = req.headers.authorization;

    const decoded = jwt.verify(token, config.JWT_PASSWORD_KEY);

    const user = await User.findOne({ where: { username: decoded.data } });

    try {
        let allNodes = await Node_id.findAll({ attributes: [['node_id', 'id']], where: { user_id: user.dataValues.user_id } });
        var node = allNodes.map((e) => {
            return e.id;
        });
        if (allNodes[0].id == 0) {
            dbConn.query('SELECT node_configuration.node_id, node_location.organization, node_location.sector, node_location.region, node_configuration.os_name, node_configuration.vm_type, node_configuration.vm_name, node_configuration.snapshot_name, node_configuration.honeypot_profile, node.node_status, node_configuration.start_date, node_configuration.ip_address, node_configuration.last_up_time AS health_time, node_configuration.health_status FROM node_configuration Inner Join node_location ON node_configuration.node_id = node_location.id Inner Join node ON node.node_id = node_location.id WHERE node_configuration.end_date IS NULL', (err, res) => {
                return result.send(res)
            })
        }
        else {
            dbConn.query('SELECT node_configuration.node_id,  node_location.organization, node_location.sector, node_location.region, node_configuration.os_name, node_configuration.vm_type, node_configuration.vm_name, node_configuration.snapshot_name, node_configuration.honeypot_profile, node_configuration.start_date, node_configuration.ip_address, Max(node_honeypot_health.date_time) AS health_time, node_configuration.health_status FROM node_configuration Inner Join node_location ON node_configuration.node_id = node_location.id left Join node_honeypot_health ON node_honeypot_health.u_conf_id = node_configuration.u_conf_id WHERE node_configuration.end_date IS NULL and node_configuration.node_id IN (' + node + ')  GROUP BY node_configuration.node_id, node_location.organization, node_location.sector, node_location.region, node_configuration.os_name, node_configuration.vm_type, node_configuration.vm_name, node_configuration.snapshot_name,  node_configuration.honeypot_profile, node_configuration.start_date, node_configuration.ip_address, node_configuration.health_status', (err, res) => {
                return result.send(res)

            })
        }


    } catch (error) {
        console.log('error at catch', error);
    }

});

exports.getConfigDetails = (async (req, res) => {
    let node = req.body.node
    let nodeData = await sequelize.query(`
    SELECT 
    nc.node_id, nc.conf_id, nc.network_type, nc.vm_type, nc.vm_name, nc.os_type, nc.honeypot_type, nc.honeypot_profile, nc.snapshot_name, nc.honeypot_count, nc.u_conf_id, nc.os_name, nc.start_date, nc.health_status, nc.ip_address, ni.image_name, ni.image_tag, 
    COALESCE(np.services, '') AS services,
    nv.vulnerabilities
FROM  
    node_configuration AS nc
    LEFT JOIN node_image AS ni ON ni.node_id = nc.node_id AND ni.vm_name = nc.vm_name
    LEFT JOIN (
        SELECT 
            ncp.conf_id, GROUP_CONCAT(np.package_name ORDER BY np.package_name ASC SEPARATOR ',') AS services
        FROM 
            node_configuration_package AS ncp
            INNER JOIN node_package AS np ON ncp.package_id = np.package_id
        WHERE 
            ncp.conf_id IN (
                SELECT 
                    nc2.conf_id
                FROM 
                    node_configuration AS nc2
                WHERE 
                    nc2.node_id = `+ node + ` AND nc2.end_date IS NULL
            )
        GROUP BY 
            ncp.conf_id
    ) AS np ON np.conf_id = nc.conf_id 
    LEFT JOIN (
        SELECT 
            nc3.u_conf_id, GROUP_CONCAT(nv.vulnerability ORDER BY nv.vulnerability ASC SEPARATOR ',') AS vulnerabilities
        FROM 
            node_configuration AS nc3
            INNER JOIN node_snapshot AS ns ON ns.snapshot_name = nc3.snapshot_name
            INNER JOIN node_image AS ni2 ON ni2.node_id = nc3.node_id AND ns.image_id = ni2.image_id AND ni2.vm_name = nc3.vm_name
            INNER JOIN node_vulnerability_package AS nvp ON nvp.snapshot_id = ns.snapshot_id
            INNER JOIN node_vulnerability AS nv ON nv.vulnerability_id = nvp.vulnerability_id
        WHERE 
            nc3.u_conf_id IN (
                SELECT 
                    nc4.u_conf_id
                FROM 
                    node_configuration AS nc4
                WHERE 
                    nc4.node_id = `+ node + ` AND nc4.end_date IS NULL
            ) AND nv.vulnerability IS NOT NULL
        GROUP BY 
            nc3.u_conf_id
    ) AS nv ON nv.u_conf_id = nc.u_conf_id
WHERE 
    nc.node_id = `+ node + ` AND nc.end_date IS NULL 
ORDER BY 
    nc.start_date DESC;
`, {
        type: sequelize.QueryTypes.SELECT
    })
    return res.send(nodeData)

})

// Get All Nodes assigned to user
exports.getAllNodes = (async (req, res) => {

    const token = req.headers.authorization;

    const decoded = jwt.verify(token, config.JWT_PASSWORD_KEY);

    const user = await User.findOne({ where: { username: decoded.data } });

    try {

        let allNodes = await Node_id.findAll({ attributes: [['node_id', 'id']], where: { user_id: user.dataValues.user_id } });
        if (allNodes[0].id == 0) {
            allNodes = await NodeLocations.findAll({ attributes: ['id'] });
            allNodes.push({ id: 0 })
        }



        return res.send(allNodes)

    } catch (error) {
        console.log('error at catch', error);
    }
});

// Forgot Password
exports.forgotPassword = ((req, res) => {
    UserModel.forgotPassword(req, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.send(result)
        }
    })
});


exports.getAllAttackNodes = (async (req, res) => {


    const token = req.headers.authorization;

    const decoded = jwt.verify(token, config.JWT_PASSWORD_KEY);

    const user = await User.findOne({ where: { username: decoded.data } });


    try {
        let node_ids = [];
        let allNodes = await Node_id.findAll({ attributes: [['node_id', 'id']], where: { user_id: user.dataValues.user_id } });
        node_ids = await allNodes.map(a => a.dataValues.id);
        if (allNodes[0].id == 0) {
            var node = await NodeLocations.findAll();
        } else {
            var node = await NodeLocations.findAll({
                where: {
                    id: await node_ids
                }
            });
        }

        return res.send(node)

    } catch (error) {
        console.log('error at catch', error);
    }

});

// Recover Password
exports.recoverPassword = ((req, res) => {
    UserModel.recoverPassword(req, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send(result)
        }
    })
});

// Change Password
exports.changePassword = ((req, res) => {

    UserModel.changePassword(req, (err, result) => {

        if (err) {
            res.send(err);
        } else {
            res.send(result)
        }
    })
});

// view users
exports.viewUsers = (async (req, res) => {

    let user = await User.findAll({
        include: [
            { model: Node_id, attributes: ['user_id', 'node_id'] }
        ], where: { user_status: { $not: 'deleted_user' } }
    });

    res.send({ data: user });

})


// view Pending users
exports.viewPendingUsers = (async (req, res) => {
    let user = await User.findAll({
        include: [
            { model: Node_id, attributes: ['user_id', 'node_id'] }
        ], where: { user_status: 'inactive' }
    });

    res.send({ data: user });
})

// Edit users
exports.editUser = (async (req, res) => {
    var loggedUser = [];
    var getSess = [];
    if (req.headers.authorization) {
        loggedUser = await getLoggedUser(req);
        getSess = await getLoggedUserSession(loggedUser.dataValues.user_id);
    }
    let {
        name,
        username,
        email,
        role,
        user_status,
        user_id
    } = req.body.data

    let reg = new RegExp("^[a-zA-Z0-9 ]+$")
    let emailReg = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")
     
    if(!reg.test(name) || !reg.test(username) || !emailReg.test(email)){
        return res.status(400).send({
            status: 0,
            message: 'Invalid Pattern'
        })
    }

    if (user_status == 'active') {
        notificationsCntrl.updateUserNotifications(user_id);
    }
    let edit = await User.update({ name: name, username: username, email: email, role: role, user_status: user_status }, {
        where: {
            user_id: user_id
        }
    });
    if (!edit) {
        return res.status(400).send({
            status: 0,
            message: 'Error in update'
        })
    } else {
        if (req.headers.authorization) {
            let start_date = new Date();
            let userlog = userSessionLogs.create({ alterredUser: user_id, datetime: start_date.toString(), user_session_id: getSess[0].id, action: "User Edited", createdBy: loggedUser.dataValues.user_id });
        }
        return res.status(200).send({
            status: 1,
            message: "User Updated Successfully!!",
        })
    }
})


exports.deleteUser = (async (req, res) => {
    var loggedUser = [];
    var getSess = [];
    if (req.headers.authorization) {
        loggedUser = await getLoggedUser(req);
        getSess = await getLoggedUserSession(loggedUser.dataValues.user_id);
    }
    let {
        name,
        username,
        email,
        role,
        user_status,
        user_id
    } = req.body.data
    let remove = await User.update({ user_status: "deleted_user" }, {
        where: {
            user_id: user_id
        }
    });
    if (!remove) {
        return res.status(400).send({
            status : 0,
            details: 'Error in delete'
        })
    } else {
        if (req.headers.authorization) {
            let start_date = new Date();
            let userlog = userSessionLogs.create({ alterredUser: user_id, datetime: start_date.toString(), user_session_id: getSess[0].id, action: "User Deleted", createdBy: loggedUser.dataValues.user_id });
        }
        return res.status(200).send({
            status : 1,
            message: "User Deleted Successfully!!",
        })
    }
})

// Generate Report
exports.reportLogGenerate = (async (req, res) => {

    let user = await getLoggedUser(req);
    let org_type
    const {
        organization_type,
        organization_name,
        start_date,
        end_date,
    } = req.body
    let organization_name_str = '';
    if (organization_name && organization_name.length) {
        organization_name_str = organization_name.map(x => x.item_text).toString();
    }
    if (organization_type == "organization_region.keyword") {
        org_type = "Region";

    }
    else if (organization_type == "organization_sector.keyword") {
        org_type = "Sector"
    }
    else if (organization_type == "organization_state.keyword") {
        org_type = "State"
    }
    else {
        org_type = "Organization"
    }
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let generate_date = year + "-" + month + "-" + date;
    let userLog = await UserLog.create({ user_id: user.dataValues.user_id, organisation_type: org_type, organisation_value: organization_name_str, download_date: generate_date, start_date: start_date, end_date: end_date, status: 0,json:0 });
 
    return res.send(userLog);
})

// get report generate list
exports.getreportGenerate = (async (req, res) => {
    let user = await getLoggedUser(req);
    let userReports = await UserLog.findAll({
        limit: 10,
        where: {
            user_id: user.dataValues.user_id
        },
        order: [['createdAt', 'DESC']],
    });

    res.send({ data: userReports });
})
// update report


// Logout API
exports.logOut = ((req, res) => {
    UserModel.logOut(req, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send(result);
        }
    })
})


exports.getNotifications = (async (req, res) => {
    let user = await getUserWithNodes(req);
    let notifs = [];
    let roleValues = user?.dataValues;
    if (user && roleValues?.role && (roleValues?.role == 'user' || roleValues?.role == 'admin')) {
        let nodeIds = [];
        if (roleValues?.node_ids && roleValues?.node_ids.length) {
            nodeIds = roleValues?.node_ids.map(x => x.node_id);
        }
        if (nodeIds.length) {
            if (nodeIds.includes(0)) {
                notifs = await notifications.findAll({ order: [['createdAt', 'DESC']], group: ['node_id','createdAt','notification_type']});
            } else {
                notifs = await notifications.findAll({
                    order: [['createdAt', 'DESC']], 
                    group: ['node_id','createdAt','notification_type'],
                    include: [
                        { model: User, required: false, as: 'admin_user', attributes: ['user_id', 'name'] },
                        { model: User, required: false, attributes: ['user_id', 'name'] }
                    ], where: { node_id: nodeIds, notification_type:{ $or:['node_down','node_up']}   }
                });
            }
        }
    } else {
        notifs = await notifications.findAll({
            order: [['createdAt', 'DESC']],
            group: ['node_id','createdAt','notification_type'],
            include: [
                { model: User, required: false, as: 'admin_user', attributes: ['user_id', 'name'] },
                { model: User, required: false, attributes: ['user_id', 'name'] }
            ]
        });
    }
    res.send({ data: notifs });
});

exports.getNotificationCount = (async (req, res) => {
    let user = await getUserWithNodes(req);
    let count = 0;
    let roleValues = user?.dataValues;

    if (user && roleValues?.role && (roleValues?.role == 'user' || roleValues?.role == 'admin')) {
        let nodeIds = [];
        if (roleValues?.node_ids && roleValues?.node_ids.length) {
            nodeIds = roleValues?.node_ids.map(x => x.node_id);
        }
     
        if (nodeIds.length) {
            let sql = `SELECT count(*) AS count FROM notifications WHERE notification_type = 'node_down' AND FIND_IN_SET(${roleValues.user_id},notification_read_users)`;
            if (nodeIds.includes(0)) {
                let testCount = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
                count = testCount && testCount.length ? testCount[0].count : 0;
            } else {
                sql = sql + ` AND node_id IN ( ${nodeIds} )`;
                let testCount = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
                count = testCount && testCount.length ? testCount[0].count : 0;
            }
        }
    } else {
        let sql = `select count(*) as count from notifications where FIND_IN_SET(${roleValues.user_id},notification_read_users)`;
        let testCount = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
        count = testCount && testCount.length ? testCount[0].count : 0;
    }
    res.send({ count: count });
});

exports.markNotificationRead = (async (req, res) => {
    let user = await getUserWithNodes(req);
    let roleValues = user?.dataValues;
    let updateQuery;
    if (roleValues.role == 'user' || roleValues.role == 'admin') {
        let nodeIds = [];
        if (roleValues?.node_ids && roleValues?.node_ids.length) {
            nodeIds = roleValues?.node_ids.map(x => x.node_id);
        }
        if (nodeIds.length) {
            let sql = `select notification_read_users, id from notifications where notification_type = 'node_down' AND FIND_IN_SET(${roleValues.user_id},notification_read_users)`;
            if (nodeIds.includes(0)) {
                let queryRes = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
                if (queryRes && queryRes.length) {
                    for (let res of queryRes) {
                        let newArr = res.notification_read_users.split(',');
                        let index = newArr.indexOf(roleValues.user_id.toString());
                        newArr.splice(index, 1);
                        let updatedVal = 0;
                        if (newArr && newArr.length) {
                            updatedVal = newArr.toString();
                        }
                        let updateSql = `update notifications set notification_read_users = '${updatedVal}' where id = ${res.id}`;
                        updateQuery = await sequelize.query(updateSql, { type: sequelize.QueryTypes.update });
                    }
                }
            } else {
                sql = sql + ` AND node_id IN ( ${nodeIds} )`;
                let queryRes = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
                if (queryRes && queryRes.length) {
                    for (let res of queryRes) {
                        let newArr = res.notification_read_users.split(',');
                        let index = newArr.indexOf(roleValues.user_id.toString());
                        newArr.splice(index, 1);
                        let updatedVal = 0;
                        if (newArr && newArr.length) {
                            updatedVal = newArr.toString();
                        }
                        let updateSql = `update notifications set notification_read_users = '${updatedVal}' where id = ${res.id}`;
                        updateQuery = await sequelize.query(updateSql, { type: sequelize.QueryTypes.update });
                    }
                }
            }
        }
    } else {
        let sql = `select notification_read_users, id from notifications where FIND_IN_SET(${roleValues.user_id},notification_read_users)`;
        let queryRes = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
        if (queryRes && queryRes.length) {
            for (let res of queryRes) {
                let newArr = res.notification_read_users.split(',');
                let index = newArr.indexOf(roleValues.user_id.toString());
                newArr.splice(index, 1);
                let updatedVal = 0;
                if (newArr && newArr.length) {
                    updatedVal = newArr.toString();
                }
                let updateSql = `update notifications set notification_read_users = '${updatedVal}' where id = ${res.id}`;
                updateQuery = await sequelize.query(updateSql, { type: sequelize.QueryTypes.update });
            }
        }
    }
    res.send({ data: updateQuery });
})

// user Session
exports.userSession = (async (req, res) => {
    let user = await userSessionLogs.findAll({
        include: [
            { model: User, required: false, as: 'user_superadmin', attributes: ['user_id', 'name'] },
            { model: User, required: false, attributes: ['user_id', 'name'] }
        ]
    });

    res.send({ data: user })
})

exports.getSeverityAlert = (req, res) => {
    UserModel.getSeverityAlert(req, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send(result);
        }
    })
}

exports.getMitreAttack = (req, res) => {
    UserModel.getMitreAttack(req, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send(result);
        }
    })
}


exports.editProfile = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var extractedErrors = errors.array({ onlyFirstError: true });
      return res.status(400).json({
        status: 400,
        data: null,
        message: extractedErrors[0].msg,
        error: true,
      });
    }
    UserModel.editProfile(req, (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    });
  };
  