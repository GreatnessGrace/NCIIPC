let dbConn = require('../../config/db.config');
const { sequelize, DataTypes } = require('../../config/sequelize');
const jwt = require('jsonwebtoken');
const config = process.env;
const NodeLoc = require("./nodelocations.model")(sequelize, DataTypes);
const notifications = require('../controllers/notifications.controller');
const Node_configuration = require('./node_configuration.model');
const builder = require('xmlbuilder');
const doc = builder.create('root');
const path = require('path');
var fs = require("fs");


let PermissionModel = (data) => {
    create_at = new Date() | any;
    updated_at = new Date() | any;
}

PermissionModel.getRegionList = async (result) => {
    try{
        let regionList = await NodeLoc.findAll({
            attributes: ['region'],
            group: 'region'
        })
        if (!regionList) {

            return result(null, {
                data: err,
                message: "I am error!!!"
            })
        } else {
            return result(null, {
                data: regionList,
                message: "Here is the data!!!"
            })
        }
    } catch(err){
        return result(null,{
            data:err,
            message:"Something went Wrong"
        })
    }

}

// Get region by node id

PermissionModel.getRegionbyNode = (req, result) => {
    try{
        dbConn.query(`SELECT DISTINCT node_location.region FROM node_location where id IN (${req.body.node_ids})`, (err, res) => {
            return result(null, {
                data: res,
                message: "Here is the data!!!"
            })
        })
    } catch(err){
        return result(null,{
            data:err,
            message:"Something went Wrong"
        })
    }
}

// get sector via regions
PermissionModel.getSector = (req, result) => {
    let region = []
    req.body.map((ele) => {
        region.push('"' + ele.region + '"')
    })
    try{
        let sql = `SELECT DISTINCT node_location.sector as 'key' FROM node_location WHERE node_location.region IN  (${region})`
        dbConn.query(sql, (err, res) => {
            return result(null, {
                data: res,
                message: "Regions are here!!!"
            })
        })
    } catch(err){
        return result(null,{
            data:err,
            message:"Something went Wrong"
        })
    }
}

// get organization via sectors
PermissionModel.getOrganization = (req, result) => {
    let region = []
    let sector = []

    req.body['region'].map((ele) => {
        if(ele.region != '' && ele.region != undefined){
        region.push('"' + ele.region + '"')
        } else {
            region.push('"' + ele.key + '"')
        }
    })
    // req.body['sector'].map((ele) => {
    //     if(ele.sector != '' && ele.sector != undefined){
    //     sector.push('"' + ele.sector + '"')
    //     }  else{
    //     sector.push('"' + ele.key + '"')
    //     }
    // })
 
    // let sql = `SELECT DISTINCT node_location.organization as 'key' FROM node_location WHERE node_location.region IN  (${region}) AND node_location.sector IN  (${sector}) order by node_location.organization asc`
    let sql = `SELECT DISTINCT node_location.organization as 'key' FROM node_location WHERE node_location.region IN  (${region}) order by node_location.organization asc`
    
    try{
        dbConn.query(sql, (err, res) => {
            console.log("Error in try ----",err);
            console.log("Response in try ----",res);

            return result(null, {
                data: res,
                message: "Regions are here!!!"
            })
        })
    } catch(err){
        console.log("Error in catch ----",err);
        return result(null,{
            data:err,
            message:"Something went Wrong"
        })
    }
}

