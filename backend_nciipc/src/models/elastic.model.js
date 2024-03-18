const esb = require('elastic-builder');
var url = require('url')
var XMLHttpRequest = require('xhr2');
var elasticsearch = require('elasticsearch')
const config = process.env;
const { sequelize, DataTypes } = require('../../config/sequelize');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model')(sequelize, DataTypes);
const NodeLocations = require('../models/nodelocations.model')(sequelize, DataTypes);
const Node_id = require('../models/node_id.model')(sequelize, DataTypes);
const usersController = require('../controllers/users.controller');
const fs = require('fs');
var path = require('path');
var index_name_adar = process.env.ES_Index_ADAR;

const os = require('os');
const bcrypt = require('bcrypt');
var zipper = require("zip-local");


require("dotenv").config();


NodeLocations.hasMany(User, {
    foreignKey: 'user_id'
});

Node_id.hasOne(User, {
    foreignKey: 'user_id'
});

User.hasMany(Node_id, {
    foreignKey: 'user_id'
});

var client = new elasticsearch.Client({
    // host: 'http://192.168.8.163:9200'
    host: process.env.ES_Address,
    requestTimeout: 120000
});

var clientNSCS = new elasticsearch.Client({
    host: process.env.DB_Host,
    requestTimeout: 120000,
  });
  
let ElasticModel = (user) => {
    create_at = new Date() | any;
    updated_at = new Date() | any;
}

// var urlIP = "http://192.168.8.163:9200";
// var urlIP = process.env.ES_Address;
// var searchKey = "/indicator_events/_search/"
// var allData = urlIP + searchKey
var xhr = new XMLHttpRequest();
// var index_name = 'hp_indicator_events' 
var index_name = process.env.ES_Index



// get getBinaryPcap
ElasticModel.getBinaryPcap = async (req, response) => {
    var query
    var {
        dynPath,
        node,
        day,
        month,
        hours,
        minutes,
        partialPath
    } = req.body


   var fileExist = checkFileExist(partialPath + day, hours);
    // console.log("---",fileExist)
    if(!fileExist){
        console.log("In if")
        return response(null, {
            status: 0,
            message: "File Not Found"
        })  
    }
else{
    // console.log("In else")

    // if (fileExist == '') {
    //     day -= 1;
    //     fileExist = checkFileExist(partialPath + day, hours);
    // }
    console.log('finalPath', fileExist);
    let finalPath = partialPath + day + '/' + fileExist + '/' + 'cdac_hp_2/log';
    console.log('finalPath', finalPath);
    zipDirectory(finalPath, finalPath);
    return response(null, {
        data: finalPath + '.zip',
        message: "Here is your finding result!!"
    })
}
}

ElasticModel.downloadbinary = async (req, response) => {

    var {
evt
    } = req.body

    let finalPath = "/BB_LOGS/binary_repo/"+evt+'.zip';
    var fileExist = "";
    fileExist = checkBinaryFileExist(finalPath);
    if(!fileExist){
        return response(null, {
            status: 0,
            message: "File Not Found"
        })  
    }
else{
    return response(null, {
        status:1,
        data: finalPath,
        message: "File Found"
    })

}
  
}

function checkBinaryFileExist(filePath) {
    try {
      fs.accessSync(filePath, fs.constants.F_OK);
      return true; // File exists
    } catch (err) {
      return false; // File doesn't exist
    }
  }

  
function checkFileExist(filePath, hour) {
    try {
        let hourArr = [];
        fs.readdirSync(filePath).forEach(file => {
            if (hour >= file) {
                hourArr.push(file);
            }
        });

        if (hourArr.length > 0) {
            hourArr.sort();
            hour = hourArr.pop();
        } else {
            hour = '';
        }

        return hour;
    } catch (error) {
        console.error('Error reading directory:', error.message);
        return false; // Return empty string to indicate file not found
    }
}

// function checkFileExist(filePath, hour) {
//     let hourArr = [];
//     fs.readdirSync(filePath).forEach(file => {

//         if (hour >= file) {
//             hourArr.push(file);
//         }

//     });



//     if (hourArr.length > 0) {
//         hourArr.sort();
//         hour = hourArr.pop();
//     } else {
//         hour = '';
//     }

