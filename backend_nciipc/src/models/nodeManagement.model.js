
let dbConn = require('../../config/db.config');
const { sequelize, DataTypes } = require('../../config/sequelize');
const User = require('../models/user.model')(sequelize, DataTypes);
const NodeLocations = require('../models/nodelocations.model')(sequelize, DataTypes);
const Node_id = require('../models/node_id.model')(sequelize, DataTypes);
const notifications = require('../models/notifications.model')(sequelize, DataTypes);
const jwt = require('jsonwebtoken');
const esb = require('elastic-builder');
const moment = require('moment')
const builder = require('xmlbuilder');
const doc = builder.create('root');
const path = require('path');
var fs = require("fs");
var Redmine = require('node-redmine');
const axios = require('axios');
var url = require('url')
var XMLHttpRequest = require('xhr2');
var elasticsearch = require('elasticsearch')
const config = process.env;
require("dotenv").config();
const puppeteer = require('puppeteer');






var client = new elasticsearch.Client({
    // host: 'http://192.168.8.163:9200'
    host: process.env.ES_Address
});



var hostname = 'http://192.168.8.167';
var apiKey = '741eb287ff6f0dcf3925ee84ac7f61e01649840c';


async function getRedmineIssue(){
    const customFieldValues = [];
const updateFieldValue = []
    const response = await axios.get(`${hostname}/issues.json?limit=800?key=${apiKey}`);

    for( let i =0;i<response.data.issues.length;i++){
        customFieldValues.push(response.data.issues[i].custom_fields[0].value)  
        updateFieldValue.push({ issue_id: response.data.issues[i].id, node_id: response.data.issues[i].custom_fields[0].value });
    }

    let nodeQuery = `SELECT node_id,node_location
    FROM honeybox.notifications AS n1
    WHERE n1.notification_type = 'node_down' and createdAt <= DATE_SUB(NOW(), INTERVAL 12 HOUR)
    AND NOT EXISTS (
      SELECT 1
      FROM honeybox.notifications AS n2
      WHERE n2.node_id = n1.node_id
      AND n2.notification_type = 'node_up'
      AND n2.createdAt > n1.createdAt
    ) group by node_id`;

    try{
        dbConn.query(nodeQuery, async (err,resp) => {

            const filteredData = resp
  .filter(row => !customFieldValues.includes(row.node_id.toString()))
  .map(row => ({ node_id: row.node_id, node_location: row.node_location }));

const block1Numbers = customFieldValues.map(Number);

const numbersNotInBlock2 = block1Numbers.filter(num => !resp.map(row=>row.node_id).includes(num));
const numbersNotInBlock2Strings = numbersNotInBlock2.map(String);
const filteredIssues = updateFieldValue.filter(item => numbersNotInBlock2Strings.includes(item.node_id));
const issueIdsWithMatchingNodeIds = filteredIssues.map(item => item.issue_id);

for(let i=0 ;i<issueIdsWithMatchingNodeIds.length;i++){
   updateRedmineIssue(issueIdsWithMatchingNodeIds[i])
 }
  for(let i=0 ;i<filteredData.length;i++){
   createRedmineIssue(filteredData[i].node_id,filteredData[i].node_location); 
  }

        });
    } catch(err){ }
}


