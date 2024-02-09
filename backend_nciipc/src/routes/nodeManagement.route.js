// const express = require('express');
// const router = express.Router();
// const auth = require('../../middleware/auth')
// const usersController = require('../controllers/users.controller.js');
// const nodeController = require('../controllers/nodeManagement.controller')
// // get honeypot details
// router.get('/honeypotDetail', auth.verifyToken, usersController.honeypotDetail);

// // get node details
// router.get('/nodeDetail', auth.verifyToken, usersController.nodeDetail);

// //getConfigDetails
// router.post('/getConfigDetails',auth.verifyToken, usersController.getConfigDetails)

// // honeypotConfig
// router.get("/honeypotConfig",auth.verifyToken, nodeController.honeypotConfig)

// // getHoneypotData
// router.post("/getHoneypotData",auth.verifyToken, nodeController.getHoneypotData)

// //honeypotProfile
// router.post("/hpProfileConfig",auth.verifyToken, nodeController.hpProfileConfig)

// //honeypotProfile
// router.post("/gethpProfile",auth.verifyToken, nodeController.gethpProfile)

// //getNodeConfig
// router.post("/getNodeConfig",auth.verifyToken, nodeController.getNodeConfig)

// //hp_image
// router.post("/hp_image",auth.verifyToken,nodeController.hp_image)

// //hp_service
// router.post("/hp_service",auth.verifyToken, nodeController.hp_service)

// router.post("/getNodeHealthConnection",auth.verifyToken,nodeController.getNodeHealthConnection)

// router.post("/saveHoneypotConfig",auth.verifyToken,nodeController.saveHoneypotConfig)

// router.get("/getDownNodes",nodeController.getDownNodes)

// // router.get("/deleteNoti",nodeController.deleteNoti)

// router.post(
//     "/honeyotDeviceType",
//     auth.verifyToken,
//     nodeController.honeypotDeviceType
//   );

//   router.get(
//     "/sectorFilterData",
//     auth.verifyToken,
//     nodeController.sectorFilterData
//   );
  
//   router.get(
//     "/regionFilterData",
//     auth.verifyToken,
//     nodeController.regionFilterData
//   );
  
//   router.get(
//     "/organizationFilterData",
//     auth.verifyToken,
//     nodeController.organizationFilterData
//   );

//   router.post(
//     "/deployedHoneypotGraph",
//     auth.verifyToken,
//     nodeController.deployedHoneypotGraph
//   );
  
//   router.post(
//     "/deployedNodeRegionWise",
//     auth.verifyToken,
//     nodeController.deployedNodeRegionWise
//   );
  
  
//   router.post(
//     "/deployedNodeSectorWise",
//     auth.verifyToken,
//     nodeController.deployedNodeSectorWise
//   );
  
  
//   router.post(
//     "/deployedHoneypotType",
//     auth.verifyToken,
//     nodeController.deployedHoneypotType
//   );
  
  
//   router.post(
//     "/deployedNodeHardware",
//     auth.verifyToken,
//     nodeController.deployedNodeHardware
//   );
  
  
//   router.post(
//     "/deployedNodeStatus",
//     auth.verifyToken,
//     nodeController.deployedNodeStatus
//   );
  
  
//   router.post(
//     "/deployedHoneypotStatus",
//     auth.verifyToken,
//     nodeController.deployedHoneypotStatus
//   );
  
  
//   router.post(
//     "/deployedHoneypotType",
//     auth.verifyToken,
//     nodeController.deployedHoneypotType
//   );
  
//   router.post(
//     "/deployedHoneypotCategory",
//     auth.verifyToken,
//     nodeController.deployedHoneypotCategory
//   );
  
// module.exports = router;

const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const usersController = require("../controllers/users.controller.js");
const nodeController = require("../controllers/nodeManagement.controller");
const validator = require('../validator/honeypotValidator.js')
// get honeypot details
router.get("/honeypotDetail", auth.verifyToken, usersController.honeypotDetail);

// get node details
router.get("/nodeDetail", auth.verifyToken, usersController.nodeDetail);

//getConfigDetails
router.post(
  "/getConfigDetails",
  auth.verifyToken,
  validator.CONFIGDETAIL,
  validator.handleValidationErrors,
  usersController.getConfigDetails
);

// honeypotConfig
// router.get("/honeypotConfig", auth.verifyToken, nodeController.honeypotConfig);

// getHoneypotData
router.post(
  "/getHoneypotData",
  auth.verifyToken,
  validator.HONEYPOTDETAIL,
  validator.handleValidationErrors,
  nodeController.getHoneypotData
);