//     return hour;
// }

async function zipDirectory(sourceDir, outPath) {

    console.log('sourceDir', sourceDir);
    console.log('outPath', outPath);
    zipper.sync.zip(sourceDir).compress().save(outPath + '.zip');
    //  const zip_a_folder = require('zip-a-folder');
    // let zippath = await zip_a_folder.zip(sourceDir, outPath+'/archive.zip');

    // return zippath;

    // const stream = fs.createWriteStream(outPath);

    // return new Promise((resolve, reject) => {
    //   archive
    //     .directory(sourceDir, false)
    //     .on('error', err => reject(err))
    //     .pipe(stream)
    //   ;

    //   stream.on('close', () => resolve());
    //   archive.finalize();
    // });
}

ElasticModel.getNodePcap = async (req, response) => {
    var { path } = req.body;
  
    let finalPath = path;
    zipDirectory(finalPath, finalPath);
    return response(null, {
      status: 1,
      data: finalPath + ".zip",
      message: "Here is your finding result!!",
    });
  };
  

// get all data
ElasticModel.getAllData = (result) => {
    try {
        client.search({
            index: index_name,
            body: {
                query: {
                    match_all: {},
                }
            }
        })
            .then(resp => {
                malware = [];
                if (!resp) {
                    return result(null, {
                        data: resp
                    });
                }
                return result(null, {
                    data: resp.hits.hits
                });
            })
            .catch(err => {
                return result(null, {
                    msg: 'Error not found',
                    err
                });
            });
    } catch (error) {
        return result(error, null);
    }
}