async function updateRedmineIssue(issue_id) {
    const issueId = issue_id
    const issueData = {
        issue: {
            project_id: 1,
            tracker_id: 4,
            status_id: 5,
            priority_id: 3,
          },
    };
    const headersRedmine = { 'Content-Type': 'application/json' };

    try {

        const response = await axios.put(`${hostname}/issues/${issueId}.json?key=${apiKey}`, issueData, {
            headers: headersRedmine,
          });        
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  }

async function createRedmineIssue(node_id,node_loc) {
    const issueData = {
        issue: {
            project_id: 1,
            tracker_id: 4,
            status_id: 1,
            priority_id: 3,
            subject: `Node ${node_id} is down`,
            description: `The node ${node_id} is down.`,
            assigned_to_id: 1,
            custom_fields: [
                {
                  id: 1,
                  value: node_id 
                },
                {
                    id: 2,
                    value: node_loc
                  }
            ]
          },
    };
    const headersRedmine = { 'Content-Type': 'application/json' };

    try {

        const response = await axios.post(`${hostname}/issues.json?key=${apiKey}`, issueData, {
            headers: headersRedmine,
          });        

    
      const createdIssue = response.data.issue;

    //   console.log(`Issue #${createdIssue.id} created successfully.`);
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  }
  



let NodeModel = (data) => {
    create_at = new Date() | any;
    updated_at = new Date() | any;
}

var index_name = process.env.HP_Index

NodeLocations.hasMany(User, {
    foreignKey: 'user_id'
});

Node_id.hasOne(User, {
    foreignKey: 'user_id'
});

User.hasMany(Node_id, {
    foreignKey: 'user_id'
});




// NodeModel.gethpProfile = async (req,result) => {
//     // console.log('gethpProfile req',req.body);
//     let nodeQuery = `SELECT node_hp_profile.profile_id as profile,node_hp_profile.profile_name as value FROM node_hp_profile 
//     Inner Join node_snapshot_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id 
//     WHERE node_snapshot_hp_profile.snapshot_id = '${req.body.snapshot_id}'`;

//     try{
//         dbConn.query(nodeQuery, async (err,resp) => {
//             return result(null, resp);
//         });
//     } catch(err){
//         return result(null, err);
//     }
// }

// NodeModel.getNodeConfig = async (req,result) => {

//     let nodeQuery = `SELECT node_package.package_name AS value , node_package.package_id AS 'key' FROM node_hp_profile_package Inner Join node_package ON node_package.package_id = node_hp_profile_package.package_id WHERE node_hp_profile_package.profile_id =${req.body.profile}`;

//     try{
//         dbConn.query(nodeQuery, async (err,resp) => {

//             return result(null, resp);
//         });
//     } catch(err){
//         return result(null, err);
//     }
// }

// NodeModel.getHoneypotData = async (req,result) => {

    
//     let nodeQuery = `SELECT DISTINCT node_image.node_id, node_image.image_id, node_image.os_type, 
//     node_image.os_name, node_image.vm_type, node_image.vm_name, 
//     node_snapshot.snapshot_id, node_snapshot.snapshot_name, node_honeypot_type.hp_type 
//     FROM node_image 
//     Inner Join node_snapshot ON node_snapshot.image_id = node_image.image_id 
//     Inner Join node_snapshot_honeypot ON node_snapshot_honeypot.snapshot_id = node_snapshot.snapshot_id 
//     Inner Join node_honeypot_type ON node_honeypot_type.hp_id = node_snapshot_honeypot.hp_id 
//     WHERE node_image.node_id =   1
//     and (node_image.status=0 or node_image.vm_type='docker') and node_image.status!=3`;
//     try{
//         dbConn.query(nodeQuery, async (err,resp) => {
        
//             return result(null, resp);
//         });
//     } catch(err){
//         return result(null, err);
//     }
// }

// NodeModel.getDownNodes = async (result) => {
//     //  uncomment below for redmine functionality
//     // getRedmineIssue()
//     let addTime = new Date(new Date().getTime() + 1000 * 60 * 60 * 1.5).toISOString().replace('T', ' ').replace(/\.\d+/, "").replace('Z', '');
//     const todayStart = new Date(new Date().setHours(0o5, 30, 0, 0)).toISOString().replace('T', ' ').replace(/\.\d+/, "").replace('Z', '');
// console.log("todayStart",todayStart,"addTime",addTime)
//     let nodeQuery = `SELECT nodes.node_id, nodes.node_location,nodes.last_up_time,  CONCAT(IFNULL(subquery.users, ''), IF(node_ids_users.users_0 IS NOT NULL, CONCAT(',', node_ids_users.users_0), '')) AS users FROM node as nodes     LEFT OUTER JOIN (
//         SELECT node_ids.node_id, GROUP_CONCAT(node_ids.user_id ORDER BY node_ids.user_id) AS users
//         FROM node_ids
//         WHERE node_ids.node_id <> 0
//         GROUP BY node_ids.node_id
//     ) AS subquery ON subquery.node_id = nodes.node_id
//     LEFT JOIN (
//         SELECT GROUP_CONCAT(node_ids.user_id ORDER BY node_ids.user_id) AS users_0
//         FROM node_ids
//         WHERE node_ids.node_id = 0
//         GROUP BY node_ids.node_id
//     ) AS node_ids_users ON 1=1
//     WHERE nodes.node_status = 'Down' AND (nodes.last_up_time BETWEEN '${todayStart}' AND '${addTime}') Group BY nodes.node_id`;
//     try{
//         dbConn.query(nodeQuery, async (err, resp) => {
//             if (resp) {
//                 const nodeIds = resp.map(item => item.node_id);
               
//                 for (let node of resp) {
//                     await notifications.findOrCreate({
//                         where: {
//                             node_id: node.node_id, createdAt: {
//                                 $gt: todayStart
//                             }
//                         }, defaults: {
//                             user_id: 0,
//                             notification_type: 'node_down',
//                             node_location: node.node_location,
//                             createdAt: new Date(),
//                             notification_read_users: node.users
//                         }
//                     });
//                 }
//             }
//             return result(null, resp);
//         });
//     } catch(err){
//         return result(null, err);
//     }
// }

// NodeModel.getUpNodes = async (result) => {
   
//     const todayStart = new Date(new Date().setHours(0o5, 30, 0, 0)).toISOString().replace('T', ' ').replace(/\.\d+/, "").replace('Z', '');
//     let nodeQuery = `SELECT DISTINCT notifications.node_id, node.last_up_time, node.node_location, CONCAT(IFNULL(subquery.users, ''), IF(node_ids_users.users_0 IS NOT NULL, CONCAT(',', node_ids_users.users_0), '')) AS users
//     FROM notifications
//     INNER JOIN node ON node.node_id = notifications.node_id
//     LEFT OUTER JOIN (
//         SELECT node_ids.node_id, GROUP_CONCAT(node_ids.user_id ORDER BY node_ids.user_id) AS users
//         FROM node_ids
//         WHERE node_ids.node_id <> 0
//         GROUP BY node_ids.node_id
//     ) AS subquery ON subquery.node_id = notifications.node_id
//     LEFT JOIN (
//         SELECT GROUP_CONCAT(node_ids.user_id ORDER BY node_ids.user_id) AS users_0
//         FROM node_ids
//         WHERE node_ids.node_id = 0
//         GROUP BY node_ids.node_id
//     ) AS node_ids_users ON 1=1
//     WHERE notifications.createdAt BETWEEN DATE_SUB(NOW(), INTERVAL 1 WEEK) AND NOW()
//         AND notifications.notification_type = 'node_down'
//         AND node.node_status = 'up'
//         AND notifications.node_id NOT IN (
//             SELECT node_id
//             FROM notifications
//             WHERE notification_type = 'node_up'
//         );`;

//     try{    
//         dbConn.query(nodeQuery, async (err, resp) => {

//             if (resp) {
//                 for (let node of resp) {
//                 let que =  await notifications.findOrCreate({
//                         where: {
//                             node_id: node.node_id, createdAt: {
//                                 $eq:  node.last_up_time
//                             }
//                         }, defaults: {
//                             user_id: 0,
//                             notification_type: 'node_up',
//                             node_location: node.node_location,
//                             createdAt: node.last_up_time,
//                             notification_read_users: node.users
//                         }
//                     });
//                 }
//             }
//             return result(null, resp);
//         });
//     } catch(err){
//         return result(null, err);
//     }
// }


// NodeModel.deleteNoti = async(result)=>{
//     try{
//         dbConn.query(`delete FROM notifications WHERE DATE(createdAt) < (NOW() - INTERVAL 7 DAY)`, (err, res) =>{
//                 return result(null, res);
//         })
//     } catch(err){
//         return result(null, err);
//     }
// }

// NodeModel.getNodeHealthConnection = async(req,result)=>{
//     const list = [];

//     try{
//         dbConn.query(`SELECT date_format(last_update_time,'%Y-%m-%d %H:%i:00') AS date, health_type as type FROM node_health where node_id = ${req.body.node} ORDER BY last_update_time desc limit 0,10000`, (err, res) =>{
//             const data = res
//             let type = 'conf';
//             const list = [];
//             let date1 = moment();
//             let date2 = moment();
            
//             for (let i = data.length - 1; i >= 0; i--) {
//               const row = data[i];
//               const currentDate = moment(row.date, 'YYYY-MM-DD HH:mm:ss');
//               const dataObj = {
//                 Date: row.date,
//                 value: '1',
//                 Volume: '1',
//               };
            
//               if (i > 0) {
//                 date2 = date1.clone().add(6, 'minutes');
//                 let j = date2.diff(currentDate, 'minutes');
//                 date2 = date1.clone();
//                 if (row.type.toLowerCase() === 'pcap' || type.toLowerCase() === 'pcap') {
//                   j = 1;
//                 }
//                 while (j < 0) {
//                   date2.add(1, 'minute');
//                   const output = date2.format('YYYY-MM-DD HH:mm:ss');
//                   const data1 = {
//                     Date: output,
//                     value: j < 0 ? '-1' : '1',
//                     Volume: j < 0 ? '-1' : '1',
//                   };
//                   list.push(data1);
//                   j = date2.diff(currentDate, 'minutes');
//                 }
//               }
//               list.push(dataObj);
//               type = row.type;
//               date1 = currentDate;
//             }
            
//             // console.log(list);
//             return result(null, list);
//         })
//     } catch(err){
//         return result(null, err);
//     }
// }

// NodeModel.saveHoneypotConfig = async(req,result)=>{

//     var conf_id = 0;
//     var {
//         hp_type,
//         hp_services,
//         node_id,
//         vm_name
//     } = req.body;

//   var  serv = hp_services.filter((e)=>{
//         if(e && e != undefined && e != null && e != ''){
//             return e;
//         }
//     });

//     let servieslist = await getServiceList(serv);
    

//     let services = await getServices(serv);
     

//         if(servieslist && services){
//              servieslist.filter((servL)=>{
//                 services.filter((e)=>{
//                     if(servL.conf_id == e.conf_id){
//                         conf_id = servL.conf_id;
//                     }
//                 })
//             })
//         }        
     
//         if (conf_id == 0) {
//             let maxNode = await getMaxNode();
//             let insertedNode = await InsertNode(maxNode,serv);
//         }
        
//         // if conf id exists
//         let hptypeId = await gethp_typeid(hp_type);
      
        
//         // insert new config
//         let newConfig = await createConfig(req.body,serv,conf_id,hptypeId);

   
//         let nodeNetdata = await getNodeIpsData(node_id);

//         const ipAddressList = [];
//         const ipAddressType = {};
        
//         nodeNetdata.forEach((row) => {
//           if (row.type === 'public') {
//             ipAddressList.push(row.ip_address);
//           } else {
//             ipAddressType[row.type] = row.ip_address;
//           }
//         });

//         const randomIp = getRandomIp(ipAddressList);
// // console.log("--------------------------",nodeNetdata)
//         let updateNImage = await updateNodeImage(vm_name,node_id);


//         let currentNodeConfig = await getCurrentConfiguration(node_id);
           
//         let updateConfig = await updateNodeConfig(currentNodeConfig,randomIp)

//         let currentConfig = await getCurrentConfiguration(node_id);

//          let generateXml = await getXmlObject(currentConfig,nodeNetdata,req.body);
         
// // console.log("-----------------------------------",generateXml)
//          // set ip
//         // let setIpAdd = await setIpAddress(currentConfig,conf_id);


//         // set node config

//         let setNode = await setNodeConfig(currentConfig,conf_id);


//         if(setNode){
//             return result( {
//                 status :1,
//                 message: "Honeypot added successfully",
//                 data: setNode
//             })
//         } 
        
// }

// function getRandomIp(ipAddressList) {
//     const randomIndex = Math.floor(Math.random() * ipAddressList.length);
//     return ipAddressList[randomIndex];
//   }

// async function getCurrentConfiguration(node_id){
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {

//             let nodeNetquery = "SELECT node_configuration.node_id, node_configuration.conf_id, node_configuration.network_type, node_configuration.vm_type, node_configuration.vm_name, "
//             + "node_configuration.os_type, node_configuration.honeypot_type, node_configuration.honeypot_profile, node_configuration.snapshot_name, node_configuration.honeypot_count, "
//             + "node_configuration.u_conf_id, node_configuration.os_name, node_configuration.start_date,node_configuration.end_date, node_configuration.health_status, node_configuration.ip_address, "
//             + "node_image.image_name, node_image.image_tag "
//             + "FROM  node_configuration Left Join node_image ON node_image.node_id = node_configuration.node_id AND node_image.vm_name = node_configuration.vm_name "
//             + "WHERE " + "node_configuration.node_id =  " + node_id + " AND node_configuration.end_date IS NULL ";
//               dbConn.query(nodeNetquery, async (err,res) => {
//                 resolve(res)
//             })
        
//         }, 300);
//     });

   
// }

// async function InsertNode(maxNode,service){
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             service.map((e)=>{
//                 query = `insert into node_configuration_package(conf_id,package_id) values(${maxNode},${e})`;
//                 dbConn.query(query,async (err, res) => {
               
//                     resolve(res)
//                 })
//             })
//         });
//     });  
// }
// async function InsertNode(maxNode,service){
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             service.map((e)=>{
//                 query = `insert into node_configuration_package(conf_id,package_id) values(${maxNode},${e})`;
//                 dbConn.query(query,async (err, res) => {
           
//                     resolve(res)
//                 })
//             })
//         });
//     });  
// }

// async function updateNodeImage(vm_name,node_id){
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
            
//             query = `update node_image set node_image.status=1 where node_image.vm_name= '${vm_name}' and node_image.node_id=${node_id}`;

//                 dbConn.query(query,async (err, res) => {
           
//                     resolve(res)
//                 })
            
//         });
//     });  
// }


// async function setIpAddress(allConfs){
//     return new Promise((resolve, reject) => {
//         // console.log("setNodeConfig------",allConfs)
//         setTimeout(() => {
           
//                 allConfs.map((conf,i)=>{
//                     // console.log("-------setNodeConfig------",conf.ip_address)
//             let nodeConf = `UPDATE node_configuration set ip_address = '${conf.ip_address}' where u_conf_id =  ${conf.u_conf_id}`;
//                  dbConn.query(nodeConf, async (err,res) => {
                   
//                     if(i == allConfs.length - 1){
//                         resolve(res);
//                     }
//                 })
//             })
            
//         }, 1);
//     });

   
// }


// async function setNodeConfig(allConfs){
//     return new Promise((resolve, reject) => {
//         console.log("allConfs",allConfs)
//         setTimeout(() => {
//             allConfs.map((conf,i)=>{
//             //  console.log("conf.ip_address---------",conf.ip_address)
//             let nodeConf = `update node_network set status=1 where ip_address = '${conf.ip_address}'`;
//                  dbConn.query(nodeConf, async (err,res) => {
                  
//                     if(i == allConfs.length - 1){
//                         resolve(res);
//                     }
//                 })
//              });
            
//         }, 1);
//     });

   
// }

// async function getNodeIpsData(node_id){
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
            
//                 query = `SELECT DISTINCT ip_address,type FROM node_network WHERE node_network.node_id = ${node_id} and status = 0`;
//                 dbConn.query(query,async (err, res) => {
                 
//                     resolve(res)
//                 })
            
//         });
//     });  
// }

// async function  createConfig(req,serv,conf_id,hptypeId){

//     // console.log('req',req,'serv',serv);
//     // console.log('hptypeId',hptypeId);
//     // console.log('hptypeId',hptypeId[0].hp_id);

//     var {hp_type, node_id,os_type, os_ver_type, vm_name,vm_type, snapshot_id, profile,network_type,number_of_honeypot } = req;
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             query = `insert into node_configuration(node_id, os_type, os_name, vm_type, vm_name, snapshot_name, conf_id, honeypot_count, network_type, hp_id, honeypot_type,honeypot_profile) 
//                                         values(${node_id},'${os_type}','${os_ver_type}','${vm_type}','${vm_name}','${snapshot_id}','${conf_id}','${number_of_honeypot}','${network_type}','${hptypeId[0].hp_id}','${hp_type}','${profile}')`;
   

//             dbConn.query(query,async (err, res) => {

//                    resolve(res);
//             });
        
//         });
//     });  
// }


// async function  updateNodeConfig(allconf,ip_add){
// console.log("==================allconf",allconf)
// console.log("==================ip_add",ip_add)

// const confIdsWithNullIp = allconf.filter(item => item.ip_address === null).map(item => item.u_conf_id);

// console.log(confIdsWithNullIp);

//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             query = `UPDATE node_configuration set ip_address = '${ip_add}' where u_conf_id = '${confIdsWithNullIp}'`;
   

//             dbConn.query(query,async (err, res) => {
// console.log("errrrrrrrrrr",res)
//                    resolve(res);
//             });
        
//         });
//     });  
// }

// async function gethp_typeid(hp_type){
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             query = `SELECT hp_id FROM node_honeypot_type WHERE hp_type = '${hp_type}'`;
//             dbConn.query(query,async (err, res) => {
//                    resolve(res);
//             });
        
//         });
//     });  
// }

// async function getMaxNode(){
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             query = "SELECT Max(node_configuration_package.conf_id) AS conf_id FROM node_configuration_package";
//             dbConn.query(query,async (err, res) => {
//                 resolve(res)
//             })
        
//         });
//     });  
// }
// async function getServiceList(service){
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             query = "SELECT node_configuration_package.conf_id, Count(node_configuration_package.package_id) AS pkg_count FROM node_configuration_package WHERE node_configuration_package.package_id IN  ("
//             + service + ") GROUP BY node_configuration_package.conf_id HAVING pkg_count =  " + service.length + "";
//             dbConn.query(query,async (err, res) => {
//                 resolve(res)
//             })
        
//         });
//     });  
// }


// async function getServices(service){
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             query = "SELECT node_configuration_package.conf_id, Count(node_configuration_package.package_id) AS pkg_count FROM node_configuration_package GROUP BY node_configuration_package.conf_id HAVING pkg_count ="+ service.length ;
//             dbConn.query(query,async (err, res) => {
//                 resolve(res)
//             })
        
//         });
//     });  
// }



// async function getXmlObject(allConfs,nodeNetdata,reqbody){

//     var static_ip = '';
//     var netmask = '';
//     var gateway = '';
//     var dns = '';

//     nodeNetdata.map((e)=>{
//         if(e.type == 'static_ip'){
//             static_ip =  e.ip_address;
//         }
//         if(e.type == 'netmask'){
//             netmask =  e.ip_address;
//         }
//         if(e.type == 'gateway'){
//             gateway =  e.ip_address;
//         }
//         if(e.type == 'dns'){
//             dns =  e.ip_address;
//         }
//     });


//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             let honeypot = [];
//             for(let conf of allConfs){

            
//             var obj = {
               
                   
//                         UConfID:{
//                             '#text':conf.conf_id
//                         },
//                         VmInfo:{
//                             VmType:{
//                                 '#text':conf.vm_type
//                             },
//                             VmName:{
//                                 '#text':conf.vm_name
//                             },
//                             OsType:{
//                                 '#text':conf.os_type
//                             },
//                             HoneypotType:{
//                                 '#text':conf.honeypot_type
//                             },
//                             HoneypotName:{
//                                 '#text':conf.snapshot_name
//                             },
//                             SnapshotName:{
//                                 '#text':conf.snapshot_name
//                             },
//                             ContainerCount:{
//                                 '#text':conf.honeypot_count
//                             },
//                             repo:{
//                                 '#text': config.Xml_Repo+'/'+conf.image_name+':'+conf.image_tag
//                             },
//                         },
//                         Network: {
//                             NetworkType:{
//                                 '#text':conf.network_type
//                             },
//                             IPAddress:{
//                                 '#text':conf.ip_address
//                             },
//                             Netmask:{
//                                 '#text':netmask
//                             },
//                             Gateway:{
//                                 '#text':gateway
//                             },
//                             DNS:{
//                                 '#text':dns
//                             },
//                     },
//                     Profile:{
//                         '#text':reqbody.honeypot_profile
//                     },
//                     ServiceInfo:{
//                         ServiceName:{
//                             '#text':reqbody.services
//                         }
//                     }
                  
                
//               };
//               honeypot.push(obj);
//             }
//                 var newObj = {
//                     DHS : {
//                         Honeypot : honeypot
//                     }   
                    
//                 }
//             var finalDocument = newObj;
//                 var builder = require('xmlbuilder');
//                 var document = builder.create(finalDocument).end({ pretty: true});

//                 // save file start
//                 var dir =__dirname+'/BB_LOGS/honeypot_conf/'+reqbody.node_id+'/';
//                 if (!fs.existsSync(dir)) {
//                     fs.promises.mkdir(dir, { recursive: true });
//                 }

//                 setTimeout(() => {
//                 fs.writeFile(dir+"Honeypot.xml",  document.toString(), (err) => {
//                     if (err)
//                         console.log(err);
//                         else {
//                         console.log("File written successfully\n");
//                         }
//                     });
//                 }, 100);
//                 //   save file end


//               resolve(obj);

//         }, 300);
//     });

   
// }



// NodeModel.honeypotConfig = (req, result) => {
//     try{
//         client.search({
//             index: index_name,
//             body: {
//                 aggs: {
//                     NAME: {
//                         terms: {
//                             field: "hp_type.keyword",
//                             size: 50
//                         }
//                     }
//                 },
//                 size: 0
//             }
//         })
//             .then(resp => {

//                 if (resp) {
//                     return result(null, {
//                         data: resp.aggregations.NAME.buckets
//                     });
//                 }
//             });
//         }
//         catch(err) {
//             return result(null, {
//                 msg: 'Error not found',
//                 err
//             });
//         }
// }

// NodeModel.hpProfileConfig = (req, result) => {
//     try{
//         client.search({
//             index: index_name,
//             body: {
//                 query: {
//                     bool: {
//                         must: [
//                             {
//                                 match_phrase: {
//                                     "hp_type.keyword": {
//                                         query: req.body.data
//                                     }
//                                 }
//                             }
//                         ]
//                     }
//                 },
//                 aggs: {
//                     NAME: {
//                         terms: {
//                             field: "hp_profile.profile_name.keyword",
//                             size: 1000
//                         }
//                     }
//                 },
//                 size: 0
//             }
//         })
//             .then(resp => {

//                 if (resp) {
//                     return result(null, {
//                         data: resp.aggregations.NAME.buckets
//                     });
//                 }
//             });
//         }
//         catch(err) {
//             return result(null, {
//                 msg: 'Error not found',
//                 err
//             });
//         }
// }


// NodeModel.hp_image = (req, result) => {
//     try{
//         client.search({
//             index: index_name,
//             body: {
//                 query: {
//                     bool: {
//                         must: [
//                             {
//                                 match_phrase: {
//                                     "hp_type.keyword": {
//                                         query: req.body.type
//                                     }
//                                 }
//                             },
//                             {
//                                 match_phrase: {
//                                     "hp_profile.profile_name.keyword": {
//                                         query: req.body.data
//                                     }
//                                 }
//                             }
//                         ]
//                     }
//                 },
//                 aggs: {
//                     NAME: {
//                         terms: {
//                             field: "image_id.keyword",
//                             size: 1000
//                         }
//                     }
//                 },
//                 size: 0
//             }
//         })
//             .then(resp => {

//                 if (resp) {
//                     return result(null, {
//                         data: resp.aggregations.NAME.buckets
//                     });
//                 }
//             });
//         } catch(err) {
//             return result(null, {
//                 msg: 'Error not found',
//                 err
//             });
//         }
// }

// NodeModel.hp_service = (req, result) => {

//     // console.log('req.body.data',req.body.data);
//     try{
//         client.search({
//             index: index_name,
//             body: {
//                 query: {
//                     bool: {
//                         must: [

//                             {
//                                 match: {
//                                     "image_id.keyword": {
//                                         query: req.body.data
//                                     }
//                                 }
//                             }
//                         ]
//                     }
//                 }
//             }
//         })
//             .then(resp => {

//                 if (resp) {
//                     return result(null, {
//                         data: resp
//                     });
//                 }
//             });
//         }catch(err) {
//             return result(null, {
//                 msg: 'Error not found',
//                 err
//             });
//         }
// }


// NodeModel.honeypotDeviceType = async (req, result) => {
//     try {
//       dbConn.query(
//         // `SELECT device_type, device_name, COUNT(*) AS device_count
//         // FROM node_hp_profile
//         // GROUP BY device_type, device_name
//         // ORDER BY device_type, device_count DESC limit 10;`,
//         // `WITH RankedDeviceTypes AS (
//         //   SELECT
//         //     device_type,
//         //     ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS row_num
//         //   FROM
//         //     node_hp_profile
//         //   GROUP BY
//         //     device_type
//         // )
//         // SELECT
//         //   ndp.device_type,
//         //   ndp.device_name,
//         //   COUNT(*) AS device_count
//         // FROM
//         //   node_hp_profile ndp
//         // JOIN
//         //   RankedDeviceTypes rdt ON ndp.device_type = rdt.device_type
//         // WHERE
//         //   rdt.row_num <= 10
//         // GROUP BY
//         //   ndp.device_type,
//         //   ndp.device_name
//         // ORDER BY
//         //   ndp.device_type,
//         //   device_count DESC;
        
//         // `,
//         `WITH RankedDeviceTypes AS (
//           SELECT
//             device_type,
//             ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS row_num
//           FROM
//             node_hp_profile
//           GROUP BY
//             device_type
//         )
//         SELECT
//           ndp.device_type,
//           ndp.device_name,
//           COUNT(*) AS device_count
//         FROM
//           node_hp_profile ndp
//         JOIN
//           RankedDeviceTypes rdt ON ndp.device_type = rdt.device_type
//           inner join node_snapshot_hp_profile as nshp ON nshp.profile_id = ndp.profile_id
//           inner join node_snapshot as ns ON ns.snapshot_id = nshp.snapshot_id
//           inner join node_image as ni ON ni.image_id = ns.image_id
//         WHERE
//                 ni.status = 1 AND 
//           rdt.row_num <= 10
//         GROUP BY
//           ndp.device_type,
//           ndp.device_name
//         ORDER BY
//           ndp.device_type,
//           device_count DESC;
//         `,
//         (err, res) => {
//           if (err) {
//             return result(err, null);
//           }
  
//           const organizedData = res.reduce((acc, row) => {
//             const { device_type, device_name, device_count } = row;
//             if (!acc[device_type]) {
//               acc[device_type] = [];
//             }
//             acc[device_type].push({ device_name, device_count });
//             return acc;
//           }, {});
//           return result(null, organizedData);
//         }
//       );
//     } catch (err) {
//       return result(err, null);
//     }
//   };

//   NodeModel.regionFilterData = async (req, result) => {
//     try {
//       const query = `
//         SELECT COUNT(region) AS doc_count, region
//         FROM honeybox.node_location
//         GROUP BY region;
//       `;
//       dbConn.query(query, (err, res) => {
//         if (err) {
//           return result(err, null);
//         }
  
//         const formattedResult = {
//           data: res.map(item => ({
//             key: item.region,
//             doc_count: item.doc_count
//           })),
//           message: "Here is your finding result!!"
//         };
  
//         return result(null, formattedResult);
//       });
//     } catch (err) {
//       return result(err, null);
//     }
//   };
  
//   NodeModel.sectorFilterData = async (req, result) => {
//     try {
//       const query = `
//         SELECT COUNT(sector) AS doc_count, sector
//         FROM honeybox.node_location
//         GROUP BY sector;
//       `;
//       dbConn.query(query, (err, res) => {
//         if (err) {
//           return result(err, null);
//         }
  
//         const formattedResult = {
//           data: res.map(item => ({
//             key: item.sector,
//             doc_count: item.doc_count
//           })),
//           message: "Here is your finding result!!"
//         };
  
//         return result(null, formattedResult);
//       });
//     } catch (err) {
//       return result(err, null);
//     }
//   };
  
//   NodeModel.organizationFilterData = async (req, result) => {
//     try {
//       const query = `
//         SELECT COUNT(organization) AS doc_count, organization
//         FROM honeybox.node_location
//         GROUP BY organization;
//       `;
//       dbConn.query(query, (err, res) => {
//         if (err) {
//           return result(err, null);
//         }
  
//         const formattedResult = {
//           data: res.map(item => ({
//             key: item.organization,
//             doc_count: item.doc_count
//           })),
//           message: "Here is your finding result!!"
//         };
  
//         return result(null, formattedResult);
//       });
//     } catch (err) {
//       return result(err, null);
//     }
//   };

//   NodeModel.deployedHoneypotCategory = async (req, result) => {
//     try {
//       const { region, organizations, sector } = req.body.data;
  
//       const regionFilter = region.length ? `AND node_location.region IN ('${region.join("','")}')` : '';
//       const organizationsFilter = organizations.length ? `AND node_location.organization IN ('${organizations.join("','")}')` : '';
//       const sectorFilter = sector.length ? `AND node_location.sector IN ('${sector.join("','")}')` : '';
//       dbConn.query(
//         `SELECT COUNT( node_id) AS honeypot_count, 
//         SUBSTRING_INDEX(SUBSTRING_INDEX(honeypot_profile, ':', 2), ':', -1) AS extracted_value
//   FROM node_configuration
//   inner join node_location on node_location.id = node_configuration.node_id
//   WHERE end_date IS NULL
//   ${regionFilter}
//   ${organizationsFilter}
//   ${sectorFilter}
//   GROUP BY extracted_value;
//   ;
//         `,
//         (err, res) => {
//           if (err) {
//             return result(err, null);
//           }
//           return result(null, res);
//         }
//       );
//     } catch (err) {
//       return result(err, null);
//     }
//   };
  
//   // NodeModel.deployedHoneypotType = async (req, result) => {
//   //   try {
//   //     dbConn.query(
//   //       `SELECT COUNT(DISTINCT node_id) AS honeypot_count, 
//   //       SUBSTRING_INDEX(SUBSTRING_INDEX(honeypot_profile, ':', 2), ':', -1) AS extracted_value
//   // FROM node_configuration
//   // WHERE end_date IS NULL
//   // GROUP BY extracted_value;
//   // ;
//   //       `,
//   //       (err, res) => {
//   //         if (err) {
//   //           return result(err, null);
//   //         }
//   //         return result(null, res);
//   //       }
//   //     );
//   //   } catch (err) {
//   //     return result(err, null);
//   //   }
//   // };
  
//   NodeModel.deployedHoneypotStatus = async (req, result) => {
//     try {
//       const { region, organizations, sector } = req.body.data;
  
//       const regionFilter = region.length ? `AND node_location.region IN ('${region.join("','")}')` : '';
//       const organizationsFilter = organizations.length ? `AND node_location.organization IN ('${organizations.join("','")}')` : '';
//       const sectorFilter = sector.length ? `AND node_location.sector IN ('${sector.join("','")}')` : '';
//       dbConn.query(
//         `SELECT COUNT( node_configuration.node_id) AS honeypot_count, node_configuration.health_status
//         FROM node_configuration
//         inner join node_location on node_location.id = node_configuration.node_id
//         WHERE node_configuration.end_date IS NULL
//         ${regionFilter}
//         ${organizationsFilter}
//         ${sectorFilter}
//         GROUP BY node_configuration.health_status;      
//   ;
//         `,
//         (err, res) => {
//           if (err) {
//             return result(err, null);
//           }
//           return result(null, res);
//         }
//       );
//     } catch (err) {
//       return result(err, null);
//     }
//   };
  
//   NodeModel.deployedNodeStatus = async (req, result) => {
//     try {
//       const { region, organizations, sector } = req.body.data;
  
//       const regionFilter = region.length ? `AND node_location.region IN ('${region.join("','")}')` : '';
//       const organizationsFilter = organizations.length ? `AND node_location.organization IN ('${organizations.join("','")}')` : '';
//       const sectorFilter = sector.length ? `AND node_location.sector IN ('${sector.join("','")}')` : '';
//       // console.log(regionFilter)
//       // console.log(organizationsFilter)
//       // console.log(sectorFilter)
//       dbConn.query(
//         `SELECT COUNT(DISTINCT node.node_id) AS node_count, node.node_status
//         FROM node
//         inner join node_location on node.node_id = node_location.id
//         where node_state = 'Active'
//         ${regionFilter}
//         ${organizationsFilter}
//         ${sectorFilter}
//         GROUP BY node.node_status;
//   ;
//         `,
//         (err, res) => {
//           if (err) {
//             return result(err, null);
//           }
//           return result(null, res);
//         }
//       );
//     } catch (err) {
//       return result(err, null);
//     }
//   };
  
//   NodeModel.deployedNodeHardware = async (req, result) => {
//     try {
//       const { region, organizations, sector } = req.body.data;
  
//       const regionFilter = region.length ? `AND node_location.region IN ('${region.join("','")}')` : '';
//       const organizationsFilter = organizations.length ? `AND node_location.organization IN ('${organizations.join("','")}')` : '';
//       const sectorFilter = sector.length ? `AND node_location.sector IN ('${sector.join("','")}')` : '';
  
//       dbConn.query(
//         `SELECT COUNT( node.node_id) AS node_count, node.node_hardware
//         FROM node
//         inner join node_location on node.node_id = node_location.id
//         where node_state = 'Active'
//         ${regionFilter}
//         ${organizationsFilter}
//         ${sectorFilter}
//         GROUP BY node.node_hardware;      
//   ;
//         `,
//         (err, res) => {
//           if (err) {
//             return result(err, null);
//           }
//           return result(null, res);
//         }
//       );
//     } catch (err) {
//       return result(err, null);
//     }
//   };
  
//   NodeModel.deployedHoneypotType = async (req, result) => {
//     try {
//       const { region, organizations, sector } = req.body.data;
  
//       const regionFilter = region.length ? `AND node_location.region IN ('${region.join("','")}')` : '';
//       const organizationsFilter = organizations.length ? `AND node_location.organization IN ('${organizations.join("','")}')` : '';
//       const sectorFilter = sector.length ? `AND node_location.sector IN ('${sector.join("','")}')` : '';
//       dbConn.query(
//         `SELECT COUNT( node.node_id) AS node_count, node.node_sensor_hp_type
//         FROM node
//         inner join node_configuration on node_configuration.node_id = node.node_id
//         inner join node_location on node.node_id = node_location.id
//         WHERE node_configuration.end_date IS NULL
//         ${regionFilter}
//         ${organizationsFilter}
//         ${sectorFilter}
//         GROUP BY node.node_sensor_hp_type;      
//   ;
//         `,
//         (err, res) => {
//           if (err) {
//             return result(err, null);
//           }
//           return result(null, res);
//         }
//       );
//     } catch (err) {
//       return result(err, null);
//     }
//   };
  
//   NodeModel.deployedNodeSectorWise = async (req, result) => {
//     try {
//       const { region, organizations, sector } = req.body.data;
  
//       const regionFilter = region.length ? `AND node_location.region IN ('${region.join("','")}')` : '';
//       const organizationsFilter = organizations.length ? `AND node_location.organization IN ('${organizations.join("','")}')` : '';
//       const sectorFilter = sector.length ? `AND node_location.sector IN ('${sector.join("','")}')` : '';
  
//       dbConn.query(
//         `SELECT COUNT(DISTINCT node.node_id) AS node_count, node_location.sector
//         FROM node_location
//         INNER JOIN node ON node.node_id = node_location.id
//         where node_state = 'Active'
//         ${regionFilter}
//         ${organizationsFilter}
//         ${sectorFilter}
//         GROUP BY node_location.sector;
//         `,
//         (err, res) => {
//           if (err) {
//             return result(err, null);
//           }
//           return result(null, res);
//         }
//       );
//     } catch (err) {
//       return result(err, null);
//     }
//   };
  
//   // NodeModel.deployedNodeRegionWise = async (req, result) => {
//   //   try {
//   //     dbConn.query(
//   //       `SELECT COUNT(DISTINCT node_configuration.node_id) AS node_count, node_location.region
//   //       FROM node_location
//   //       INNER JOIN node_configuration ON node_configuration.node_id = node_location.id
//   //       WHERE node_configuration.end_date IS NULL
//   //       GROUP BY node_location.region;      
//   // ;
//   //       `,
//   //       (err, res) => {
//   //         if (err) {
//   //           return result(err, null);
//   //         }
//   //         return result(null, res);
//   //       }
//   //     );
//   //   } catch (err) {
//   //     return result(err, null);
//   //   }
//   // };
  
//   NodeModel.deployedNodeRegionWise = async (req, result) => {
//     try {
//       const { region, organizations, sector } = req.body.data;
  
//       const regionFilter = region.length ? `AND node_location.region IN ('${region.join("','")}')` : '';
//       const organizationsFilter = organizations.length ? `AND node_location.organization IN ('${organizations.join("','")}')` : '';
//       const sectorFilter = sector.length ? `AND node_location.sector IN ('${sector.join("','")}')` : '';
  
//       const query = `
//         SELECT COUNT(DISTINCT node.node_id) AS node_count, node_location.region
//         FROM node_location
//         INNER JOIN node ON node.node_id = node_location.id
//         where node_state = 'Active'
//         ${regionFilter}
//         ${organizationsFilter}
//         ${sectorFilter}
//         GROUP BY node_location.region;
//       `;
  
//       dbConn.query(query, (err, res) => {
//         if (err) {
//           return result(err, null);
//         }
//         return result(null, res);
//       });
//     } catch (err) {
//       return result(err, null);
//     }
//   };
  
//   NodeModel.deployedHoneypotGraph = async (req, result) => {
//     try {
//    // SELECT DATE_FORMAT(node_reg_date, '%Y-%m') AS timestamp, COUNT(*) AS count
//       // FROM node
//       // where node_state = 'Active'
//       // GROUP BY timestamp;
//       const query = `
     
//       SELECT DATE_FORMAT(node_reg_date, '%Y-%m-%d %H:%i:%s') AS timestamp, COUNT(*) AS count
//   FROM node
//   WHERE node_state = 'Active'
//   GROUP BY timestamp;
  
//       `;
  
//       dbConn.query(query, (err, res) => {
//         if (err) {
//           return result(err, null);
//         }
//         return result(null, res);
//       });
//     } catch (err) {
//       return result(err, null);
//     }
//   };
  
// module.exports = NodeModel

// let dbConn = require("../../config/db.config");
// let dbRedmine = require("../../config/redminedb.config");
// const { sequelize, DataTypes } = require("../../config/sequelize");
// const User = require("../models/user.model")(sequelize, DataTypes);
// const NodeLocations = require("../models/nodelocations.model")(
//   sequelize,
//   DataTypes
// );
// const Node_id = require("../models/node_id.model")(sequelize, DataTypes);
// const notifications = require("../models/notifications.model")(
//   sequelize,
//   DataTypes
// );
// const jwt = require("jsonwebtoken");
// const esb = require("elastic-builder");
// const moment = require("moment");
// const builder = require("xmlbuilder");
// const doc = builder.create("root");
// const path = require("path");
// var fs = require("fs");
// var Redmine = require("node-redmine");
// const axios = require("axios");
// var url = require("url");
// var XMLHttpRequest = require("xhr2");
// var elasticsearch = require("elasticsearch");
// const config = process.env;
// require("dotenv").config();
// const puppeteer = require("puppeteer");

// var client = new elasticsearch.Client({
//   host: process.env.ES_Address,
// });

// var hostname = process.env.Redmine;
// var apiKey = "741eb287ff6f0dcf3925ee84ac7f61e01649840c";

// async function getRedmineIssue() {
//   var sqlData;
//   var idsFromFirstQuery;
//   var idsFromFirstQueryAsString;

//   let redmineQuery = `SELECT cv.value ,i.id
// FROM custom_values cv
// JOIN issues i ON cv.customized_id = i.id
// WHERE cv.custom_field_id = 1;`;

//   try {
//     await dbRedmine.query(redmineQuery, async (err, resp) => {
//       sqlData = resp;
//       let nodeQuery;
//       if (resp.length === 0) {
//         nodeQuery = `
//         SELECT n1.node_id, n1.node_location, TIMESTAMPDIFF(HOUR, n1.createdAt, NOW()) AS hours_ago
//         FROM notifications AS n1
//         WHERE n1.notification_type = 'node_down'
//         AND n1.createdAt <= DATE_SUB(NOW(), INTERVAL 12 HOUR)
//         AND NOT EXISTS (
//             SELECT 1 FROM notifications AS n2
//             WHERE n2.node_id = n1.node_id
//             AND n2.notification_type = 'node_up'
//             AND n2.createdAt > n1.createdAt
//         )
//         GROUP BY n1.node_id;`;
//       } else {
//         idsFromFirstQuery = sqlData.map((result) => result.value);
//         idsFromFirstQueryAsString = idsFromFirstQuery.join(",");

//         console.log("idsFromFirstQueryAsString", idsFromFirstQueryAsString);
//         nodeQuery = `SELECT n1.node_id, n1.node_location, TIMESTAMPDIFF(HOUR, n1.createdAt, NOW()) AS hours_ago
//         FROM notifications AS n1
//         WHERE n1.notification_type = 'node_down'
//         AND n1.createdAt <= DATE_SUB(NOW(), INTERVAL 12 HOUR)
//         AND NOT EXISTS (
//             SELECT 1 FROM notifications AS n2
//             WHERE n2.node_id = n1.node_id
//             AND n2.notification_type = 'node_up'
//             AND n2.createdAt > n1.createdAt
//         )
//          AND n1.node_id NOT IN (${idsFromFirstQueryAsString})
//         GROUP BY n1.node_id;`;
//       }
//       try {
//         await dbConn.query(nodeQuery, async (err, resp) => {
//           for (let i = 0; i < resp?.length; i++) {
//             createRedmineIssue(
//               resp[i].node_id,
//               resp[i].node_location,
//               resp[i].hours_ago
//             );
//           }
//         });
//       } catch (err) {}
//     });
//   } catch (err) {
//     console.log("err", err);
//   }
// }

// async function getUpdatedRedmineIssue() {
//   var sqlData;
//   var idsFromFirstQuery;
//   var idsFromFirstQueryAsString;
//   var idsFromSecondQuery;
//   var idsFromSecondQueryAsString;

//   let redmineQuery = `SELECT cv.value ,i.id
//     FROM custom_values cv
//     JOIN issues i ON cv.customized_id = i.id
//     WHERE cv.custom_field_id = 1;`;

//   try {
//     await dbRedmine.query(redmineQuery, async (err, resp) => {
//       sqlData = resp;
//       let nodeQuery;
//       if (resp.length === 0) {
//         return;
//       } else {
//         idsFromFirstQuery = sqlData.map((result) => result.value);
//         idsFromFirstQueryAsString = idsFromFirstQuery.join(",");
//         // console.log("idsFromFirstQueryAsString", idsFromFirstQueryAsString);
//         nodeQuery = `SELECT n1.node_id 
//         FROM notifications AS n1
//         WHERE n1.notification_type = 'node_up'
//         AND n1.createdAt <= DATE_SUB(NOW(), INTERVAL 12 HOUR)
//         AND EXISTS (
//             SELECT 1 FROM notifications AS n2
//             WHERE n2.node_id = n1.node_id
//             AND n2.notification_type = 'node_down'
//             AND n2.createdAt < n1.createdAt
//         )
//          AND n1.node_id IN (${idsFromFirstQueryAsString})
//         GROUP BY n1.node_id;`;
//       }
//       try {
//         await dbConn.query(nodeQuery, async (err, resp) => {
//           if (resp.length === 0) {
//             return;
//           } else {
//             // console.log("resp",resp)
//             idsFromSecondQuery = resp.map((result) => result.node_id);
//             idsFromSecondQueryAsString = idsFromSecondQuery.join(",");
//             // console.log("idsFromSecondQueryAsString",idsFromSecondQueryAsString)
//             secredmineQuery = `SELECT i.id
//                 FROM custom_values cv
//                 JOIN issues i ON cv.customized_id = i.id
//                 WHERE cv.custom_field_id = 1 and cv.value in (${idsFromSecondQueryAsString})`;
//             await dbRedmine.query(secredmineQuery, async (err, secresp) => {
//               for (let i = 0; i < secresp?.length; i++) {
//                 if (secresp.length === 0) {
//                   return;
//                 } else {
//                   // console.log("resp[i].id",secresp[i].id)
//                   updateRedmineIssue(secresp[i].id);
//                 }
//               }
//             });
//           }
//         });
//       } catch (err) {}
//     });
//   } catch (err) {
//     console.log("err", err);
//   }
// }

// async function updateRedmineIssue(issue_id) {
//   const issueId = issue_id;
//   const issueData = {
//     issue: {
//       project_id: 2,
//       tracker_id: 4,
//       status_id: 5,
//       priority_id: 3,
//     },
//   };
//   const headersRedmine = { "Content-Type": "application/json" };

//   try {
//     const response = await axios.put(
//       `${hostname}/issues/${issueId}.json?key=${apiKey}`,
//       issueData,
//       {
//         headers: headersRedmine,
//       }
//     );
//   } catch (error) {
//     console.error("Error creating issue:", error);
//   }
// }

// async function createRedmineIssue(node_id, node_loc, hours) {
//   const days = Math.floor(hours / 24);
//   let timeDiff = "";
//   if (hours >= 24) {
//     timeDiff += `${days} days`;
//   } else {
//     timeDiff += `${hours} hours`;
//   }
//   const issueData = {
//     issue: {
//       project_id: 2,
//       tracker_id: 4,
//       status_id: 1,
//       priority_id: 3,
//       subject: `Node is DOWN for more than ${timeDiff} since its last UP status`,
//       description: `The node ${node_id} is down.`,
//       assigned_to_id: 1,
//       custom_fields: [
//         {
//           id: 1,
//           value: node_id,
//         },
//         {
//           id: 2,
//           value: node_loc,
//         },
//         {
//           id: 3,
//           value: `${timeDiff}`,
//         },
//       ],
//     },
//   };
//   const headersRedmine = { "Content-Type": "application/json" };

//   try {
//     const response = await axios.post(
//       `${hostname}/issues.json?key=${apiKey}`,
//       issueData,
//       {
//         headers: headersRedmine,
//       }
//     );

//     const createdIssue = response.data.issue;

//     //   console.log(`Issue #${createdIssue.id} created successfully.`);
//   } catch (error) {
//     console.error("Error creating issue:", error);
//   }
// }

// let NodeModel = (data) => {
//   create_at = new Date() | any;
//   updated_at = new Date() | any;
// };

// var index_name = process.env.HP_Index;

// NodeLocations.hasMany(User, {
//   foreignKey: "user_id",
// });

// Node_id.hasOne(User, {
//   foreignKey: "user_id",
// });

// User.hasMany(Node_id, {
//   foreignKey: "user_id",
// });

NodeModel.pdfbinary = async (req, res) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  const avdata = req.body.avdata.bin_vt_av_labels;

  let tableRows = "";
  let serialNumber = 1;

  for (const antivirus in avdata) {
    const classification = avdata[antivirus];
    tableRows += `
               <tr>
                   <td style="border: 1px solid black; padding: 8px; text-align: center;">${serialNumber}</td>
                   <td style="border: 1px solid black; padding: 8px; text-align: center;">${antivirus}</td>
                   <td style="border: 1px solid black; padding: 8px; text-align: center;">${classification}</td>
       
               </tr>
           `;
    serialNumber++;
  }

  const html = `<h3 style = "text-align: right">Captured Binary Details</h3>
       <hr>
       <h2 style = "text-align: center">Binary Report</h2>
       <h3>Binary Statistics</h3>
       <table style=" border-collapse: collapse;
 width: 100%">
<tr class="highlighted" style= "background-color: grey;">
<th style = "border: 1px solid black; padding: 8px; text-align: center;">Bin ID </th>
 <th style = "border: 1px solid black; padding: 8px; text-align: center;">Binary MD5</th>


<th style = "border: 1px solid black; padding: 8px; text-align: center;">Virus Total</th>

 </tr>
 <tr>
<td style = "border: 1px solid black; padding: 8px; text-align: center;">${req.body.avdata.bin_id}</td>
<td style = "border: 1px solid black; padding: 8px; text-align: center;">${req.body.avdata.md5_hash}</td>


 <td style = "border: 1px solid black; padding: 8px; text-align: center;">${req.body.avdata.bin_vt_av_classification_ratio}</td>

</tr> 
 </table>
 <h3>Virus Total Results</h3>
 <table style=" border-collapse: collapse; width: 100%">
 <tr class="highlighted" style= "background-color: grey;">
<th style = "border: 1px solid black; padding: 8px; text-align: center;">#</th>
<th style = "border: 1px solid black; padding: 8px; text-align: center;">Antivirus</th>
 <th style = "border: 1px solid black; padding: 8px; text-align: center;">Classification</th>

</tr>
${tableRows}
</table>`;
  await page.setContent(html);
  await page.pdf({
    path: "av_repo/" + req.body.avdata.md5_hash + ".pdf",
    format: "A4",
    displayHeaderFooter: false,
  });
  await page.close();
  await browser.close();
  const pdfFilePath = "av_repo/" + req.body.avdata.md5_hash + ".pdf";

  return res(null, { file: pdfFilePath });
};

NodeModel.gethpProfile = async (req, result) => {
  // console.log('gethpProfile req',req.body);
  let nodeQuery = `SELECT node_hp_profile.profile_id as profile,node_hp_profile.profile_name as value FROM node_hp_profile 
    Inner Join node_snapshot_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id 
    WHERE node_snapshot_hp_profile.snapshot_id = '${req.body.snapshot_id}'`;

  try {
    dbConn.query(nodeQuery, async (err, resp) => {
      return result(null, resp);
    });
  } catch (err) {
    return result(null, err);
  }
};

// NodeModel.getNodeConfig = async (req, result) => {
//   let nodeQuery = `SELECT node_package.package_name AS value , node_package.package_id AS 'key' FROM node_hp_profile_package Inner Join node_package ON node_package.package_id = node_hp_profile_package.package_id WHERE node_hp_profile_package.profile_id =${req.body.profile}`;
//   // let nodeQuery = `SELECT node_package.package_name AS value , node_package.package_id AS 'key' FROM node_vulnerability_package Inner Join node_package ON node_package.package_id = node_vulnerability_package.package_id WHERE node_vulnerability_package.profile_id =${req.body.profile}`;

//   try {
//     dbConn.query(nodeQuery, async (err, resp) => {
//       return result(null, resp);
//     });
//   } catch (err) {
//     return result(null, err);
//   }
// };

NodeModel.getNodeConfig = async (req, result) => {
   let nodeQuery = `SELECT Distinct (node_package.package_name) AS value , node_package.package_id AS 'key' 
                  FROM node_hp_profile_package 
                  INNER JOIN node_package ON node_package.package_id = node_hp_profile_package.package_id 
                  WHERE node_hp_profile_package.profile_id IN (${req.body.profiles.join(',')})`;

  try {
    dbConn.query(nodeQuery, async (err, resp) => {
      if (err) {
        return result(err, null);
      }
      return result(null, resp);
    });
  } catch (err) {
    return result(err, null);
  }
};

NodeModel.getImageName= async (req,result)=>{
  let nodeQuery = `
  SELECT
      node_image.node_id,
      node_hp_profile.profile_id AS profile,
      node_image.vm_name,
      node_image.vm_type,
      node_image.os_type,
      node_image.os_name,
      CONCAT(node_image.image_name, ':', node_image.image_tag) AS image
  FROM
      node_hp_profile
  INNER JOIN
      node_snapshot_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
  INNER JOIN
      node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
  INNER JOIN
      node_image ON node_image.image_id = node_snapshot.image_id
  WHERE
      node_hp_profile.device_name = '${req.body.name}' AND node_hardware = '${req.body.hard}'
  ORDER BY
      image;`;

  try {
    dbConn.query(nodeQuery, async (err, resp) => {
      return result(null, resp);
    });
  } catch (err) {
    return result(null, err);
  }
};

NodeModel.deviceType = async (req, result) => {
  let nodeQuery = `SELECT 
  node_hp_profile.device_type AS type,
  node_snapshot.honeypot_category
FROM
  node_image
      JOIN
  node_snapshot ON node_snapshot.image_id = node_image.image_id
  INNER JOIN
  node_snapshot_hp_profile ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
  INNER JOIN
  node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
WHERE
  honeypot_category = '${req.body.cat}'
      AND node_image.node_hardware = '${req.body.hard}' group by type`;
  try {
    dbConn.query(nodeQuery, async (err, resp) => {
      return result(null, resp);
    });
  } catch (err) {
    return result(null, err);
  }
};

NodeModel.deviceName = async (req, result) => {
  let nodeQuery = `SELECT 
  device_name AS name, profile_name
FROM
  node_image
      JOIN
  node_snapshot ON node_snapshot.image_id = node_image.image_id
  INNER JOIN
  node_snapshot_hp_profile ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
  INNER JOIN
  node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
WHERE
  device_type = '${req.body.type}'
      AND node_image.node_hardware = '${req.body.hard}'
      group by name`;

  try {
    dbConn.query(nodeQuery, async (err, resp) => {
      return result(null, resp);
    });
  } catch (err) {
    return result(null, err);
  }
};

NodeModel.getHoneypotData = async (req, result) => {

  let nodeQuery = `SELECT DISTINCT node_image.node_id, node_image.image_id, node_image.os_type, 
    node_image.os_name, node_image.vm_type, node_image.vm_name, 
    node_snapshot.snapshot_id, node_snapshot.snapshot_name, node_snapshot.honeypot_category, node_honeypot_type.hp_type 
    FROM node_image 
    Inner Join node_snapshot ON node_snapshot.image_id = node_image.image_id 
    Inner Join node_snapshot_honeypot ON node_snapshot_honeypot.snapshot_id = node_snapshot.snapshot_id 
    Inner Join node_honeypot_type ON node_honeypot_type.hp_id = node_snapshot_honeypot.hp_id 
    WHERE node_image.node_id IN (` +
    req.body.node_id +
    `,0) 
    and (node_image.status=0 or node_image.vm_type='docker') and node_image.status!=3 
    group by honeypot_category`;
  try {
    dbConn.query(nodeQuery, async (err, resp) => {
      // console.log("err", err);
      return result(null, resp);
    });
  } catch (err) {
    return result(null, err);
  }
};


// HiHp

NodeModel.deviceTypeHiHp = async (req, result) => {
  // console.log(req.body.snap_ids);
  // Assuming req.body.snap_ids is an array like [2, 4]
  let nodeQuery = `
    SELECT 
      node_hp_profile.device_type AS type,
      node_snapshot.honeypot_category
    FROM
      node_image
      JOIN
      node_snapshot ON node_snapshot.image_id = node_image.image_id
      INNER JOIN
      node_snapshot_hp_profile ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
      INNER JOIN
      node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
    WHERE
      honeypot_category = '${req.body.cat}'
      AND node_image.node_hardware = '${req.body.hard}'
      AND node_snapshot.snapshot_id IN (${req.body.snap_ids.join(',')})
      Group BY type
  `;
  try {
    dbConn.query(nodeQuery, async (err, resp) => {
      // console.log("Response",resp)

      return result(null, resp);
    });
  } catch (err) {
    // console.log("Error", err)

    return result(null, err);
  }
};

// NodeModel.deviceTypeHiHp = async (req, result) => {
//   console.log(req.body.snap_ids)
//   let nodeQuery = `
//   SELECT 
// node_hp_profile.device_type AS type,
// node_snapshot.honeypot_category
// FROM
// node_image
//     JOIN
// node_snapshot ON node_snapshot.image_id = node_image.image_id
// INNER JOIN
// node_snapshot_hp_profile ON node_image.image_id = node_snapshot_hp_profile.snapshot_id
// INNER JOIN
// node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
// WHERE
// honeypot_category = '${req.body.cat}'
//     AND node_image.node_hardware =  '${req.body.hard}' and node_snapshot.snapshot_id in '${req.body.snap_ids}'  ;
//   `;
//   try {
//     dbConn.query(nodeQuery, async (err, resp) => {
//       return result(null, resp);
//     });
//   } catch (err) {
//     return result(null, err);
//   }
// };

NodeModel.deviceNameHiHp = async (req, result) => {
  let nodeQuery = ` SELECT 
  device_name AS name, profile_name
FROM
  node_image
      JOIN
  node_snapshot ON node_snapshot.image_id = node_image.image_id
  INNER JOIN
  node_snapshot_hp_profile ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
  INNER JOIN
  node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
WHERE

device_type IN ('${req.body.type[0]}') 
AND node_image.node_hardware = '${req.body.hard}'
      AND node_snapshot.snapshot_id IN (${req.body.snap_ids?.join(',')})
      group by name`;

  try {
    dbConn.query(nodeQuery, async (err, resp) => {
// console.log("Response", resp)
// console.log("Error", err)
      return result(null, resp);
    });
  } catch (err) {
    return result(null, err);
  }
};

NodeModel.getHoneypotDataHiHp = async (req, result) => {
  let nodeQuery =
    `SELECT DISTINCT node_image.node_id, node_image.image_id, node_image.os_type, 
    node_image.os_name, node_image.vm_type, node_image.vm_name, 
    node_snapshot.snapshot_id, node_snapshot.honeypot_category, node_snapshot.honeypot_name, node_snapshot.snapshot_name, node_honeypot_type.hp_type , node_snapshot.snapshot_id
    FROM node_image 
    Inner Join node_snapshot ON node_snapshot.image_id = node_image.image_id 
    Inner Join node_snapshot_honeypot ON node_snapshot_honeypot.snapshot_id = node_snapshot.snapshot_id 
    Inner Join node_honeypot_type ON node_honeypot_type.hp_id = node_snapshot_honeypot.hp_id 
    WHERE node_image.node_id IN (${req.body.node_id})  
    and (node_image.status=0 or node_image.vm_type='vbox') and node_image.status!=3
    
    ` ;
  try {
    dbConn.query(nodeQuery, async (err, resp) => {
      // console.log("err", err);
      return result(null, resp);
    });
  } catch (err) {
    return result(null, err);
  }
};


NodeModel.getNodeConfigHIHP = async (req, result) => {
  let nodeQuery = `SELECT node_package.package_name AS value , node_package.package_id AS 'key'
  FROM node_snapshot_package 
  Inner Join node_package ON node_package.package_id = node_snapshot_package.package_id 

  WHERE node_snapshot_package.snapshot_id IN (${req.body.snap_ids?.join(',')})`;

  try {
    dbConn.query(nodeQuery, async (err, resp) => {
      return result(null, resp);
    });
  } catch (err) {
    return result(null, err);
  }
};



///

NodeModel.getDownNodes = async (result) => {
  //  uncomment below for redmine functionality
  // getRedmineIssue()
  // getUpdatedRedmineIssue()
  let addTime = new Date(new Date().getTime() + 1000 * 60 * 60 * 1.5)
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d+/, "")
    .replace("Z", "");
  const todayStart = new Date(new Date().setHours(0o5, 30, 0, 0))
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d+/, "")
    .replace("Z", "");

  let nodeQuery = `SELECT nodes.node_id, nodes.node_location,nodes.last_up_time,  CONCAT(IFNULL(subquery.users, ''), IF(node_ids_users.users_0 IS NOT NULL, CONCAT(',', node_ids_users.users_0), '')) AS users FROM node as nodes     LEFT OUTER JOIN (
        SELECT node_ids.node_id, GROUP_CONCAT(node_ids.user_id ORDER BY node_ids.user_id) AS users
        FROM node_ids
        WHERE node_ids.node_id <> 0
        GROUP BY node_ids.node_id
    ) AS subquery ON subquery.node_id = nodes.node_id
    LEFT JOIN (
        SELECT GROUP_CONCAT(node_ids.user_id ORDER BY node_ids.user_id) AS users_0
        FROM node_ids
        WHERE node_ids.node_id = 0
        GROUP BY node_ids.node_id
    ) AS node_ids_users ON 1=1
    WHERE nodes.node_status = 'Down' AND (nodes.last_up_time BETWEEN '${todayStart}' AND '${addTime}') Group BY nodes.node_id`;
  try {
    dbConn.query(nodeQuery, async (err, resp) => {
      if (resp) {
        const nodeIds = resp.map((item) => item.node_id);

        for (let node of resp) {
          await notifications.findOrCreate({
            where: {
              node_id: node.node_id,
              createdAt: {
                $gt: todayStart,
              },
            },
            defaults: {
              user_id: 0,
              notification_type: "node_down",
              node_location: node.node_location,
              createdAt: new Date(),
              notification_read_users: node.users,
            },
          });
        }
      }
      return result(null, resp);
    });
  } catch (err) {
    return result(null, err);
  }
};

NodeModel.getUpNodes = async (result) => {
  const todayStart = new Date(new Date().setHours(0o5, 30, 0, 0))
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d+/, "")
    .replace("Z", "");
  let nodeQuery = `SELECT DISTINCT notifications.node_id, node.last_up_time, node.node_location, CONCAT(IFNULL(subquery.users, ''), IF(node_ids_users.users_0 IS NOT NULL, CONCAT(',', node_ids_users.users_0), '')) AS users
    FROM notifications
    INNER JOIN node ON node.node_id = notifications.node_id
    LEFT OUTER JOIN (
        SELECT node_ids.node_id, GROUP_CONCAT(node_ids.user_id ORDER BY node_ids.user_id) AS users
        FROM node_ids
        WHERE node_ids.node_id <> 0
        GROUP BY node_ids.node_id
    ) AS subquery ON subquery.node_id = notifications.node_id
    LEFT JOIN (
        SELECT GROUP_CONCAT(node_ids.user_id ORDER BY node_ids.user_id) AS users_0
        FROM node_ids
        WHERE node_ids.node_id = 0
        GROUP BY node_ids.node_id
    ) AS node_ids_users ON 1=1
    WHERE notifications.createdAt BETWEEN DATE_SUB(NOW(), INTERVAL 1 WEEK) AND NOW()
        AND notifications.notification_type = 'node_down'
        AND node.node_status = 'up'
        AND notifications.node_id NOT IN (
            SELECT node_id
            FROM notifications
            WHERE notification_type = 'node_up'
        );`;

  try {
    dbConn.query(nodeQuery, async (err, resp) => {
      if (resp) {
        for (let node of resp) {
          let que = await notifications.findOrCreate({
            where: {
              node_id: node.node_id,
              createdAt: {
                $eq: node.last_up_time,
              },
            },
            defaults: {
              user_id: 0,
              notification_type: "node_up",
              node_location: node.node_location,
              createdAt: node.last_up_time,
              notification_read_users: node.users,
            },
          });
        }
      }
      return result(null, resp);
    });
  } catch (err) {
    return result(null, err);
  }
};

NodeModel.deleteNoti = async (result) => {
  try {
    dbConn.query(
      `delete FROM notifications WHERE DATE(createdAt) < (NOW() - INTERVAL 7 DAY)`,
      (err, res) => {
        return result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

NodeModel.getNodeHealthConnection = async (req, result) => {
  const list = [];

  try {
    dbConn.query(
      `SELECT date_format(last_update_time,'%Y-%m-%d %H:%i:00') AS date, health_type as type FROM node_health where node_id = ${req.body.node} ORDER BY last_update_time desc limit 0,10000`,
      (err, res) => {
        const data = res;
        let type = "conf";
        const list = [];
        let date1 = moment();
        let date2 = moment();

        for (let i = data.length - 1; i >= 0; i--) {
          const row = data[i];
          const currentDate = moment(row.date, "YYYY-MM-DD HH:mm:ss");
          const dataObj = {
            Date: row.date,
            value: "1",
            Volume: "1",
          };

          if (i > 0) {
            date2 = date1.clone().add(6, "minutes");
            let j = date2.diff(currentDate, "minutes");
            date2 = date1.clone();
            if (
              row.type.toLowerCase() === "pcap" ||
              type.toLowerCase() === "pcap"
            ) {
              j = 1;
            }
            while (j < 0) {
              date2.add(1, "minute");
              const output = date2.format("YYYY-MM-DD HH:mm:ss");
              const data1 = {
                Date: output,
                value: j < 0 ? "-1" : "1",
                Volume: j < 0 ? "-1" : "1",
              };
              list.push(data1);
              j = date2.diff(currentDate, "minutes");
            }
          }
          list.push(dataObj);
          type = row.type;
          date1 = currentDate;
        }
        // console.log(list);
        return result(null, list);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};


NodeModel.getHoneypotHealthConnection = async (req, result) => {
  // const list = [];
 const u_conf_id=req.body.u_conf_id;
  try {
    dbConn.query(`SELECT date_format(date_time,'%Y-%m-%d %H:%i:00') AS Date,node_honeypot_health.cpu_stats AS value,node_honeypot_health.mem_stats AS Volume FROM node_honeypot_health WHERE u_conf_id = ${u_conf_id}`,
      (err, res) => {
      //  console.log('-----------------------------------------',res);
        return result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

NodeModel.saveHoneypotConfig = async (req, result) => {
  var conf_id = 0;
  var { hp_type, hp_services, node_id, vm_name, hp_profile } = req.body;
  // console.log("req.body--------", req.body);

  var serv = hp_services.filter((e) => {
    if (e && e != undefined && e != null && e != "") {
      // console.log("--key--",e.key)
      return e.key;
    }
  });
  var serv_name = hp_services.map((e) => {
    if (e && e != undefined && e != null && e != "") {
      return e.value;
    }
  });
  // console.log("serv",serv);
  // console.log("serv_name",serv_name)
  let servieslist = await getServiceList(serv);
  // console.log("servieslist------",servieslist);

  let services = await getServices(serv);
  // console.log("services-----",services);

  if (servieslist && services) {
    servieslist.filter((servL) => {
      services.filter((e) => {
        if (servL.conf_id == e.conf_id) {
          conf_id = servL.conf_id;
          // console.log("conf_id====",conf_id);
        }
      });
    });
  }
  // console.log("conf_id",conf_id)

  if (conf_id == 0) {
    let maxNode = await getMaxNode();
    // console.log("maxNode", maxNode)

    if (maxNode[0].conf_id == null) {
      maxNode[0].conf_id = 0;
    }
    conf_id = maxNode[0].conf_id + 1;
    //     // conf_id
    // console.log("conf_id--->", conf_id)
    let insertedNode = await InsertNode(conf_id, serv);
    // console.log("insertedNode--------",insertedNode);

    let vul_id = await getVulnerabilities(hp_profile);
    // console.log("vul_id", vul_id)

    for (var i = 0; i < vul_id.length; i++) {
      var inserting = await InsertVul(conf_id, vul_id[i].vulnerability_id);
      // console.log(inserting);
    }
  }

  // if conf id exists
  let hptypeId = await gethp_typeid(hp_type);

  // insert new config
  let newConfig = await createConfig(req.body, serv, conf_id, hptypeId);

  let nodeNetdata = await getNodeIpsData(node_id);

  // console.log("nodeNetdata===>>>>",nodeNetdata);

  const ipAddressList = [];
  const ipAddressType = {};

  nodeNetdata.forEach((row) => {
    if (row.type === "public") {
      ipAddressList.push(row.ip_address);
    } else {
      ipAddressType[row.type] = row.ip_address;
    }
  });

  const randomIp = getRandomIp(ipAddressList);
  // console.log("--------------------------",nodeNetdata)
  let updateNImage = await updateNodeImage(vm_name, node_id);

  let currentNodeConfig = await getCurrentConfiguration(node_id);

  let updateConfig = await updateNodeConfig(currentNodeConfig, randomIp);

  let currentConfig = await getCurrentConfiguration(node_id);


  let generateXml = await getXmlObject(currentConfig, nodeNetdata, req.body,serv_name);

  // console.log("-----------------------------------",generateXml)
  // set ip
  // let setIpAdd = await setIpAddress(currentConfig,conf_id);

  // set node config

  let setNode = await setNodeConfig(currentConfig, conf_id);

  if (setNode) {
    return result({
      status: 1,
      message: "Honeypot added successfully",
      data: setNode,
    });
  }
};

function getRandomIp(ipAddressList) {
  const randomIndex = Math.floor(Math.random() * ipAddressList.length);
  return ipAddressList[randomIndex];
}

async function getCurrentConfiguration(node_id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Changes tell by Shivani Ma'am
      let nodeNetquery =
        "SELECT node_configuration.node_id, node_configuration.conf_id, node_configuration.network_type, node_configuration.vm_type, node_configuration.vm_name, " +
        "node_configuration.os_type, node_configuration.honeypot_type, node_configuration.honeypot_profile, node_configuration.snapshot_name, node_configuration.honeypot_count, " +
        "node_configuration.u_conf_id, node_configuration.os_name, node_configuration.start_date,node_configuration.end_date, node_configuration.health_status, node_configuration.ip_address, " +
        "node_image.image_name, node_image.image_tag, group_concat(node_configuration_package.package_id separator ',') as service , group_concat(node_package.package_name separator ',') as services " +
        "FROM  node_configuration join node_configuration_package on node_configuration_package.conf_id = node_configuration.conf_id "
        +"join node_package on node_package.package_id=node_configuration_package.package_id" + " Left Join node_image ON  node_image.vm_name = node_configuration.vm_name " +
        "WHERE " +
        "node_configuration.node_id =  " +
        node_id +
        " AND node_configuration.end_date IS NULL group by start_date";
      // let nodeNetquery =
      //   "SELECT node_configuration.node_id, node_configuration.conf_id, node_configuration.network_type, node_configuration.vm_type, node_configuration.vm_name, " +
      //   "node_configuration.os_type, node_configuration.honeypot_type, node_configuration.honeypot_profile, node_configuration.snapshot_name, node_configuration.honeypot_count, " +
      //   "node_configuration.u_conf_id, node_configuration.os_name, node_configuration.start_date,node_configuration.end_date, node_configuration.health_status, node_configuration.ip_address, " +
      //   "node_image.image_name, node_image.image_tag " +
      //   "FROM  node_configuration Left Join node_image ON node_image.node_id = node_configuration.node_id AND node_image.vm_name = node_configuration.vm_name " +
      //   "WHERE " +
      //   "node_configuration.node_id =  " +
      //   node_id +
      //   " AND node_configuration.end_date IS NULL ";
      dbConn.query(nodeNetquery, async (err, res) => {
        if(err){
          console.log(err);
        }
        resolve(res);
      });
    }, 300);
  });
}

async function InsertNode(maxNode, service) {
  // console.log("service", service);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      service.map((e) => {
        // console.log("maxNode", maxNode, "service", e);
        query = `insert into node_configuration_package(conf_id,package_id) values(${maxNode},${e})`;
        dbConn.query(query, async (err, res) => {
          resolve(res);
        });
      });
    });
  });
}

async function getVulnerabilities(profile) {

  console.log("-----Service------", profile);
  return new Promise((resolve, reject) => {
    // Use for..of loop to iterate over the service array
    // for (const e of service) {
    // Use a template literal to construct the SQL query
    const query = `SELECT DISTINCT node_vulnerability.vulnerability_id FROM node_vulnerability_package INNER JOIN node_vulnerability ON node_vulnerability_package.vulnerability_id = node_vulnerability.vulnerability_id WHERE node_vulnerability_package.profile_id in (?)`;

    // Use await to ensure the database query is completed before proceeding
    try {
      dbConn.query(query, profile, async (err, insertResult) => {
        if (err) {
          console.log("eerrrrrr---->>>", err);
          reject(err);
        } else {
          const vulnerability_id = insertResult;
          // return vulnerability_id; // Resolve with the fetched image_id
          resolve(insertResult);
        }
      });
      // console.log("e-----------", e);
      // console.log("res---------", vulnerabilityIds);
      // Push the vulnerability IDs into the array
      // vulnerabilityIds.push(result);
    } catch (err) {
      // Handle any errors from the database query
      console.error("Error querying the database:", err);
      reject(err);
    }

    // Resolve the promise with the vulnerabilityIds array
    // resolve(vulnerabilityIds);
  });
}

async function InsertVul(conf, vul_id) {
  // console.log("--Insertion---", conf, vul_id)
  // console.log("service Insert vul",service)
  return new Promise((resolve, reject) => {
    query = `insert into node_configuration_vulnerability (conf_id,vulnerability_id) values(${conf},${vul_id})`;
    dbConn.query(query, async (err, res) => {
      resolve(res);
    });
  });
}

async function updateNodeImage(vm_name, node_id) {
  // console.log(
  //   "vm_name=====>>>>>>>>",
  //   vm_name,
  //   "\nnode_id===========>>>>",
  //   node_id
  // );
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      query = `update node_image set node_image.status=1 where node_image.vm_name= '${vm_name}' and node_id in (${node_id},0)`;

      dbConn.query(query, async (err, res) => {
        resolve(res);
      });
    });
  });
}