//honeypotProfile
// router.post(
//   "/hpProfileConfig",
//   auth.verifyToken,
//   nodeController.hpProfileConfig
// );

//honeypotProfile
router.post("/gethpProfile", auth.verifyToken, nodeController.gethpProfile);

//getNodeConfig
router.post("/getNodeConfig", auth.verifyToken, nodeController.getNodeConfig);

//getImageName
router.post("/getImageName", auth.verifyToken, nodeController.getImageName);

//deviceType
router.post("/deviceType", auth.verifyToken, nodeController.deviceType);

//deviceName
router.post("/deviceName", auth.verifyToken, nodeController.deviceName);

// HiHp Data
router.post(
  "/getHoneypotDataHiHp",
  auth.verifyToken,
  validator.HONEYPOTDETAIL,
  validator.handleValidationErrors,
  nodeController.getHoneypotDataHiHp
);

//HiHp deviceType
router.post("/deviceTypeHiHp", auth.verifyToken, nodeController.deviceTypeHiHp);

//HiHp deviceName
router.post("/deviceNameHiHp", auth.verifyToken, nodeController.deviceNameHiHp);

//getNodeConfig
router.post("/getNodeConfigHIHP", auth.verifyToken, nodeController.getNodeConfigHIHP);


//hp_image
// router.post("/hp_image", auth.verifyToken, nodeController.hp_image);

//hp_service
// router.post("/hp_service", auth.verifyToken, nodeController.hp_service);

router.post(
  "/getNodeHealthConnection",
  auth.verifyToken,
  nodeController.getNodeHealthConnection
);

router.post(
  "/getHoneypotHealthConnection",
  auth.verifyToken,
  nodeController.getHoneypotHealthConnection
);

router.post(
  "/saveHoneypotConfig",
  auth.verifyToken,
  nodeController.saveHoneypotConfig
);

// HIHP Config
router.post(
  "/saveHoneypotConfigHiHp",
  auth.verifyToken,
  nodeController.saveHoneypotConfigHiHp
);

router.get("/getDownNodes", nodeController.getDownNodes);

router.post("/pdfbinary", auth.verifyToken, nodeController.pdfbinary);

router.post("/sqlBinaries", auth.verifyToken, nodeController.sqlBinaries);
router.post("/sqlAVdetails", auth.verifyToken, nodeController.sqlAVdetails);
router.post("/pdfbinary", auth.verifyToken, nodeController.pdfbinary);
router.post("/sqlpdfbinary", auth.verifyToken, nodeController.sqlpdfbinary);
// router.get("/deleteNoti",nodeController.deleteNoti)

// Route for getting data of node table where node_sensor_hp_type = "HIHP"
router.post("/nodeSensor", auth.verifyToken, nodeController.nodeSensor);



// Node Dashboard(heat-map) APIs

router.post(
  "/deployedHoneypotGraph",
  auth.verifyToken,
  nodeController.deployedHoneypotGraph
);

router.post(
  "/deployedNodeRegionWise",
  auth.verifyToken,
  nodeController.deployedNodeRegionWise
);


router.post(
  "/deployedNodeSectorWise",
  auth.verifyToken,
  nodeController.deployedNodeSectorWise
);


router.post(
  "/deployedHoneypotType",
  auth.verifyToken,
  nodeController.deployedHoneypotType
);


router.post(
  "/deployedNodeHardware",
  auth.verifyToken,
  nodeController.deployedNodeHardware
);


router.post(
  "/deployedNodeStatus",
  auth.verifyToken,
  nodeController.deployedNodeStatus
);


router.post(
  "/deployedHoneypotStatus",
  auth.verifyToken,
  nodeController.deployedHoneypotStatus
);


router.post(
  "/deployedHoneypotType",
  auth.verifyToken,
  nodeController.deployedHoneypotType
);

router.post(
  "/deployedHoneypotCategory",
  auth.verifyToken,
  nodeController.deployedHoneypotCategory
);

router.post(
  "/honeyotDeviceType",
  auth.verifyToken,
  nodeController.honeypotDeviceType
);

router.get(
  "/sectorFilterData",
  auth.verifyToken,
  nodeController.sectorFilterData
);

router.get(
  "/regionFilterData",
  auth.verifyToken,
  nodeController.regionFilterData
);

router.get(
  "/organizationFilterData",
  auth.verifyToken,
  nodeController.organizationFilterData
);
// router.get(
//   "/deployedDeviceType",
//   auth.verifyToken,
//   nodeController.deployedDeviceType
// );
module.exports = router;
