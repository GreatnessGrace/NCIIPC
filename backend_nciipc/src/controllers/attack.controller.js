const AttackUserModel = require('../models/attack.model');
const { sequelize, DataTypes } = require('../../config/sequelize');
const NodeLocations = require('../models/nodelocations.model')(sequelize, DataTypes);
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const dotenv = require('dotenv');
const axios = require("axios");

// Malware indicator post
exports.getStix = async (req, res)   => {

   const {type,value} = req.body;
  
            var backendUrl = process.env.stixBaseUrl+type;
            var data_to_send = {};
            try {
                if(type == 'url'){
                     data_to_send = {url:value};
                } else if(type == 'hash'){
                     data_to_send = {hash:value};
                } else {
                     data_to_send = {ip:value}; 
                }
               
            let starttaskresp = await axios.post(backendUrl,data_to_send,{headers: { 'Content-Type':'application/json'}});
               return res.send({'data':starttaskresp.data});
            }catch(e) {
                return res.send({'data':'error'});
            }
	
}


// Malware sector wise post
exports.getSectorWiseAttack = (req, res) => {
    AttackUserModel.getSectorWiseAttack(req, (err, data) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(data)
        }
    })
}
exports.getOrgWiseAttack = (req, res) => {
    AttackUserModel.getOrgWiseAttack(req, (err, data) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(data)
        }
    })
}

exports.getSnort = (req, res) => {
    AttackUserModel.getSnort(req, (err, data) => {
      if (err) {
        return res.send(err);
      } else {
        return res.send(data);
      }
    });
  };
// LocalPort sector wise post
exports.sectorwiseLocalPort = (req, res) => {
    AttackUserModel.sectorwiseLocalPort(req, (err, data) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(data)
        }
    })
}


// getIndiaIps sector wise post
exports.getIndiaIps = (req, res) => {
    AttackUserModel.getIndiaIps(req, (err, data) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(data)
        }
    })
}

exports.indiaIPsHash = (req, res) => {
    AttackUserModel.indiaIPsHash(req, (err, data) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(data)
        }
    })
}


exports.getTopAttackerIPs = (req, res) => {
    AttackUserModel.getAttackIps(req, (err, data) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(data)
        }
    })
}

// Top attacker IPs
exports.getBinary = (req, res) => {
    AttackUserModel.getBinary(req, (err, data) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(data)
        }
    })
}

// Top attacker Country
exports.getTopAttackerCountry = (req, res) => {
    AttackUserModel.getTopAttackerCountry(req, (err, data) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(data)
        }
    })
}


// Top Malware Family
exports.getTopMalwareFamily = (req, res) => {
    AttackUserModel.getTopMalwareFamily(req, (err, data) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(data)
        }
    })
}


exports.getRecordsByStates = (req, res) => {
    AttackUserModel.getMapStateRecords(req, async (err, data) => {
        node_ids = await data.data.map(a => a.key);
        nodeIdsData = await NodeLocations.findAll({
            attributes: ['lat', 'lng', 'id'], where: {
                id: await node_ids
            }
        });
        let combinedData = data.data.map((mapData) => ({ ...mapData, ...nodeIdsData.find(t2 => t2.id === mapData.key) }))
        data.data = combinedData;
        if (err) {
            return res.send(err)
        } else {
            return res.send(data)
        }
    })
}

exports.getThreatScore = (req, res) => {
    AttackUserModel.getThreatScore(req, (err, user) => {
      if (err) {
        return res.send(err);
      } else {
        return res.send(user);
      }
    });
  };