async function gethpName(vm_name, node_id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      query = `select node_snapshot.honeypot_name from node_snapshot 
      inner join node_image on node_image.image_id = node_snapshot.image_id
      where node_id = ${node_id} and vm_name = '${vm_name}' `;

      dbConn.query(query, async (err, res) => {
        resolve(res);
      });
    });
  });
}

async function setIpAddress(allConfs) {
  return new Promise((resolve, reject) => {
    // console.log("setNodeConfig------",allConfs)
    setTimeout(() => {
      allConfs.map((conf, i) => {
        // console.log("-------setNodeConfig------",conf.ip_address)
        let nodeConf = `UPDATE node_configuration set ip_address = '${conf.ip_address}' where u_conf_id =  ${conf.u_conf_id}`;
        dbConn.query(nodeConf, async (err, res) => {
          if (i == allConfs.length - 1) {
            resolve(res);
          }
        });
      });
    }, 1);
  });
}

async function setNodeConfig(allConfs) {
  return new Promise((resolve, reject) => {
    // console.log("allConfs", allConfs);
    setTimeout(() => {
      allConfs.map((conf, i) => {
        //  console.log("conf.ip_address---------",conf.ip_address)
        let nodeConf = `update node_network set status=1 where ip_address = '${conf.ip_address}' and node_id=${conf.node_id}`;
        dbConn.query(nodeConf, async (err, res) => {
          if (i == allConfs.length - 1) {
            resolve(res);
          }
        });
      });
    }, 1);
  });
}