// Multiple search operation
ElasticModel.findOneAPI = (req, result) => {
    try {
        client.search({
            index: index_name,
            body: {
                query: {
                    match: {
                        "ip_address": req.body.ip_address,
                    },
                    match: {
                        "event_data.Scan_Type": "Attempt to connect closed port!"
                    }
                }
            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp,
                        message: "reponse not found!!!"
                    })
                } else {
                    return result(null, {
                        data: resp,
                        message: "Here is your finding result!!"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}



// Get all eventsData
ElasticModel.eventsData = async (req, result) => {


    let node = await getUserNodesAssigned(req);
    try {
        client.search({
            index: index_name,
            body: {
                query: {
                    bool: {
                        must: {
                            terms: {
                                node_id: node
                            }
                        }

                    }
                },
                size: 0,
                aggs: {
                    org_name: {
                        terms: {
                            field: req.params.type,
                            size: 1000
                        }
                    }
                }
            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp.aggregations.org_name.buckets,
                        message: "reponse not found!!!"
                    })
                } else {
                    return result(null, {
                        data: resp.aggregations.org_name.buckets,
                        message: "Here is your finding result!!"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}

// get org
ElasticModel.getOrg = async (req, result) => {

    let node = await getUserNodesAssigned(req);

    let bodytoSend = req.body.map((e) => {
        if (e == 'Industrial') {
            e = "Industrial";
            return e;
        }
        return e;
    })

    try {
        client.search({
            index: index_name,
            body: {
                size: 0,
                query: {
                  bool: {
                    filter: [
                      {
                        terms: {
                          "organization_sector.keyword": bodytoSend
                        }
                      },
                      {
                        terms: {
                          node_id: node
                        }
                      }
                    ]
                  }
                },
                aggs: {
                  NAME: {
                    terms: {
                      field: "organization.keyword",
                      size: 500
                    }
                  }
                }
                
            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp.aggregations.NAME.buckets,
                        message: "reponse not found!!!"
                    })
                } else {
                    return result(null, {
                        data: resp.aggregations.NAME.buckets,
                        message: "Here is your finding result!!"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}
// get events data
ElasticModel.threatEvents = (req, result) => {
    var query
    const {
        organization_type,
        organization_name,
        organization_typeName,
        start_date,
        end_date
    } = req.body.form
    var allNodes = req.body.all_nodes
    var start_epoch = new Date(start_date);
    start_epoch = start_epoch.getTime();

    var end_epoch = new Date(end_date);
    end_epoch = end_epoch.getTime();

    let org_key = organization_name + ".keyword";
    try {
        client.search({
            index: index_name,
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                terms: {
                                    "organization_sector.keyword": organization_name
                                }
                            },

                            {
                                range: {
                                    event_timestamp: {
                                        gte: start_epoch,
                                        lte: end_epoch,
                                        format: 'epoch_millis'
                                    }
                                }
                            }
                        ]


                    }
                },


                aggs: {
                    organisation: {
                        terms: {
                            field: "organization.keyword",
                            size: 1000
                        },
                        aggs: {
                            eventlabel: {
                                terms: {
                                    field: "event_label.keyword",
                                    size: 50
                                }

                            },
                            bucketcount: {
                                stats_bucket: {
                                    buckets_path: "eventlabel._count"
                                }
                            }
                        }

                    }

                },

                size: 0

            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp,
                        message: "reponse not found!!!"
                    })
                } else {
                    return result(null, {
                        data: resp,
                        message: "Here is your finding result!!"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}

// get events threatEventsRegion data
ElasticModel.threatEventsRegion = (req, result) => {
    var query
    const {
        organization_type,
        organization_name,
        organization_typeName,
        start_date,
        end_date
    } = req.body.form
    var allNodes = req.body.all_nodes

    var start_epoch = new Date(start_date);
    start_epoch = start_epoch.getTime();

    var end_epoch = new Date(end_date);
    end_epoch = end_epoch.getTime();

    let org_key = organization_name + ".keyword";
    let organization = organization_name.map((e) => {
        return e.key;
    })

    try {
        client.search({
            index: index_name,
            body: {
                query: {
                    bool: {
                        must: [

                            {
                                terms: {
                                    "organization_region.keyword": organization_name
                                }
                            },

                            {
                                range: {
                                    event_timestamp: {
                                        gte: start_epoch,
                                        lte: end_epoch,
                                        format: 'epoch_millis'
                                    }
                                }
                            }
                        ]


                    }
                },


                aggs: {
                    organisation: {
                        terms: {
                            field: "organization.keyword",
                            size: 1000
                        },
                        aggs: {
                            eventlabel: {
                                terms: {
                                    field: "event_label.keyword",
                                    size: 50
                                }

                            },
                            bucketcount: {
                                stats_bucket: {
                                    buckets_path: "eventlabel._count"
                                }
                            }
                        }

                    }

                },

                size: 0

            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp,
                        message: "reponse not found!!!"
                    })
                } else {
                    return result(null, {
                        data: resp,
                        message: "Here is your finding result!!"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}

// get events threatEventsOrgName data
ElasticModel.threatEventsOrgName = (req, result) => {
    var query
    const {
        organization_type,
        organization_name,
        organization_typeName,
        start_date,
        end_date
    } = req.body.form
    var allNodes = req.body.all_nodes
    var start_epoch = new Date(start_date);
    start_epoch = start_epoch.getTime();

    var end_epoch = new Date(end_date);
    end_epoch = end_epoch.getTime();

    let org_key = organization_name + ".keyword";
    try {
        client.search({
            index: index_name,
            body: {
                query: {
                    bool: {
                        must: [

                            {
                                terms: {
                                    "organization.keyword": organization_name
                                }
                            },


                            {
                                range: {
                                    event_timestamp: {
                                        gte: start_epoch,
                                        lte: end_epoch,
                                        format: 'epoch_millis'
                                    }
                                }
                            }
                        ]


                    }
                },


                aggs: {
                    organisation: {
                        terms: {
                            field: "organization.keyword",
                            size: 1000
                        },
                        aggs: {
                            eventlabel: {
                                terms: {
                                    field: "event_label.keyword",
                                    size: 50
                                }

                            },
                            bucketcount: {
                                stats_bucket: {
                                    buckets_path: "eventlabel._count"
                                }
                            }
                        }

                    }

                },

                size: 0

            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp,
                        message: "reponse not found!!!"
                    })
                } else {
                    return result(null, {
                        data: resp,
                        message: "Here is your finding result!!"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}

// get events Org Ip Addresses
ElasticModel.getAllOrgIpJson = (req, result) => {
    var query
    const {
        org_name,
        event_ip,
        eventName,
        startDate,
        endDate,
        json_doc_count,
        Jsonfrom
    } = req.body
    var allNodes = req.body.all_nodes
    var start_epoch = new Date(startDate);
    start_epoch = start_epoch.getTime();

    var end_epoch = new Date(endDate);
    end_epoch = end_epoch.getTime();
    try {
        client.search({
            index: index_name,
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                terms: {
                                    node_id: allNodes
                                }
                            },

                            {
                                match_phrase: {
                                    organization: {
                                        query: org_name
                                    }
                                }
                            },
                            {
                                match_phrase: {
                                    event_label: {
                                        query: eventName
                                    }
                                }
                            },
                            {
                                match_phrase: {
                                    ip_address: {
                                        query: event_ip
                                    }
                                }
                            },

                            {
                                range: {
                                    event_timestamp: {
                                        gte: start_epoch,
                                        lte: end_epoch,
                                        format: "epoch_millis"

                                    }
                                }
                            }
                        ]


                    }
                },
                from: Jsonfrom,
                size: json_doc_count <= 1000 ? json_doc_count : 1000

            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp,
                        message: "reponse not found!!!"
                    })
                } else {
                    return result(null, {
                        data: resp,
                        message: "Here is your finding result!!"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}


// get Unique Binary 
ElasticModel.getUniqueBinary = async (req, result) => {
    var query
    let {
        node_ids,
        end_date,
        start_date,
        binary_type
    } = req.body


    var start_epoch = new Date(start_date);
    start_epoch = start_epoch.getTime();

    var end_epoch = new Date(end_date);
    end_epoch = end_epoch.getTime();

    // let node = await getUserNodesAssigned(req);
    // if (node_ids != '0') {
    //     node = node_ids
    // }

    let node = node_ids.map((e) => {
        return e.item_text;
    });
    try {
        client.search({
            index: index_name,
            body: {
                query: {
                    bool: {
                      must: [
                        {
                                terms: {
                                    node_id: node
                                }
                            },
                        {
                          exists: {
                            field: "bin_id"
                          }
                        },
                        {
                          range: {
                            event_timestamp: {
                                gte: start_epoch,
                                lte: end_epoch,
                                format: "epoch_millis"
                            }
                          }
                        },
                        {
                          match_phrase: {
                            "event_label.keyword": "classified_malware"
                          }
                        }
                       
                      ]
                    }
                  },
                  size: 0,
                  aggs: {
                    unique_bins: {
                      terms: {
                        field: "bin_id",
                        size: 5000
                      },
                      aggs: {
                        top_bin_data: {
                          top_hits: {
                            size: 1
                          }
                        }
                      }
                    }
                  }
            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp,
                        message: "response not found!!!"
                    })
                } else {
                    let dataToSend = {
                        scanPorts: resp,
                        org_detail: resp
                    }
                    return result(null, {
                        data: dataToSend.scanPorts,
                        message: "Unique binaries"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}


ElasticModel.getUnclassifiedBinary = async (req, result) => {
    var query
    let {
        node_ids,
        end_date,
        start_date,
        binary_type,
        currentPage,  
        itemsPerPage,
    } = req.body

    if (itemsPerPage+currentPage>10000){
        itemsPerPage = 10000 - currentPage
    }

    var start_epoch = new Date(start_date);
    start_epoch = start_epoch.getTime();

    var end_epoch = new Date(end_date);
    end_epoch = end_epoch.getTime();

    // let node = await getUserNodesAssigned(req);
    // if (node_ids != '0') {
    //     node = node_ids
    // }

    let node = node_ids.map((e) => {
        return e.item_text;
    });
    try {
        client.search({
            index: index_name,
            body: {
                query: {
                    bool: {
                      must: [
                        {
                                terms: {
                                    node_id: node
                                }
                            },
                        {
                          exists: {
                            field: "bin_id"
                          }
                        },
                        {
                          range: {
                            event_timestamp: {
                                gte: start_epoch,
                                lte: end_epoch,
                                format: "epoch_millis"
                            }
                          }
                        },
                        {
                          match_phrase: {
                            "event_label.keyword": "unclassified_binary"
                          }
                        }
                       
                      ]
                    }
                  },
                  size: 0,
                  aggs: {
                    unique_bins: {
                      terms: {
                        field: "bin_id",
                        size: 5000
                      },
                      aggs: {
                        top_bin_data: {
                          top_hits: {
                            size: 1
                          }
                        }
                      }
                    }
                  }
            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp,
                        message: "response not found!!!"
                    })
                } else {
                    let dataToSend = {
                        scanPorts: resp,
                        org_detail: resp
                    }
                    return result(null, {
                        data: dataToSend.scanPorts,
                        message: "Unclassified binaries"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}


ElasticModel.binNodes = async (req, result) => {


    var start_epoch = new Date(req.body.start_date);
    start_epoch = start_epoch.getTime();

    var end_epoch = new Date(req.body.end_date);
    end_epoch = end_epoch.getTime();

    let node = req.body.node_ids.map((e) => {
        return e.item_text;
    });
    try {
        client.search({
            index: index_name,
            body: {

                query: {

                    bool: {
                        must: [
                            {
                                terms: {
                                    node_id: node
                                }
                            },
                            {
                                match: {
                                    bin_id: req.body.bin_id
                                }
                            },
                            {
                                range: {
                                    event_timestamp: {
                                        gte: start_epoch,
                                        lte: end_epoch,
                                        format: "epoch_millis"
                                    }
                                }
                            }]
                    }
                },
                aggs: {
                    NAME: {
                        terms: {
                            field: "node_id",
                            size: 500
                        },
                        aggs: {
                            NAME: {
                                terms: {
                                    field: "event_timestamp"
                                }
                            }
                        }
                    }
                },
                size: 0

            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp,
                        message: "response not found!!!"
                    })
                } else {
                    return result(null, {
                        data: resp,
                        message: "Bin Details"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}

// get events Org Ip Addresses
ElasticModel.getAllOrgIps = (req, result) => {
    var query
    const {
        org_name,
        eventName,
        startDate,
        endDate,
        ip_doc_count
    } = req.body
    var allNodes = req.body.all_nodes
    var start_epoch = new Date(startDate);
    start_epoch = start_epoch.getTime();

    var end_epoch = new Date(endDate);
    end_epoch = end_epoch.getTime();
    try {
        client.search({
            index: index_name,
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                terms: {
                                    node_id: allNodes
                                }
                            },

                            {
                                match_phrase: {
                                    organization: {
                                        query: org_name
                                    }
                                }
                            },
                            {
                                match_phrase: {
                                    event_label: {
                                        query: eventName
                                    }
                                }
                            },

                            {
                                range: {
                                    event_timestamp: {
                                        gte: start_epoch,
                                        lte: end_epoch,
                                        format: "epoch_millis"

                                    }
                                }
                            }
                        ]


                    }
                },


                aggs: {
                    ip_address: {
                        terms: {
                            field: "ip_address.keyword",
                            size: ip_doc_count
                        }


                    }

                },
                size: 0

            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp,
                        message: "reponse not found!!!"
                    })
                } else {
                    return result(null, {
                        data: resp,
                        message: "Here is your finding result!!"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
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


// All Resions
ElasticModel.regionGet = async (req, result) => {

    let node = await getUserNodesAssigned(req);
    try {
        client.search({
            index: index_name,
            body: {
                query: {
                    bool: {
                      filter: {
                        terms: {
                          node_id: node
                        }
                      }
                    }
                  },
                  size: 0,
                  aggs: {
                    org_name: {
                      terms: {
                        field: "organization_region.keyword",
                        size: 1000
                      }
                    }
                  }
                  
            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp,
                        message: "reponse not found!!!"
                    })
                } else {
                    return result(null, {
                        data: resp?.aggregations?.org_name?.buckets,
                        message: "Here is your finding result!!"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}

// Get all sector
ElasticModel.getAllSectors = async (req, result) => {
    let node = await getUserNodesAssigned(req);
    try {
        client.search({
            index: index_name,
            body: {
                query: {
                    bool: {
                      filter: {
                        terms: {
                          node_id: node
                        }
                      }
                    }
                  },
                  size: 0,
                  aggs: {
                    org_name: {
                      terms: {
                        field: "organization_sector.keyword",
                        size: 1000
                      }
                    }
                  }
            }
        })
            .then(resp => {
                if (!resp) {

                    return result(null, {
                        data: resp,
                        message: "reponse not found!!!"
                    })
                } else {
                    resp?.aggregations?.org_name?.buckets.map((e) => {
                        if (e.key == 'Manufacturing-Mining') {
                            e.key = "Industrial";
                            return e;
                        }
                    })
                    return result(null, { data: resp?.aggregations?.org_name?.buckets, message: "Here is your finding result!!" })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}

// Get All organization
ElasticModel.getAllOrganization = async (req, result) => {
    let node = await getUserNodesAssigned(req);
    try {
        client.search({
            index: index_name,
            body: {
                query: {
                    bool: {
                      filter: {
                        terms: {
                          node_id: node
                        }
                      }
                    }
                  },
                  size: 0,
                  aggs: {
                    org_name: {
                      terms: {
                        field: "organization.keyword",
                        size: 10000
                      }
                    }
                  }
            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp,
                        message: "reponse not found!!!"
                    })
                } else {
                    return result(null, {
                        data: resp.aggregations.org_name.buckets,
                        message: "Here is your finding result!!"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}


ElasticModel.searchOperation = (req, result) => {

    var current_start_epoch = new Date(req.body.minDate);
    current_start_epoch = current_start_epoch.getTime();



    var current_end_epoch = new Date(req.body.maxDate);
    current_end_epoch = current_end_epoch.getTime();

    var diff_epoch = current_end_epoch - current_start_epoch

    var previous_end_epoch = current_start_epoch

    var previous_start_epoch = previous_end_epoch - diff_epoch

    let region = req.body.region.map((x) => {
        return x.key
    });

    let sector = req.body.sector.map((x) => {
        return x.key
    });

    let organization = req.body.organization.map((x) => {
        if (x.item_text != null && x.item_text != undefined) {
            return x.item_text
        } else {
            return x.key
        }

    });
    try {

        client.search({
            index: index_name,
            body: {
                size: 0,
                query: {
                  bool: {
                    filter: [
                      {
                        terms: {
                          "organization.keyword": organization
                        }
                      }
                    ],
                    must_not: [
                      {
                        terms: {
                          "event_label.keyword": ["unclassified_binary", "classified_malware", "exploit", "repeated_attack","clean_binary"]
                        }
                      }
                    ]
                  }
                },
                aggs: {
                  previous_range: {
                    filter: {
                      range: {
                        event_timestamp: {
                          gte: previous_start_epoch,
                          lte: previous_end_epoch,
                          format: "epoch_millis"
                        }
                      }
                    },
                    aggs: {
                      event_name_previous: {
                        terms: {
                          field: "event_label.keyword",
                          size: 50
                        }
                      }
                    }
                  },
                  current_range: {
                    filter: {
                      range: {
                        event_timestamp: {
                          gte: current_start_epoch,
                          lte: current_end_epoch,
                          format: "epoch_millis"
                        }
                      }
                    },
                    aggs: {
                      event_name_current: {
                        terms: {
                          field: "event_label.keyword",
                          size: 50
                        }
                      }
                    }
                  }
                }
                
            }
        }).then(resp => {
            if (!resp) {
                return result(null, {
                    data: resp,
                    message: "response not found!!!"
                })
            } else {
                let dataToSend = {
                    scanPorts: resp.aggregations,
                    org_detail: resp.hits.hits
                }
                return result(null, {
                    data: dataToSend,
                    message: "Here is the response!!!"
                })
            }
        })
    } catch (error) {
        return result(error, null);
    }
}
// Get data via particular region
ElasticModel.regionPost = (req, result) => {
    try {
        client.search({
            index: index_name,
            body: {
                size: 0,
                aggs: {
                    org_name: {
                        terms: {
                            field: "organization_sector.keyword",
                            size: 10000
                        }
                    }
                }
            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp,
                        message: "reponse not found!!!"
                    })
                } else {
                    return result(null, {
                        data: resp,
                        message: "Here is your finding result!!"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}



ElasticModel.getCriteriaData = (req, result) => {
    var query
    const {
        eventType,
        eventTypeValue,
    } = req.body

    try {
        client.search({
            index: index_name,
            body: {
                query: {
                    multi_match: {
                        query: eventTypeValue,
                        fields: eventType
                    }
                },
                size: 0,
                aggs: {
                    event: {
                        terms: {
                            field: "event_label.keyword",
                            size: 100
                        }
                    }
                }
            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp,
                        message: "reponse not found!!!"
                    })
                } else {
                    return result(null, {
                        data: resp,
                        message: "Here is your finding result!!"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}

// get search by Criteria Data Json
ElasticModel.getCriteriaJson = (req, result) => {
    var query
    const {
        eventType,
        eventTypeValue,
    } = req.body.form
    var eventLabel = req.body.eventLabel

    try {
        client.search({
            index: index_name,
            body: {

                query: {
                    bool: {
                        must: {
                            multi_match: {
                                query: eventTypeValue,
                                fields: eventType
                            }
                        },
                        filter: {
                            'term': {
                                'event_label': eventLabel
                            }
                        }
                    }
                },
                size: 1000
            }
        })
            .then(resp => {
                if (!resp) {
                    return result(null, {
                        data: resp,
                        message: "reponse not found!!!"
                    })
                } else {
                    return result(null, {
                        data: resp,
                        message: "Here is your finding result!!"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}

// generate csv report
ElasticModel.generateCsvReport = async (req, res) => {
    const {
        organisation_type,
        organisation_value,
        start_date,
        end_date,
    } = req.body

    let node = await getUserNodesAssigned(req);
    var start_epoch = new Date(start_date);
    start_epoch = start_epoch.getTime();

    var end_epoch = new Date(end_date);
    end_epoch = end_epoch.getTime();

    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    const currentDate = new Date(end_epoch);
const newDate = new Date(currentDate.getTime() + oneDayInMilliseconds);
 end_epoch = newDate.getTime();

    try {
        client.search({
            index: "threat_intel_report",
            body: {
                size: 100,
                query: {
                    bool: {
                        must: [
                            {
                                multi_match: {
                                    query: organisation_value,
                                    fields: organisation_type.toLowerCase()
                                }
                            },
                            {
                                range: {
                                    start_date: {
                                        gte: start_epoch,
                                        lte: end_epoch,
                                        format: 'epoch_millis'
                                    }
                                }
                            },
                            {
                                range: {
                                    end_date: {
                                        gte: start_epoch,
                                        lte: end_epoch,
                                        format: 'epoch_millis'
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        })
            .then(resp => {
                if (!resp) {
                    return res(null, {
                        message: "reponse not found!!!"
                    })
                } else {
                    return res(null, {
                        data: resp,
                        message: "Here is your finding result!!"
                    })
                }
            })
    } catch (error) {
        return result(error, null);
    }
}

ElasticModel.getHybridReport = async (req, result) => {
    let md5 = req.query.md5;
    try {
      client
        .search({
          index: hybrid_Report,
          body: {
            query: {
              bool: {
                must: [
                  {
                    match_phrase: {
                      "md5.keyword": {
                        query: md5,
                      },
                    },
                  },
                ],
              },
            },
  
            _source: ["hybrid_report"],
          },
        })
        .then((resp) => {
          if (!resp) {
            return result(null, {
              data: resp,
              message: "Reponse not found!!!",
            });
          } else {
            return result(null, {
              data: resp.hits?.hits[0]?._source?.hybrid_report,
              message: "Here is your finding result!!",
            });
          }
        });
    } catch (error) {
      return result(error, null);
    }
  };

  // Adar label Model
ElasticModel.adarlabeldata = (req, result) => {
    //   const binId = 8127;
    //   const binId = 106879;
    const binId = req.body.bin_id;
  
    try {
      clientNSCS
        .search({
          index: index_name_adar,
          body: {
            query: {
              bool: {
                must: [
                  {
                    match_phrase: {
                      type: {
                        query: "binary_bb",
                      },
                    },
                  },
                  {
                    match_phrase: {
                      bin_id: {
                        query: binId,
                      },
                    },
                  },
                ],
              },
            },
            _source: ["bin_ADAR_labels"],
          },
        })
        .then((resp) => {
          if (!resp.hits.hits[0]?._source) {
            return result(null, {
              data: null,
            });
          }
          return result(null, {
            data: resp.hits.hits[0]?._source,
          });
        })
        .catch((err) => {
          console.log(err);
          return result(null, {
            msg: "Error not found",
            err,
          });
        });
    } catch (error) {
      return result(error, null);
    }
  };
module.exports = ElasticModel;