PermissionModel.getNodeId = (req, result) => {

    let region = []
    let sector = []
    let organization = []

    req.body['organization'].map((ele) => {
        if(ele.organization != '' && ele.organization != undefined){
            organization.push('"' + ele.organization + '"')
        } else {
            organization.push('"' + ele.key + '"')
        }
    })

    req.body['region'].map((ele) => {
        if(ele.region != ''  && ele.region != undefined){
            region.push('"' + ele.region + '"')
        } else {
            region.push('"' + ele.key + '"')
        }
    })
    req.body['sector'].map((ele) => {
        if(ele.sector != '' && ele.sector != undefined){
            sector.push('"' + ele.sector + '"')
        }  else{
            sector.push('"' + ele.key + '"')
        }
    })

    let sql = `SELECT DISTINCT node_location.id FROM node_location WHERE node_location.region IN  (${region}) AND node_location.sector IN  (${sector}) AND node_location.organization IN  (${organization})`
    try{
        dbConn.query(sql, (err, res) => {
            return result(null, {
                data: res,
                message: "Available node Id is here!!"
            })
        })
    } catch(err){
        return result(null,{
            data:err,
            message:"Something went Wrong"
        })
    }
}

PermissionModel.getNodeAllId = (req, result) => {
    let sql = `SELECT count(id) as count FROM honeybox.node_location`
    try{
        dbConn.query(sql, (err, res) => {
            return result(null, {
                data: res,
                message: "Total node Id is here!!"
            })
        })
    } catch(err){
        return result(null,{
            data:err,
            message:"Something went Wrong"
        })
    }
}

// // entery inside table
// PermissionModel.nodePermission = async (req, result) => {
//     let user_id = req.body.user_id
//     dbConn.query(`delete FROM node_ids where user_id=${user_id}`,async (err, res) => {
        
//         if(res){
//             await req.body.node_ids.map(async ele => {
//                 await dbConn.query(`insert into node_ids (user_id, node_id, permission) value(${user_id},${ele.id},'yes')`, (err, res) => {
//                 });

//             }); 

//             return result(null, {
//                 message: "permission granted successfully",
                
//             })
//        } 

//         });

//         return result(null, {
//             message: "permission granted successfully to all",
            
//         })
    

// };


// entery inside table
PermissionModel.nodePermission = async (req, result) => {
    // let req_ids = req.body.node_ids
    let user_id = req.body.user_id
    // getting the user_id from node_ids table

    try{
        dbConn.query(`select node_id from node_ids where user_id = '${user_id}'`,async (err, res) => {
                if (res.length == 0) {
                await req.body.node_ids.map(async ele => {
                    try{
                        await dbConn.query(`insert into node_ids (user_id, node_id, permission) value(${user_id},${ele.id},'yes')`, (err, res) => {

                            })
                        } catch(err){
                            return result(null,{
                                data:err,
                                message:"Something went Wrong"
                            })
                        }
                    })
                } else {
                    let db_ids = []
                    let req_ids = []

                    await req.body.node_ids.map(ele => {
                        req_ids.push(ele.id)
                    })
                    await res.map(ele => {
                        db_ids.push(ele.node_id)
                    })
                    let to_make_false = []
                    let to_create = []
                    to_make_false = db_ids.filter(x => !req_ids.includes(x));
                    to_create = req_ids;
                    notifications.addUserNodeNotification(req, to_create, user_id);


                    await dbConn.query(`delete FROM node_ids where user_id=${user_id}`,async (err, res) => {
                        if (err) {

                        } else {

                            await to_create.map(ele => {
                                try{
                                    dbConn.query(`insert into node_ids (user_id, node_id, permission) value(${user_id},${ele},'yes')`, (err, res) => {
                                        if (err) {
                                            return result( {
                                                message: "While permission granted query error",
                                                data: err
                                            })
                                        } 
                                        // else {

                                        //     return result({msg:"permission granted"})
                                        // }
                                    })
                                } catch(err){
                                    return result(null,{
                                        data:err,
                                        message:"Something went Wrong"
                                    })
                                }
                            })

                        }
                    });
                    return result({
                        data: res,
                        message: "here is your nodes"
                    })
                }

        })
    } catch(err){
        return result(null,{
            data:err,
            message:"something went wrong while fetching user_id from node_ids table"
        })
    }

}