async function getNodeIpsData(node_id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      query = `SELECT DISTINCT ip_address,type FROM node_network WHERE node_network.node_id = ${node_id} and status = 0`;
      dbConn.query(query, async (err, res) => {
        resolve(res);
      });
    });
  });
}

async function createConfig(req, serv, conf_id, hptypeId) {
  // console.log("req", req, "serv", serv);
  // console.log("hptypeId", hptypeId);
  // console.log("hptypeId", hptypeId[0].hp_id);

  var {
    hp_type,
    node_id,
    os_type,
    os_ver_type,
    vm_name,
    vm_type,
    snapshot_id,
    profile,
    network_type,
    number_of_honeypot,
  } = req;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      query = `insert into node_configuration(node_id, os_type, os_name, vm_type, vm_name, snapshot_name, conf_id, honeypot_count, network_type, hp_id, honeypot_type,honeypot_profile) 
                                        values(${node_id},'${os_type}','${os_ver_type}','${vm_type}','${vm_name}','${snapshot_id}','${conf_id}','${number_of_honeypot}','${network_type}','${hptypeId[0].hp_id}','${hp_type}','${profile}')`;

      dbConn.query(query, async (err, res) => {
        resolve(res);
      });
    });
  });
}

async function createConfigHiHp(req, serv, conf_id, hptypeId) {
  // console.log("req", req, "serv", serv);
  // console.log("hptypeId", hptypeId);
  // console.log("hptypeId", hptypeId[0].hp_id);

  var {
    hp_type,
    node_id,
    os_type,
    os_ver_type,
    vm_name,
    vm_type,
    hp_name,  // Actually it contains snapshot_name but as already wrong conventions are used , so am not changing this mess for now 
    profile,
    network_type,
    number_of_honeypot,
  } = req;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      query = `insert into node_configuration(node_id, os_type, os_name, vm_type, vm_name, snapshot_name, conf_id, honeypot_count, network_type, hp_id, honeypot_type,honeypot_profile) 
                                        values(${node_id},'${os_type}','${os_ver_type}','${vm_type}','${vm_name}','${hp_name}','${conf_id}','${number_of_honeypot}','${network_type}','${hptypeId[0].hp_id}','${hp_type}','${profile}')`;

      dbConn.query(query, async (err, res) => {
        resolve(res);
      });
    });
  });
}

