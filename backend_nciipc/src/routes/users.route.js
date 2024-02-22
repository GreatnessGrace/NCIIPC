const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const elastic = require('elasticsearch')
const bodyParser = require('body-parser').json();

const usersController = require('../controllers/users.controller.js');
var { LOGIN,CREATE_USER,PROFILE } = require('../validator/validator.js');
// elastic search
// const elasticsearch = elastic.Client({
//     host: 'localhost:9200'
// });

// elasticsearch.get('/getElastic', usersController.getElastic)

// get all employees
router.get('/getuserList',auth.verifyToken, usersController.getUserList);
// get ures by ID
router.get('/getuserList/:id',auth.verifyToken, usersController.getUserListByID);
// create user
router.post('/createUser',CREATE_USER, usersController.createUser);

router.post('/addUser',auth.verifyToken,  usersController.addUser);
// login user
router.post('/login',LOGIN, usersController.loginUser);

// forgot password
router.post('/forgot', usersController.forgotPassword);

// Recover Password
router.post('/recoverPassword', usersController.recoverPassword);

// Change Password
router.post('/change-password', auth.verifyToken,usersController.changePassword);

// logout API
router.get('/logout', auth.verifyToken, usersController.logOut)

// view users
router.get('/viewUsers', auth.verifyToken ,usersController.viewUsers);

// view Pending users
router.get('/viewPendingUsers', auth.verifyToken ,usersController.viewPendingUsers);

// Edit user
router.post('/editUser', auth.verifyToken, usersController.editUser);

// Delete user
router.post('/deleteUser', auth.verifyToken,usersController.deleteUser);

// Get All Nodes assigned to user
router.get('/getallnodes', auth.verifyToken, usersController.getAllNodes);

// Get All Nodes assigned to user
router.get('/getAllAttackNodes', auth.verifyToken, usersController.getAllAttackNodes);

// set data of report
router.post('/reportLogGenerate', auth.verifyToken, usersController.reportLogGenerate);

// get user report details
router.get('/reportGenerateList', auth.verifyToken, usersController.getreportGenerate);

// get notifications
router.get('/notifications', auth.verifyToken, usersController.getNotifications);

// get notification count
router.get('/notificationCount', auth.verifyToken, usersController.getNotificationCount);

// get user session
router.get('/userSession',auth.verifyToken, usersController.userSession)

// notification read
router.get('/markNotificationRead', auth.verifyToken, usersController.markNotificationRead)

// severity alert
router.get('/severityAlert',auth.verifyToken, usersController.getSeverityAlert)

// severity alert
router.get('/allcountries',auth.verifyToken, usersController.allcountries)

// severity alert
router.post('/mitreAttack',auth.verifyToken, usersController.getMitreAttack)

//edit Profile
router.post(
    "/editProfile",
    PROFILE,
    auth.verifyToken,
    usersController.editProfile
  );

module.exports = router;