async function updateNodeNetwork(allConfs){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            allConfs.map((conf,i)=>{
             
            let nodeConf = `update node_network set status=1 where ip_address = '${conf.ip_address}'`;
                 dbConn.query(nodeConf, async (err,res) => {
                  
                    if(i == allConfs.length - 1){
                        resolve(res);
                    }
                })
             });
            
        }, 1);
    });

   
}

async function updateNodeConf(allConfs){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
        //    console.log("--==allConfs",allConfs)
                allConfs.map((conf,i)=>{
                    // console.log("Ip_______________",conf.ip_address)
                    // console.log("conf_______________",conf.u_conf_id)
            let nodeConf = `UPDATE node_configuration set ip_address = '${conf.ip_address}' where u_conf_id =  ${conf.u_conf_id}`;
                 dbConn.query(nodeConf, async (err,res) => {
                   
                    if(i == allConfs.length - 1){
                        resolve(res);
                    }
                })
            })
            
        }, 1);
    });

   
}


// delte Honeypot
PermissionModel.delteHoneypot = async (req, result) => {

    const {
        node_id,
        conf_id,
        u_conf_id,
        vm_name,
        os_name,
        image_name,
        image_tag,
    } = req.body


    // update node_configuration table
    var m = new Date();
    var datetime = m.getUTCFullYear() +"-"+ (m.getUTCMonth()+1) +"-"+ m.getUTCDate() + " " + m.getUTCHours() + ":" + m.getUTCMinutes() + ":" + m.getUTCSeconds();
    
    let updatedNode_conf = await updateEndDate(u_conf_id,datetime);
    // console.log('node_conf',updatedNode_conf);
     // update node_image table
    let node_imagequery = "update node_image set status=0 where node_id= " + node_id + " and vm_name= '" + vm_name + "' and os_name= '" + os_name + "' and status !=3 ";
    let node_image = await dbConn.query(node_imagequery);
    // console.log('node_image',node_image);

    // update node_network table
    node_network_query = "update node_network set status=0 where node_id= " + node_id+ " ";
    let node_network = await dbConn.query(node_network_query);
    // console.log('node_image',node_image);

   
    // get all available ips
    let nodeNetdata = await getIpsnode_network(node_id);

    //get all configurations
    let allConfs = await getAllDeployedConf(node_id);
    
    //  console.log('allConfs',allConfs);

    // generate n save xml file
    let saveXml = await getXmlObject(allConfs,nodeNetdata,req.body);
// console.log("saved--------------------------", saveXml)
    // var allConfsJson=JSON.parse(JSON.stringify(allConfs))
    //update Node Conf
    let updateNodeCon = await updateNodeConf(allConfs);
    // console.log("updateNodeCon--------------------------", updateNodeCon)

     //update Node Network
    let updateNodeNet = await updateNodeNetwork(allConfs);
    // console.log("updateNodeNet--------------------------", updateNodeNet)

    if(updateNodeNet){
        return result( {
            status : 1,
            message: "Honeypot deleted successfully",
            data: updateNodeNetwork
        })
    } 

}

async function getAllDeployedConf(node_id){
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            let nodeNetquery = "SELECT node_configuration.node_id, node_configuration.conf_id, node_configuration.network_type, node_configuration.vm_type, node_configuration.vm_name, "
            + "node_configuration.os_type, node_configuration.honeypot_type, node_configuration.honeypot_profile, node_configuration.snapshot_name, node_configuration.honeypot_count, "
            + "node_configuration.u_conf_id, node_configuration.os_name, node_configuration.start_date,node_configuration.end_date, node_configuration.health_status, node_configuration.ip_address, "
            + "node_image.image_name, node_image.image_tag "
            + "FROM  node_configuration Left Join node_image ON node_image.vm_name = node_configuration.vm_name "
            + "WHERE " + "node_configuration.node_id =  " + node_id + " AND node_configuration.end_date IS NULL ";
              dbConn.query(nodeNetquery, async (err,res) => {
                resolve(res)
            })
        
        }, 300);
    });

   
}