async function updateNodeConfig(allconf, ip_add) {
  // console.log("==================allconf", allconf);
  // console.log("==================ip_add", ip_add);

  const confIdsWithNullIp = allconf
    .filter((item) => item.ip_address === null)
    .map((item) => item.u_conf_id);

  // console.log(confIdsWithNullIp);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      query = `UPDATE node_configuration set ip_address = '${ip_add}' where u_conf_id = '${confIdsWithNullIp}'`;

      dbConn.query(query, async (err, res) => {
        // console.log("errrrrrrrrrr", res);
        resolve(res);
      });
    });
  });
}

async function gethp_typeid(hp_type) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      query = `SELECT hp_id FROM node_honeypot_type WHERE hp_type = '${hp_type}'`;
      dbConn.query(query, async (err, res) => {
        resolve(res);
      });
    });
  });
}

async function getMaxNode() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      query =
        "SELECT Max(node_configuration_package.conf_id) AS conf_id FROM node_configuration_package";
      dbConn.query(query, async (err, res) => {
        resolve(res);
      });
    });
  });
}
async function getServiceList(service) {
  // console.log("getservice---", service, " \t ", service.length);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      query =
        "SELECT node_configuration_package.conf_id, Count(node_configuration_package.package_id) AS pkg_count FROM node_configuration_package WHERE node_configuration_package.package_id IN  (" +
        service +
        ") GROUP BY node_configuration_package.conf_id HAVING pkg_count =  " +
        service.length +
        "";
      dbConn.query(query, async (err, res) => {
        resolve(res);
      });
    });
  });
}

