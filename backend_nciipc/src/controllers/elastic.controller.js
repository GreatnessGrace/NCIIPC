const ElasticUserModel = require('../models/elastic.model');
const AttackUserModel = require("../models/attack.model");


async function getLoggedUser(req) {
    const token = req.headers.authorization;

    const decoded = jwt.verify(token, config.JWT_PASSWORD_KEY);

    const user = await User.findOne({ where: { username: decoded.data } });
    return user;
}
exports.getNodePcap = (req, res) => {
    ElasticUserModel.getNodePcap(req, (err, user) => {
      if (err) {
        return res.send(err);
      } else {
        return res.send(user);
      }
    });
  };

// get all data
exports.getAllData = (req, res) => {
    ElasticUserModel.getAllData((err, user) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(user)
        }
    })
}

// get org 
exports.getOrg = (req, res) => {
    ElasticUserModel.getOrg(req,(err, user) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(user)
        }
    })
}

// Find operation
exports.findOneAPI = (req, res) => {
    ElasticUserModel.findOneAPI(req, (err, user) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(user)
        }
    })
}

//All resion
exports.regionGet = (req, res) => {

    ElasticUserModel.regionGet(req, (err, user) => {
        if (err) {
            return res.send(err)
        } else {
            const x = user;

            return res.send(x);
        }
    })
}

// Get all sectors
exports.getAllSectors = (req, res) => {
    ElasticUserModel.getAllSectors(req, (err, user) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(user)
        }
    })
}
// Get all sectors
exports.eventsData = (req, res) => {

    ElasticUserModel.eventsData(req, (err, user) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(user)
        }
    })
}

// Get all threat Events
exports.threatEvents = (req, res) => {


    if (req.body.form.organization_type == "organization_sector.keyword") {
        ElasticUserModel.threatEvents(req, (err, user) => {
            if (err) {
                return res.send(err)
            } else {
                return res.send(user)
            }
        })
    } else if (req.body.form.organization_type == "organization_region.keyword") {
        ElasticUserModel.threatEventsRegion(req, (err, user) => {
            if (err) {
                return res.send(err)
            } else {
                return res.send(user)
            }
        })
    } else {
        ElasticUserModel.threatEventsOrgName(req, (err, user) => {
            if (err) {
                return res.send(err)
            } else {
                return res.send(user)
            }
        })
    }

}

// get All Organization
exports.getAllOrganization = (req, res) => {
    ElasticUserModel.getAllOrganization(req, (err, user) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(user)
        }
    })
}



// get search by criteria

exports.getCriteriaData = (req, res) => {
    ElasticUserModel.getCriteriaData(req, (err, user) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(user)
        }
    })
}

// get search by criteria json

exports.getCriteriaJson = (req, res) => {
    ElasticUserModel.getCriteriaJson(req, (err, user) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(user)
        }
    })
}

// get All Organization ip address
exports.getAllOrgIps = (req, res) => {
    ElasticUserModel.getAllOrgIps(req, (err, user) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(user)
        }
    })
}

// get All Organization ip address
exports.getAllOrgIpJson = (req, res) => {
    ElasticUserModel.getAllOrgIpJson(req, (err, user) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(user)
        }
    })
}

// POST API on the base of region, sector, organization
exports.searchOperation = (req, res) => {
    ElasticUserModel.searchOperation(req, (err, user) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(user)
        }
    })
}


exports.getUniqueBinary = (req, res) => {

    if (req.body.binary_type ==  'classified_malware'){

        ElasticUserModel.getUniqueBinary(req, (err, user) => {
            if (err) {
                return res.send(err)
            } else {
                return res.send(user)
            }
        })
    }
    else{
        ElasticUserModel.getUnclassifiedBinary(req, (err, user) => {
            if (err) {
                return res.send(err)
            } else {
                return res.send(user)
            }
        })
    }

}

// get Pcap file
exports.getBinaryPcap = (req, res) => {
    ElasticUserModel.getBinaryPcap(req, (err, user) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(user)
        }
    })
}

exports.downloadbinary = (req, res) => {
    ElasticUserModel.downloadbinary(req, (err, user) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(user)
        }
    })
}
// Get data via particular region
exports.regionPost = (req, res) => {
    ElasticUserModel.regionPost(req, (err, user) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(user)
        }
    })
}

exports.generateCsvReport = (req, res) => {
    ElasticUserModel.generateCsvReport(req, async (err, resp) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(resp)
        }

    })

}


exports.binNodes = (req, res) => {
    ElasticUserModel.binNodes(req, async (err, resp) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(resp)
        }

    })
}

exports.getHybridReport = (req, res) => {
    ElasticUserModel.getHybridReport(req, async (err, resp) => {
      if (err) {
        return res.send(err);
      } else {
        return res.send(resp);
      }
    });
  };

  exports.adarlabeldata = (req, res) => {
    ElasticUserModel.adarlabeldata(req, (err, user) => {
      if (err) {
        return res.send(err);
      } else {
        return res.send(user);
      }
    });
  };
  

  