async function updateEndDate(u_conf_id,datetime){
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            let nodeConf = "update node_configuration set end_date='" + datetime + "' where u_conf_id=" + u_conf_id+ "";
              dbConn.query(nodeConf, async (err,res) => {
                resolve(res)
            })
        
        }, 1);
    });

   
}

async function getIpsnode_network(node_id){
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            let nodeNetquery = "SELECT DISTINCT ip_address,type FROM node_network WHERE node_network.node_id = "+node_id;
              dbConn.query(nodeNetquery, async (err,res) => {
             
                resolve(res)
            })
        
        }, 300);
    });

   
}

async function getXmlObject(allConfs,nodeNetdata,reqbody){
    // console.log('nodeNetdata',nodeNetdata);
    var static_ip = '';
    var netmask = '';
    var gateway = '';
    var dns = '';
    // console.log("services-------",reqbody.services)

    nodeNetdata.map((e)=>{
        if(e.type == 'static_ip'){
            static_ip =  e.ip_address;
        }
        if(e.type == 'netmask'){
            netmask =  e.ip_address;
        }
        if(e.type == 'gateway'){
            gateway =  e.ip_address;
        }
        if(e.type == 'dns'){
            dns =  e.ip_address;
        }
    });

    // console.log('static_ip',static_ip,'dns',dns,'netmask',netmask,'gateway',gateway);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let honeypot = [];
            for(let conf of allConfs){
//                 console.log("conf--------", conf)
// console.log("image name", conf.image_name)
// console.log("image tag", conf.image_tag)
            var obj = {
               
                   
                        UConfID:{
                            '#text':conf.u_conf_id
                        },
                        VmInfo:{
                            VmType:{
                                '#text':conf.vm_type
                            },
                            VmName:{
                                '#text':conf.vm_name
                            },
                            OsType:{
                                '#text':conf.os_type
                            },
                            HoneypotType:{
                                // '#text':conf.honeypot_type,
                                "#text": 'PHP',
                            },
                            HoneypotName:{
                                '#text':conf.snapshot_name
                            },
                            SnapshotName:{
                                '#text':conf.snapshot_name
                            },
                            ContainerCount:{
                                '#text':conf.honeypot_count
                            },
                            repo:{
                                '#text': config.Xml_Repo+'/'+conf.image_name+':'+conf.image_tag
                            },
                        },
                        Network: {
                            NetworkType:{
                                '#text':conf.network_type
                            },
                            IPAddress:{
                                '#text':conf.ip_address
                            },
                            Netmask:{
                                '#text':netmask
                            },
                            Gateway:{
                                '#text':gateway
                            },
                            DNS:{
                                '#text':dns
                            },
                    },
                    Profile:{
                        '#text':reqbody.honeypot_profile
                    },
                    // ServiceInfo:{
                    //     ServiceName:{
                    //         '#text':reqbody.services
                    //     }
                    // }
                  
                    ServiceInfo: {
                        ServiceName: reqbody.services.split(',').map(service => ({ "#text": service })),
                      },
              };
              honeypot.push(obj);
            }
                var newObj = {
                    DHS : {
                        Honeypot : honeypot
                    }   
                    
                }
            var finalDocument = newObj;
                var builder = require('xmlbuilder');
                var document = builder.create(finalDocument).end({ pretty: true});
    //   var dir = __dirname + "/BB_LOGS/honeypot_conf/" + reqbody.node_id + "/";

                // save file start
                var dir ='/BB_LOGS/honeypot_confs/'+reqbody.node_id+'/';
                if (!fs.existsSync(dir)) {
                    fs.promises.mkdir(dir, { recursive: true });
                }

                setTimeout(() => {
                fs.writeFile(dir+"Honeypot.xml",  document.toString(), (err) => {
                    if (err)
                        console.log(err);
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



module.exports = PermissionModel