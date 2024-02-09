const express = require('express');
const route = express.Router(); 
const elastic = require('elasticsearch');
const auth = require('../../middleware/auth')
const bodyParser = require('body-parser').json();


const elasticUsersController = require('../controllers/elastic.controller.js');
const AttackUserModel = require('../controllers/attack.controller.js');
const ChartController = require('../controllers/charts.controller')
const { Router } = require('express');


// const route = new elastic.Client({
//     host: 'http://localhost:9200',
// });

// get all data
route.get('/url', auth.verifyToken, elasticUsersController.getAllData)

// All data
// route.post('/organization-sector', auth.verifyToken, elasticUsersController.getUserList)

// post api for multiple operationg
route.post('/findeone', auth.verifyToken, elasticUsersController.findOneAPI)

// All resion
route.get('/region', auth.verifyToken, elasticUsersController.regionGet)

// get all sectors
route.get('/getAllSectors', auth.verifyToken, elasticUsersController.getAllSectors)

// get all Organization
route.get('/getAllOrganization', auth.verifyToken, elasticUsersController.getAllOrganization)

// get Organization
route.post('/getOrg', auth.verifyToken, elasticUsersController.getOrg)

// get all Organization
route.post('/getAllOrgIps', auth.verifyToken, elasticUsersController.getAllOrgIps)


// get all getAllOrgIpJson
route.post('/getAllOrgIpJson', auth.verifyToken, elasticUsersController.getAllOrgIpJson)

// Post API to get result on the bases of region, sector and organization
route.post('/searchOperation', auth.verifyToken, elasticUsersController.searchOperation)

// Get organizations via regions
route.post('/region', auth.verifyToken, elasticUsersController.regionPost)

// Get organizations via regions
route.get('/eventsData/:type', auth.verifyToken, elasticUsersController.eventsData)

// Get Threat Events 
route.post('/threatEvents', auth.verifyToken, elasticUsersController.threatEvents)

//Get Search By Criteria
route.post('/searchCriteria', auth.verifyToken, elasticUsersController.getCriteriaData)

//Get Json By Criteria
route.post('/jsonCriteria', auth.verifyToken, elasticUsersController.getCriteriaJson)

route.post('/sectorWiseAttack', auth.verifyToken, AttackUserModel.getSectorWiseAttack)

route.post('/getOrgWiseAttack', auth.verifyToken, AttackUserModel.getOrgWiseAttack)
route.post('/restapi', auth.verifyToken, AttackUserModel.getStix)
route.post("/getSnort", auth.verifyToken, AttackUserModel.getSnort);
route.post(
    "/getNodePcap",
    auth.verifyToken,
    elasticUsersController.getNodePcap
  );
  
// Top attacker IPs
route.post('/topAttackerIPs', auth.verifyToken, AttackUserModel.getTopAttackerIPs)

// get India attacker Ips IPs
route.post('/indiaIPsHash', auth.verifyToken, AttackUserModel.indiaIPsHash)

// get India attacker Ips IPs
route.post('/indiaips', auth.verifyToken, AttackUserModel.getIndiaIps)

// Top attacker Country
route.post('/topAttackCountry', auth.verifyToken, AttackUserModel.getTopAttackerCountry)

route.get(
  "/getHybridReport",
  auth.verifyToken,
  elasticUsersController.getHybridReport
);

route.post("/getThreatScore", auth.verifyToken, AttackUserModel.getThreatScore);


route.post(
  "/adarlabeldata",
  auth.verifyToken,
  elasticUsersController.adarlabeldata
);

// Top uniqueBinary
route.post('/uniqueBinary', auth.verifyToken, elasticUsersController.getUniqueBinary)

// Top Attacker Algo (MD5 Hash)
route.post('/getBinaryPcap', auth.verifyToken, elasticUsersController.getBinaryPcap)

// Top Malware Family
route.post('/topMalwareFamily', auth.verifyToken, AttackUserModel.getTopMalwareFamily)

// csv report generate
route.post('/generateCsvReport', auth.verifyToken, elasticUsersController.generateCsvReport)


// heat map
route.get('/getRegionWiseRecords', auth.verifyToken, AttackUserModel.getRecordsByStates)

// getBinary map
route.post('/getBinary', auth.verifyToken, AttackUserModel.getBinary)

//sectorNodes
route.post('/getSectorNodes',auth.verifyToken,ChartController.getSectorNodes)

route.get( "/getFile", auth.verifyToken, ChartController.getFile);

//topPorts
route.post("/topPorts",auth.verifyToken,ChartController.getTopPorts)


//trendPorts
route.post("/trendPorts",auth.verifyToken, ChartController.getTrendPorts)


//trendAttacks
route.post("/topAttackTrend",auth.verifyToken,ChartController.getTopTrendAttack)



route.post("/binNodes", auth.verifyToken, elasticUsersController.binNodes)

route.post("/downloadbinary",auth.verifyToken,elasticUsersController.downloadbinary)

module.exports = route