const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const honeypotController = require("../controllers/honeypot.controller");
const roleMiddleware = require("../../middleware/roleMiddleware");
var validation = require("../validator/honeypotValidator");

router.post(
  "/blueprintSubmit",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  validation.BLUEPRINT_DATA,
  validation.handleValidationErrors,
  honeypotController.blueprintSubmit
);

router.get(
  "/getHighNode",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.getHighNode
);

router.post(
  "/timeGraph",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.timeGraph
);

router.get(
  "/snapCount",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.snapCount
);

router.get(
  "/profileCount",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.profileCount
);

router.get(
  "/vulnerabilityCount",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.vulnerabilityCount
);

router.post(
  "/getProfiles",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.getProfiles
);

router.get(
  "/getHoneypots",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.getHoneypots
);

router.post(
  "/getVulnerabilities",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.getVulnerabilities
);

router.post(
  "/totalVulnerabilities",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.totalVulnerabilities
);

router.post(
  "/protocolTable",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.protocolTable
);

router.post(
  "/imageTable",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.imageTable
);

router.post(
  "/deviceNameTable",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.deviceNameTable
);

router.get(
  "/deviceTable",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.deviceTable
);

router.get(
  "/protocolsChart",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.protocolsChart
);

router.get(
  "/profileImage",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.profileImage
);

router.get(
  "/doubleVulnerabilities",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.doubleVulnerabilities
);

router.get(
  "/protocols",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.protocols
);

router.get(
  "/devices",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.devices
);

router.get(
  "/pieDevices",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.pieDevices
);

router.post(
  "/doubleProfilesDevices",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.doubleProfilesDevices
);

router.post(
  "/doubleProtocols",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.doubleProtocols
);

router.get(
  "/doubleDeviceVulnerabilities",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  honeypotController.doubleDeviceVulnerabilities
);

router.post(
  "/configData",
  auth.verifyToken,
  // roleMiddleware.checkForbiddenRoles(["user", "admin"]),
  validation.NODE_REGISTER,
  validation.handleValidationErrors,
  honeypotController.configData
);

router.post("/statesList", auth.verifyToken, honeypotController.getStates);

router.post("/citiesList", auth.verifyToken, honeypotController.getCities);

router.post("/addCity", auth.verifyToken, honeypotController.addCity);

router.post("/imageCheck", auth.verifyToken, honeypotController.imageCheck);

module.exports = router;
