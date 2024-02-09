const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')

const permissionController = require('../controllers/node_permission.controller.js')

// Get Regions
router.get('/getRegion', auth.verifyToken, permissionController.getRegionList);

// get Region by node id
router.post('/getRegion', auth.verifyToken, permissionController.getRegionbyNode);

// Get Sector
router.post('/getSector/', auth.verifyToken, permissionController.getSector);

// get Organization
router.post('/getOrganization', permissionController.getOrganization);

// get node id
router.post('/getNodeId', auth.verifyToken, permissionController.getNodeId)

router.post('/getNodeAllId', auth.verifyToken, permissionController.getNodeAllId)

// node permission
router.post('/nodePermission', auth.verifyToken, permissionController.nodePermission)

//  delte Honeypot
router.post('/delteHoneypot', auth.verifyToken, permissionController.delteHoneypot)

module.exports = router;