// getServicename()

async function getServices(service) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      query =
        "SELECT node_configuration_package.conf_id, Count(node_configuration_package.package_id) AS pkg_count FROM node_configuration_package GROUP BY node_configuration_package.conf_id HAVING pkg_count =" +
        service.length;
      dbConn.query(query, async (err, res) => {
        resolve(res);
      });
    });
  });
}

async function getXmlObject(allConfs, nodeNetdata, reqbody,service) {
  console.log("====================allconf=============",allConfs);
  var static_ip = "";
  var netmask = "";
  var gateway = "";
  var dns = "";

  nodeNetdata.map((e) => {
    if (e.type == "static_ip") {
      static_ip = e.ip_address;
    }
    if (e.type == "netmask") {
      netmask = e.ip_address;
    }
    if (e.type == "gateway") {
      gateway = e.ip_address;
    }
    if (e.type == "dns") {
      dns = e.ip_address;
    }
  });

  return new Promise((resolve, reject) => {

    setTimeout(() => {
      let honeypot = [];
      for (let conf of allConfs) {
        console.log(config?.Xml_Repo)
        console.log(conf?.image_name)
        console.log(conf?.image_tag)
    
        var obj = {
          UConfID: {
            "#text": conf.conf_id,
          },
          VmInfo: {
            VmType: {
              "#text": conf.vm_type,
            },
            VmName: {
              "#text": conf.vm_name,
            },
            OsType: {
              "#text": conf.os_type,
            },
            HoneypotType: {
              // "#text": conf.honeypot_type,
              "#text": 'PHP',
            },
            HoneypotName: {
              "#text": conf.snapshot_name,
            },
            SnapshotName: {
              "#text": conf.snapshot_name,
            },
            ContainerCount: {
              "#text": conf.honeypot_count,
            },
            repo: {
              "#text":
                config.Xml_Repo + "/" + conf.image_name + ':' + conf.image_tag
            },
          },
          Network: {
            NetworkType: {
              "#text": conf.network_type,
            },
            IPAddress: {
              "#text": conf.ip_address,
            },
            Netmask: {
              "#text": netmask,
            },
            Gateway: {
              "#text": gateway,
            },
            DNS: {
              "#text": dns,
            },
          },
          Profile: {
            "#text": conf.honeypot_profile,
          },
          ServiceInfo: {
            ServiceName: conf.services.split(',').map(service => ({ "#text": service })),
          },
          // ServiceInfo: {
          //   ServiceName: {
          //     "#text": conf.services,
          //   },
          // },
        };
        honeypot.push(obj);
      }
      var newObj = {
        DHS: {
          Honeypot: honeypot,
        },
      };
      var finalDocument = newObj;
      var builder = require("xmlbuilder");
      var document = builder.create(finalDocument).end({ pretty: true });

      // save file start
      // var dir = __dirname + "/BB_LOGS/honeypot_conf/" + reqbody.node_id + "/";
      var dir = "/BB_LOGS/honeypot_conf/" + reqbody.node_id + "/";
      if (!fs.existsSync(dir)) {
        fs.promises.mkdir(dir, { recursive: true });
      }

      setTimeout(() => {
        fs.writeFile(dir + "Honeypot.xml", document.toString(), (err) => {
          if (err) console.log(err);
          else {
            console.log("File written successfully\n");
          }
        });
      }, 100);
      //   save file end

      resolve(obj);
    }, 300);
  });
}

// NodeModel.honeypotConfig = (req, result) => {
//   try {
//     client
//       .search({
//         index: index_name,
//         body: {
//           aggs: {
//             NAME: {
//               terms: {
//                 field: "hp_type.keyword",
//                 size: 50,
//               },
//             },
//           },
//           size: 0,
//         },
//       })
//       .then((resp) => {
//         if (resp) {
//           return result(null, {
//             data: resp.aggregations.NAME.buckets,
//           });
//         }
//       });
//   } catch (err) {
//     return result(null, {
//       msg: "Error not found",
//       err,
//     });
//   }
// };

// NodeModel.hpProfileConfig = (req, result) => {
//   try {
//     client
//       .search({
//         index: index_name,
//         body: {
//           query: {
//             bool: {
//               must: [
//                 {
//                   match_phrase: {
//                     "hp_type.keyword": {
//                       query: req.body.data,
//                     },
//                   },
//                 },
//               ],
//             },
//           },
//           aggs: {
//             NAME: {
//               terms: {
//                 field: "hp_profile.profile_name.keyword",
//                 size: 1000,
//               },
//             },
//           },
//           size: 0,
//         },
//       })
//       .then((resp) => {
//         if (resp) {
//           return result(null, {
//             data: resp.aggregations.NAME.buckets,
//           });
//         }
//       });
//   } catch (err) {
//     return result(null, {
//       msg: "Error not found",
//       err,
//     });
//   }
// };

// NodeModel.hp_image = (req, result) => {
//   try {
//     client
//       .search({
//         index: index_name,
//         body: {
//           query: {
//             bool: {
//               must: [
//                 {
//                   match_phrase: {
//                     "hp_type.keyword": {
//                       query: req.body.type,
//                     },
//                   },
//                 },
//                 {
//                   match_phrase: {
//                     "hp_profile.profile_name.keyword": {
//                       query: req.body.data,
//                     },
//                   },
//                 },
//               ],
//             },
//           },
//           aggs: {
//             NAME: {
//               terms: {
//                 field: "image_id.keyword",
//                 size: 1000,
//               },
//             },
//           },
//           size: 0,
//         },
//       })
//       .then((resp) => {
//         if (resp) {
//           return result(null, {
//             data: resp.aggregations.NAME.buckets,
//           });
//         }
//       });
//   } catch (err) {
//     return result(null, {
//       msg: "Error not found",
//       err,
//     });
//   }
// };

// NodeModel.hp_service = (req, result) => {
//   // console.log('req.body.data',req.body.data);
//   try {
//     client
//       .search({
//         index: index_name,
//         body: {
//           query: {
//             bool: {
//               must: [
//                 {
//                   match: {
//                     "image_id.keyword": {
//                       query: req.body.data,
//                     },
//                   },
//                 },
//               ],
//             },
//           },
//         },
//       })
//       .then((resp) => {
//         if (resp) {
//           return result(null, {
//             data: resp,
//           });
//         }
//       });
//   } catch (err) {
//     return result(null, {
//       msg: "Error not found",
//       err,
//     });
//   }
// };

// Query for getting data of node table where node_sensor_hp_type = "HIHP"

NodeModel.nodeSensor = async (req, resolve) => {
  const idArray = req.body;

  try {
    const query =
      "SELECT * FROM node WHERE node_sensor_hp_type = 'HIHP'";

    const result = await new Promise((resolveQuery, rejectQuery) => {
      dbConn.query(query, [idArray], (err, res) => {
        if (err) {
          rejectQuery(err);
        } else {
          resolveQuery(res);
        }
      });
    });

    resolve(result);
  } catch (error) {
    throw error;
  }
};

NodeModel.hihpStatus = async (req, resolve) => {
  const idArray = req.body;

  try {
    const query =
      "SELECT node_sensor_hp_type FROM node WHERE node_sensor_hp_type = 'HIHP' AND node.node_id IN (?)";

    const result = await new Promise((resolveQuery, rejectQuery) => {
      dbConn.query(query, [idArray], (err, res) => {
        if (err) {
          rejectQuery(err);
        } else {
          resolveQuery(res);
        }
      });
    });

    resolve(result);
  } catch (error) {
    throw error;
  }
};

NodeModel.sqlBinaries = async (req, result) => {
  // console.log("reqqqqqq",req.body)
  let node = req.body.node_ids.map((e) => {
    return e.item_text;
  });
  // console.log("node",node)
  try {
    dbConn.query(
      `SELECT DISTINCT binary_bb.bin_id, binary_bb.bin_md5, binary_bb.yara_status,binary_bb.bin_source, binary_bb.bin_classification, binary_bb.ml_classification, Min(binary_log.bin_capture_time) AS bin_capture_time, binary_log.node_id
      FROM binary_bb 
       Left Join binary_log ON binary_bb.bin_id = binary_log.bin_id WHERE binary_log.node_id in  (${node}) AND binary_log.bin_capture_time BETWEEN "${req.body.start_date}" AND "${req.body.end_date}" GROUP BY binary_bb.bin_id,binary_bb.bin_md5, binary_bb.bin_source, binary_log.node_id ORDER BY binary_bb.bin_id ASC`,
      (err, res) => {
        return result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

NodeModel.sqlAVdetails = async (req, result) => {
  try {
    dbConn.query(
      `SELECT binary_vt_results.bin_id, binary_vt_results.av_name, binary_vt_results.av_classification FROM binary_vt_results WHERE binary_vt_results.bin_id = "${req.body.bin}"`,
      (err, res) => {
        return result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

// NodeModel.sqlpdfbinary = async (req, result) => {
//   try {
//     const browser = await puppeteer.launch({
//       headless: false,
//       args: ["--no-sandbox"],
//     });
//     const page = await browser.newPage();

//     const bin = req.body.avdata;

//     dbConn.query(
//       `SELECT binary_vt_results.bin_id, binary_vt_results.av_name, binary_vt_results.av_classification FROM binary_vt_results WHERE binary_vt_results.bin_id = "${bin}"`,
//       (err, res) => {
//         const antivirusData = res;
//         // console.log("antivirusData", antivirusData);
//         let serialNumber = 1;

//         antivirusData.forEach(async (rowData) => {
//           const avName = rowData.av_name;
//           const avClassification = rowData.av_classification;
//           let tableRows = "";
//           // console.log("serialNumber ", serialNumber);
//           // console.log("avName ", avName);
//           // console.log("avClassification ", avClassification);
//           // console.log("bin ", bin);
//           // console.log("req.body.md5", req.body.md5);
//           tableRows += `
//                  <tr>
//                      <td style="border: 1px solid black; padding: 8px; text-align: center;">${serialNumber}</td>
//                      <td style="border: 1px solid black; padding: 8px; text-align: center;">${avName}</td>
//                      <td style="border: 1px solid black; padding: 8px; text-align: center;">${avClassification}</td>

//                  </tr>
//              `;
//           serialNumber++;

//           const html = `<h3 style = "text-align: right">Captured Binary Details</h3>
//          <hr>
//          <h2 style = "text-align: center">Binary Report</h2>
//          <h3>Binary Statistics</h3>
//          <table style=" border-collapse: collapse;
//    width: 100%">
//   <tr class="highlighted" style= "background-color: grey;">
//   <th style = "border: 1px solid black; padding: 8px; text-align: center;">Bin ID </th>
//    <th style = "border: 1px solid black; padding: 8px; text-align: center;">Binary MD5</th>

//    </tr>
//    <tr>
//   <td style = "border: 1px solid black; padding: 8px; text-align: center;">${bin}</td>
//   <td style = "border: 1px solid black; padding: 8px; text-align: center;">${req.body.md5}</td>

//   </tr>
//    </table>
//    <h3>Virus Total Results</h3>
//    <table style=" border-collapse: collapse; width: 100%">
//    <tr class="highlighted" style= "background-color: grey;">
//   <th style = "border: 1px solid black; padding: 8px; text-align: center;">#</th>
//   <th style = "border: 1px solid black; padding: 8px; text-align: center;">Antivirus</th>
//    <th style = "border: 1px solid black; padding: 8px; text-align: center;">Classification</th>

//   </tr>
//   ${tableRows}
//   </table>`;
//           await page.setContent(html);
//           try {
//             await page.pdf({
//               path: "av_repo/" + req.body.md5 + ".pdf",
//               format: "A4",
//               displayHeaderFooter: false,
//               timeout: 30000,
//             });
//           } catch (error) {
//             // console.error("PDF generation error:", error);
//             // Handle the error or log it as needed
//           }
//           // await page.pdf({
//           //   path: "av_repo/" + req.body.md5 + ".pdf",
//           //   format: "A4",
//           //   displayHeaderFooter: false,
//           //   timeout: 30000,
//           // });
//           console.log("Before closing page");
//           await page.close();
//           console.log("After closing page, before closing browser");
//           await browser.close();
//           console.log("After closing browser");
//           const pdfFilePath = "av_repo/" + req.body.md5 + ".pdf";
//           console.log("pdfFilePath", pdfFilePath);
//           page.on("console", (message) =>
//             console.log(`Console: ${message.type()} ${message.text()}`)
//           );

//           return res(null, { file: pdfFilePath });
//         });
//       }
//     );
//   } catch (error) {
//     const err =
//       error instanceof Error ? error : { message: "An unknown error occurred" };
//     return makeResponse(req, res, statusCode.badRequest, false, err.message);
//   }
// };

// NodeModel.sqlpdfbinary = async (req, result) => {
//   try {
//     const browser = await puppeteer.launch({
//       headless: "new",
//       args: ["--no-sandbox"],
//     });
//     const page = await browser.newPage();

//     const bin = req.body.avdata;

//     const queryPromise = util.promisify(dbConn.query).bind(dbConn);

//     const antivirusData = await queryPromise(
//       `SELECT binary_vt_results.bin_id, binary_vt_results.av_name, binary_vt_results.av_classification FROM binary_vt_results WHERE binary_vt_results.bin_id = "${bin}"`
//     );

//     const pdfPromises = antivirusData.map(async (rowData, index) => {
//       const avName = rowData.av_name;
//       const avClassification = rowData.av_classification;

//       let tableRows = "";
//       let serialNumber = 1;

//       tableRows += `
//              <tr>
//                  <td style="border: 1px solid black; padding: 8px; text-align: center;">${serialNumber}</td>
//                  <td style="border: 1px solid black; padding: 8px; text-align: center;">${avName}</td>
//                  <td style="border: 1px solid black; padding: 8px; text-align: center;">${avClassification}</td>
//              </tr>
//          `;
//       serialNumber++;

//       const html = `<h3 style="text-align: right">Captured Binary Details</h3>
//         <hr>
//         <h2 style="text-align: center">Binary Report</h2>
//         <h3>Binary Statistics</h3>
//         <table style="border-collapse: collapse; width: 100%">
//           <tr class="highlighted" style="background-color: grey;">
//             <th style="border: 1px solid black; padding: 8px; text-align: center;">Bin ID</th>
//             <th style="border: 1px solid black; padding: 8px; text-align: center;">Binary MD5</th>
//             <th style="border: 1px solid black; padding: 8px; text-align: center;">Virus Total</th>
//           </tr>
//           <tr>
//             <td style="border: 1px solid black; padding: 8px; text-align: center;">${bin}</td>
//             <td style="border: 1px solid black; padding: 8px; text-align: center;">${req.body.md5}</td>
//           </tr>
//         </table>
//         <h3>Virus Total Results</h3>
//         <table style="border-collapse: collapse; width: 100%">
//           <tr class="highlighted" style="background-color: grey;">
//             <th style="border: 1px solid black; padding: 8px; text-align: center;">#</th>
//             <th style="border: 1px solid black; padding: 8px; text-align: center;">Antivirus</th>
//             <th style="border: 1px solid black; padding: 8px; text-align: center;">Classification</th>
//           </tr>
//           ${tableRows}
//         </table>`;

//       // await page.setContent(html);

//       // const pdfFilePath = `av_repo/${req.body.md5}.pdf`;

//       // await page.pdf({
//       //   path: pdfFilePath,
//       //   format: "A4",
//       //   displayHeaderFooter: false,
//       // });
//       await page.setContent(html);
//       await page.pdf({
//         path: "av_repo/" + req.body.avdata.md5_hash + ".pdf",
//         format: "A4",
//         displayHeaderFooter: false,
//       });
//       await page.close();
//       await browser.close();
//       const pdfFilePath = "av_repo/" + req.body.avdata.md5_hash + ".pdf";

//       return pdfFilePath;
//       3;
//     });

//     const pdfFilePaths = await Promise.all(pdfPromises);

//     await page.close();
//     await browser.close();

//     return result(null, { files: pdfFilePaths });
//   } catch (error) {
//     console.error("Error during PDF generation:", error);
//     return result(error);
//   }
// };

NodeModel.sqlpdfbinary = async (req, result) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    const bin = req.body.avdata;

    dbConn.query(
      `SELECT binary_vt_results.bin_id, binary_vt_results.av_name, binary_vt_results.av_classification FROM binary_vt_results WHERE binary_vt_results.bin_id = "${bin}"`,
      async (err, res) => {
        const antivirusData = res;

        let serialNumber = 1;
        let tableRows = "";

        await Promise.all(
          antivirusData.map(async (rowData) => {
            const avName = rowData.av_name;
            const avClassification = rowData.av_classification;

            tableRows += `
               <tr>
                   <td style="border: 1px solid black; padding: 8px; text-align: center;">${serialNumber}</td>
                   <td style="border: 1px solid black; padding: 8px; text-align: center;">${avName}</td>
                   <td style="border: 1px solid black; padding: 8px; text-align: center;">${avClassification}</td>
               </tr>
            `;
            serialNumber++;
          })
        );

        const html = `<h3 style="text-align: right">Captured Binary Details</h3>
           <hr>
           <h2 style="text-align: center">Binary Report</h2>
           <h3>Binary Statistics</h3>
           <table style="border-collapse: collapse; width: 100%">
             <tr class="highlighted" style="background-color: grey;">
               <th style="border: 1px solid black; padding: 8px; text-align: center;">Bin ID </th>
               <th style="border: 1px solid black; padding: 8px; text-align: center;">Binary MD5</th>
             </tr>
             <tr>
               <td style="border: 1px solid black; padding: 8px; text-align: center;">${bin}</td>
               <td style="border: 1px solid black; padding: 8px; text-align: center;">${req.body.md5}</td>
             </tr>
           </table>
           <h3>Virus Total Results</h3>
           <table style="border-collapse: collapse; width: 100%">
             <tr class="highlighted" style="background-color: grey;">
               <th style="border: 1px solid black; padding: 8px; text-align: center;">#</th>
               <th style="border: 1px solid black; padding: 8px; text-align: center;">Antivirus</th>
               <th style="border: 1px solid black; padding: 8px; text-align: center;">Classification</th>
             </tr>
             ${tableRows}
           </table>`;

        await page.setContent(html);

        try {
          await page.pdf({
            path: "av_repo/" + req.body.md5 + ".pdf",
            format: "A4",
            displayHeaderFooter: false,
            timeout: 30000,
          });
        } catch (error) {
          console.log(error);
        }
        await page.close();
        await browser.close();
        const pdfFilePath = "av_repo/" + req.body.md5 + ".pdf";
        return result(null, { file: pdfFilePath });
      }
    );
  } catch (error) {
    console.log("er----------",error);
    const err =
      error instanceof Error ? error : { message: "An unknown error occurred" };
    return result(null, err.message);
  }
};

// Node Dashboard(heat-map) Model 

NodeModel.honeypotDeviceType = async (req, result) => {
  try {
    dbConn.query(
      // `SELECT device_type, device_name, COUNT(*) AS device_count
      // FROM node_hp_profile
      // GROUP BY device_type, device_name
      // ORDER BY device_type, device_count DESC limit 10;`,
      // `WITH RankedDeviceTypes AS (
      //   SELECT
      //     device_type,
      //     ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS row_num
      //   FROM
      //     node_hp_profile
      //   GROUP BY
      //     device_type
      // )
      // SELECT
      //   ndp.device_type,
      //   ndp.device_name,
      //   COUNT(*) AS device_count
      // FROM
      //   node_hp_profile ndp
      // JOIN
      //   RankedDeviceTypes rdt ON ndp.device_type = rdt.device_type
      // WHERE
      //   rdt.row_num <= 10
      // GROUP BY
      //   ndp.device_type,
      //   ndp.device_name
      // ORDER BY
      //   ndp.device_type,
      //   device_count DESC;
      
      // `,
      `WITH RankedDeviceTypes AS (
        SELECT
          device_type,
          ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS row_num
        FROM
          node_hp_profile
        GROUP BY
          device_type
      )
      SELECT
        ndp.device_type,
        ndp.device_name,
        COUNT(*) AS device_count
      FROM
        node_hp_profile ndp
      JOIN
        RankedDeviceTypes rdt ON ndp.device_type = rdt.device_type
        inner join node_snapshot_hp_profile as nshp ON nshp.profile_id = ndp.profile_id
        inner join node_snapshot as ns ON ns.snapshot_id = nshp.snapshot_id
        inner join node_image as ni ON ni.image_id = ns.image_id
      WHERE
              ni.status = 1 AND 
        rdt.row_num <= 10
      GROUP BY
        ndp.device_type,
        ndp.device_name
      ORDER BY
        ndp.device_type,
        device_count DESC;
      `,
      (err, res) => {
        if (err) {
          return result(err, null);
        }

        const organizedData = res.reduce((acc, row) => {
          const { device_type, device_name, device_count } = row;
          if (!acc[device_type]) {
            acc[device_type] = [];
          }
          acc[device_type].push({ device_name, device_count });
          return acc;
        }, {});
        return result(null, organizedData);
      }
    );
  } catch (err) {
    return result(err, null);
  }
};

NodeModel.deployedHoneypotCategory = async (req, result) => {
  try {
    const { region, organizations, sector } = req.body.data;

    const regionFilter = region.length ? `AND node_location.region IN ('${region.join("','")}')` : '';
    const organizationsFilter = organizations.length ? `AND node_location.organization IN ('${organizations.join("','")}')` : '';
    // const sectorFilter = sector.length ? `AND node_location.sector IN ('${sector.join("','")}')` : '';
    dbConn.query(
      `SELECT COUNT( node_id) AS honeypot_count, 
      SUBSTRING_INDEX(SUBSTRING_INDEX(honeypot_profile, ':', 2), ':', -1) AS extracted_value
FROM node_configuration
inner join node_location on node_location.id = node_configuration.node_id
WHERE end_date IS NULL
${regionFilter}
${organizationsFilter}
GROUP BY extracted_value;
;
      `,
      (err, res) => {
        if (err) {
          return result(err, null);
        }
        return result(null, res);
      }
    );
  } catch (err) {
    return result(err, null);
  }
};

// NodeModel.deployedHoneypotType = async (req, result) => {
//   try {
//     dbConn.query(
//       `SELECT COUNT(DISTINCT node_id) AS honeypot_count, 
//       SUBSTRING_INDEX(SUBSTRING_INDEX(honeypot_profile, ':', 2), ':', -1) AS extracted_value
// FROM node_configuration
// WHERE end_date IS NULL
// GROUP BY extracted_value;
// ;
//       `,
//       (err, res) => {
//         if (err) {
//           return result(err, null);
//         }
//         return result(null, res);
//       }
//     );
//   } catch (err) {
//     return result(err, null);
//   }
// };

NodeModel.deployedHoneypotStatus = async (req, result) => {
  try {
    const { region, organizations, sector } = req.body.data;

    const regionFilter = region.length ? `AND node_location.region IN ('${region.join("','")}')` : '';
    const organizationsFilter = organizations.length ? `AND node_location.organization IN ('${organizations.join("','")}')` : '';
    // const sectorFilter = sector.length ? `AND node_location.sector IN ('${sector.join("','")}')` : '';
    dbConn.query(
      `SELECT COUNT( node_configuration.node_id) AS honeypot_count, node_configuration.health_status
      FROM node_configuration
      inner join node_location on node_location.id = node_configuration.node_id
      WHERE node_configuration.end_date IS NULL
      ${regionFilter}
      ${organizationsFilter}
      GROUP BY node_configuration.health_status;      
;
      `,
      (err, res) => {
        if (err) {
          return result(err, null);
        }
        return result(null, res);
      }
    );
  } catch (err) {
    return result(err, null);
  }
};

NodeModel.deployedNodeStatus = async (req, result) => {
  try {
    const { region, organizations, sector } = req.body.data;

    const regionFilter = region.length ? `AND node_location.region IN ('${region.join("','")}')` : '';
    const organizationsFilter = organizations.length ? `AND node_location.organization IN ('${organizations.join("','")}')` : '';
    // const sectorFilter = sector.length ? `AND node_location.sector IN ('${sector.join("','")}')` : '';
    // console.log(regionFilter)
    // console.log(organizationsFilter)
    // console.log(sectorFilter)
    dbConn.query(
      `SELECT COUNT(DISTINCT node.node_id) AS node_count, node.node_status
      FROM node
      inner join node_location on node.node_id = node_location.id
      where node_state = 'Active'
      ${regionFilter}
      ${organizationsFilter}
      GROUP BY node.node_status;
;
      `,
      (err, res) => {
        if (err) {
          return result(err, null);
        }
        return result(null, res);
      }
    );
  } catch (err) {
    return result(err, null);
  }
};

NodeModel.deployedNodeHardware = async (req, result) => {
  try {
    const { region, organizations, sector } = req.body.data;

    const regionFilter = region.length ? `AND node_location.region IN ('${region.join("','")}')` : '';
    const organizationsFilter = organizations.length ? `AND node_location.organization IN ('${organizations.join("','")}')` : '';
    // const sectorFilter = sector.length ? `AND node_location.sector IN ('${sector.join("','")}')` : '';

    dbConn.query(
      `SELECT COUNT( node.node_id) AS node_count, node.node_hardware
      FROM node
      inner join node_location on node.node_id = node_location.id
      where node_state = 'Active'
      ${regionFilter}
      ${organizationsFilter}
      GROUP BY node.node_hardware;      
;
      `,
      (err, res) => {
        if (err) {
          return result(err, null);
        }
        return result(null, res);
      }
    );
  } catch (err) {
    return result(err, null);
  }
};

NodeModel.deployedHoneypotType = async (req, result) => {
  try {
    const { region, organizations, sector } = req.body.data;

    const regionFilter = region.length ? `AND node_location.region IN ('${region.join("','")}')` : '';
    const organizationsFilter = organizations.length ? `AND node_location.organization IN ('${organizations.join("','")}')` : '';
    // const sectorFilter = sector.length ? `AND node_location.sector IN ('${sector.join("','")}')` : '';
    dbConn.query(
      `SELECT COUNT( node.node_id) AS node_count, node.node_sensor_hp_type
      FROM node
      inner join node_configuration on node_configuration.node_id = node.node_id
      inner join node_location on node.node_id = node_location.id
      WHERE node_configuration.end_date IS NULL
      ${regionFilter}
      ${organizationsFilter}
      GROUP BY node.node_sensor_hp_type;      
;
      `,
      (err, res) => {
        if (err) {
          return result(err, null);
        }
        return result(null, res);
      }
    );
  } catch (err) {
    return result(err, null);
  }
};

NodeModel.deployedNodeSectorWise = async (req, result) => {
  try {
    const { region, organizations, sector } = req.body.data;

    const regionFilter = region.length ? `AND node_location.region IN ('${region.join("','")}')` : '';
    const organizationsFilter = organizations.length ? `AND node_location.organization IN ('${organizations.join("','")}')` : '';
    // const sectorFilter = sector.length ? `AND node_location.sector IN ('${sector.join("','")}')` : '';

    dbConn.query(
      `SELECT COUNT(DISTINCT node.node_id) AS node_count, node_location.sector
      FROM node_location
      INNER JOIN node ON node.node_id = node_location.id
      where node_state = 'Active'
      ${regionFilter}
      ${organizationsFilter}
      GROUP BY node_location.sector;
      `,
      (err, res) => {
        if (err) {
          return result(err, null);
        }
        return result(null, res);
      }
    );
  } catch (err) {
    return result(err, null);
  }
};

// NodeModel.deployedNodeRegionWise = async (req, result) => {
//   try {
//     dbConn.query(
//       `SELECT COUNT(DISTINCT node_configuration.node_id) AS node_count, node_location.region
//       FROM node_location
//       INNER JOIN node_configuration ON node_configuration.node_id = node_location.id
//       WHERE node_configuration.end_date IS NULL
//       GROUP BY node_location.region;      
// ;
//       `,
//       (err, res) => {
//         if (err) {
//           return result(err, null);
//         }
//         return result(null, res);
//       }
//     );
//   } catch (err) {
//     return result(err, null);
//   }
// };

NodeModel.deployedNodeRegionWise = async (req, result) => {
  try {
    const { region, organizations, sector } = req.body.data;

    const regionFilter = region.length ? `AND node_location.region IN ('${region.join("','")}')` : '';
    const organizationsFilter = organizations.length ? `AND node_location.organization IN ('${organizations.join("','")}')` : '';
    // const sectorFilter = sector.length ? `AND node_location.sector IN ('${sector.join("','")}')` : '';

    const query = `
      SELECT COUNT(DISTINCT node.node_id) AS node_count, node_location.region
      FROM node_location
      INNER JOIN node ON node.node_id = node_location.id
      where node_state = 'Active'
      ${regionFilter}
      ${organizationsFilter}
      GROUP BY node_location.region;
    `;

    dbConn.query(query, (err, res) => {
      if (err) {
        return result(err, null);
      }
      return result(null, res);
    });
  } catch (err) {
    return result(err, null);
  }
};

NodeModel.deployedHoneypotGraph = async (req, result) => {
  try {
 // SELECT DATE_FORMAT(node_reg_date, '%Y-%m') AS timestamp, COUNT(*) AS count
    // FROM node
    // where node_state = 'Active'
    // GROUP BY timestamp;
    const query = `
   
    SELECT DATE_FORMAT(node_reg_date, '%Y-%m-%d %H:%i:%s') AS timestamp, COUNT(*) AS count
FROM node
WHERE node_state = 'Active'
GROUP BY timestamp;

    `;

    dbConn.query(query, (err, res) => {
      if (err) {
        return result(err, null);
      }
      return result(null, res);
    });
  } catch (err) {
    return result(err, null);
  }
};

NodeModel.regionFilterData = async (req, result) => {
  try {
    const query = `
      SELECT COUNT(region) AS doc_count, region
      FROM honeybox.node_location
      GROUP BY region;
    `;
    dbConn.query(query, (err, res) => {
      if (err) {
        return result(err, null);
      }

      const formattedResult = {
        data: res.map(item => ({
          key: item.region,
          doc_count: item.doc_count
        })),
        message: "Here is your finding result!!"
      };

      return result(null, formattedResult);
    });
  } catch (err) {
    return result(err, null);
  }
};

NodeModel.sectorFilterData = async (req, result) => {
  try {
    const query = `
      SELECT COUNT(sector) AS doc_count, sector
      FROM honeybox.node_location
      GROUP BY sector;
    `;
    dbConn.query(query, (err, res) => {
      if (err) {
        return result(err, null);
      }

      const formattedResult = {
        data: res.map(item => ({
          key: item.sector,
          doc_count: item.doc_count
        })),
        message: "Here is your finding result!!"
      };

      return result(null, formattedResult);
    });
  } catch (err) {
    return result(err, null);
  }
};

NodeModel.organizationFilterData = async (req, result) => {
  try {
    const query = `
      SELECT COUNT(organization) AS doc_count, organization
      FROM honeybox.node_location
      GROUP BY organization;
    `;
    dbConn.query(query, (err, res) => {
      if (err) {
        return result(err, null);
      }

      const formattedResult = {
        data: res.map(item => ({
          key: item.organization,
          doc_count: item.doc_count
        })),
        message: "Here is your finding result!!"
      };

      return result(null, formattedResult);
    });
  } catch (err) {
    return result(err, null);
  }
};


// NodeModel.deployedDeviceType = async (req, result) => {
//   try {
//     dbConn.query(
//       `SELECT nhp.device_type, COUNT(distinct device_type) AS device_count
//       FROM node_image ni
//       JOIN node_snapshot ns ON ni.image_id = ns.image_id
//       JOIN node_snapshot_hp_profile nspp ON ns.snapshot_id = nspp.snapshot_id
//       JOIN node_hp_profile nhp ON nspp.profile_id = nhp.profile_id
//       WHERE ni.status = 1
//       GROUP BY nhp.device_type;`,
//       (err, res) => {
//         if (err) {
//           return result(err, null);
//         }
//         return result(null, res);
//       }
//     );
//   } catch (err) {
//     return result(err, null);
//   }
// };

NodeModel.saveHoneypotConfigHiHp = async (req, result) => {
  var conf_id = 0;
  var { hp_type, hp_services, node_id, vm_name, hp_profile } = req.body;
  // console.log("req.body--------", req.body);
// console.log("---BODYYY",req.body)
  var serv = hp_services.map((e) => {
    if (e && e != undefined && e != null && e != "") {
      return e.key;
    }
  });
  var serv_name = hp_services.map((e) => {
    if (e && e != undefined && e != null && e != "") {
      return e.value;
    }
  });
  // console.log("serv",serv);
  // console.log("serv_name",serv_name)
  let servieslist = await getServiceList(serv);
  // console.log("servieslist------",servieslist);

  let services = await getServices(serv);
  // console.log("services-----",services);

  if (servieslist && services) {
    servieslist.filter((servL) => {
      services.filter((e) => {
        if (servL.conf_id == e.conf_id) {
          conf_id = servL.conf_id;
          // console.log("conf_id====",conf_id);
        }
      });
    });
  }
  // console.log("conf_id",conf_id)

  if (conf_id == 0) {
    let maxNode = await getMaxNode();
    // console.log("maxNode", maxNode)

    if (maxNode[0].conf_id == null) {
      maxNode[0].conf_id = 0;
    }
    conf_id = maxNode[0].conf_id + 1;
    //     // conf_id
    // console.log("conf_id--->", conf_id)
    let insertedNode = await InsertNode(conf_id, serv);
    // console.log("insertedNode--------",insertedNode);
console.log("--------------------------------------Servicee",serv)
    let vul_id = await getVulnerabilities(hp_profile);
    // console.log("vul_id", vul_id)

    for (var i = 0; i < vul_id.length; i++) {
      var inserting = await InsertVul(conf_id, vul_id[i].vulnerability_id);
      // console.log(inserting);
    }
  }

  // if conf id exists
  let hptypeId = await gethp_typeid(hp_type);
  // console.log(hptypeId);

  // insert new config
  // let newConfig = await createConfig(req.body, serv, conf_id, hptypeId);
  let newConfig = await createConfigHiHp(req.body, serv, conf_id, hptypeId);

  let nodeNetdata = await getNodeIpsData(node_id);

  // console.log("nodeNetdata===>>>>",nodeNetdata);

  const ipAddressList = [];
  const ipAddressType = {};

  nodeNetdata.forEach((row) => {
    if (row.type === "public") {
      ipAddressList.push(row.ip_address);
    } else {
      ipAddressType[row.type] = row.ip_address;
    }
  });

  const randomIp = getRandomIp(ipAddressList);
  // console.log("--------------------------",nodeNetdata)
  let updateNImage = await updateNodeImage(vm_name, node_id);

  let currentNodeConfig = await getCurrentConfiguration(node_id);

  let updateConfig = await updateNodeConfig(currentNodeConfig, randomIp);

  let currentConfig = await getCurrentConfiguration(node_id);

  let hpName = await gethpName(vm_name, node_id);


  let generateXml = await getXmlObjectHiHp(currentConfig, nodeNetdata, req.body,serv_name, hpName);

  // console.log("-----------------------------------",generateXml)
  // set ip
  // let setIpAdd = await setIpAddress(currentConfig,conf_id);

  // set node config

  let setNode = await setNodeConfig(currentConfig, conf_id);
  // console.log("setNode===================>>>>>>>>>>",setNode);

  if (setNode) {
    return result({
      status: 1,
      message: "Honeypot added successfully",
      data: setNode,
    });
  }
};



async function getXmlObjectHiHp(allConfs, nodeNetdata, reqbody,service, hpName) {
  console.log("====================allconf=============",allConfs);
  console.log("====================HpName=============",hpName);
  var static_ip = "";
  var netmask = "";
  var gateway = "";
  var dns = "";

  nodeNetdata.map((e) => {
    if (e.type == "static_ip") {
      static_ip = e.ip_address;
    }
    if (e.type == "netmask") {
      netmask = e.ip_address;
    }
    if (e.type == "gateway") {
      gateway = e.ip_address;
    }
    if (e.type == "dns") {
      dns = e.ip_address;
    }
  });

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let honeypot = [];
      for (let conf of allConfs) {
        var obj = {
          UConfID: {
            "#text": conf.conf_id,
          },
          VmInfo: {
            VmType: {
              "#text": conf.vm_type,
            },
            VmName: {
              "#text": conf.vm_name,
            },
            OsType: {
              "#text": conf.os_type,
            },
            HoneypotType: {
              // "#text": conf.honeypot_type,
              "#text": 'PHP',
            },
            HoneypotName: {
              "#text": hpName[0].honeypot_name,
            },
            SnapshotName: {
              "#text": conf.snapshot_name,
            },
            ContainerCount: {
              "#text": conf.honeypot_count,
            },
            // repo: {
            //   "#text":
            //     config.Xml_Repo + "/" + conf.image_name + ':' + conf.image_tag
            // },
          },
          Network: {
            NetworkType: {
              "#text": conf.network_type,
            },
            IPAddress: {
              "#text": conf.ip_address,
            },
            Netmask: {
              "#text": netmask,
            },
            Gateway: {
              "#text": gateway,
            },
            DNS: {
              "#text": dns,
            },
          },
          Profile: {
            "#text": conf.honeypot_profile,
          },
          ServiceInfo: {
            ServiceName: conf.services.split(',').map(service => ({ "#text": service })),
          },
          // ServiceInfo: {
          //   ServiceName: {
          //     "#text": conf.services,
          //   },
          // },
        };
        honeypot.push(obj);
      }
      var newObj = {
        DHS: {
          Honeypot: honeypot,
        },
      };
      var finalDocument = newObj;
      var builder = require("xmlbuilder");
      var document = builder.create(finalDocument).end({ pretty: true });

      // save file start
      var dir = "/BB_LOGS/honeypot_conf/" + reqbody.node_id + "/";
      if (!fs.existsSync(dir)) {
        fs.promises.mkdir(dir, { recursive: true });
      }

      setTimeout(() => {
        fs.writeFile(dir + "HiHpHoneypot.xml", document.toString(), (err) => {
          if (err) console.log(err);
          else {
            console.log("File written successfully\n");
          }
        });
      }, 100);
      //   save file end

      resolve(obj);
    }, 300);
  });
}

module.exports = NodeModel;
