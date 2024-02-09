var elasticsearch = require('elasticsearch')
const config = process.env;
const jwt = require("jsonwebtoken");
var client = new elasticsearch.Client({
  requestTimeout: 120000,
  host: process.env.ES_Address
});
const { sequelize, DataTypes } = require("../../config/sequelize");
const User = require("../models/user.model")(sequelize, DataTypes);
const Node_id = require("../models/node_id.model")(sequelize, DataTypes);
const NodeLocations = require("../models/nodelocations.model")(
  sequelize,
  DataTypes
);
let AttackModel = (data) => {
  create_at = new Date() | any;
  updated_at = new Date() | any;
}

var index_name = process.env.ES_Index
var stix_objects = process.env.stix_objects

Node_id.hasOne(User, {
  foreignKey: "user_id",
});
User.hasMany(Node_id, {
  foreignKey: "user_id",
});

NodeLocations.hasMany(User, {
  foreignKey: "user_id",
});
// common function for query
function elasticsearchQuery(region, sector, organization, minDate, maxDate, extraValue, aggregationsKey, returndata) {
  var start_epoch = new Date(minDate);
  start_epoch = start_epoch.getTime();

  var end_epoch = new Date(maxDate);
  end_epoch = end_epoch.getTime();

  region = region.map((x) => {
    return x.key
  });

  sector = sector.map((x) => {
    return x.key
  });

  organizationnew = organization.map((x) => {
    if (x.item_text != null && x.item_text != undefined) {
      return x.item_text
    } else {
      return x.key
    }
  });



 
  let query = {
    index: index_name,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            { terms: { "organization_region.keyword": region } },
            { terms: { "organization_sector.keyword": sector } },
            {
              terms: {
                "organization.keyword": organizationnew
              }
            },

            {
              match: extraValue
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
        Name: {
          terms: {
            field: aggregationsKey,
            size: 10
          }
        }
      }
    }
  }
  returndata(query)

}



AttackModel.getStix = (req, result) => {

  const {
    type,
    value
  } = req.body;
  let query = {
    index: stix_objects,
    body: {
      query: {
        bool: {
          must: [

            {
              exists: {
                field: "pattern.keyword"
              }
            },
            {
              match_phrase: {
                pattern: {
                  query: `${type}:value = '${value}'`
                }
              }
            }

          ]
        }
      }

    }
  }
  try {
    client.search(query)
      .then(resp => {
        if (!resp) {
          return result(null, {
            data: resp,
            message: "response not found!!!"
          })
        } else {

          return result(null, {
            data: resp.hits,
            message: "stix objects"
          })
        }
      });
  } catch (error) {
    return result(error, null);
  }

}

AttackModel.getSectorWiseAttack = async (req, result) => {
  var start_epoch = new Date(req.body.minDate);
  start_epoch = start_epoch.getTime();

  var end_epoch = new Date(req.body.maxDate);
  end_epoch = end_epoch.getTime();

  sectornew = await req.body.sector.map((e) => {
    return e.key
  })
  try {
    client.search({
      index: index_name,
      body: {
        query: {
          range: {
            event_timestamp: {
              gte: start_epoch,
              lte: end_epoch,
              format: "epoch_millis"
            }
          }
        },
        aggs: {
          sector_name: {
            terms: {
              field: "organization_sector.keyword",
              size: 10
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
          scanPorts: resp.aggregations.sector_name.buckets,
          org_detail: resp.hits.hits
        }
        return result(null, {
          data: resp.aggregations.sector_name.buckets,
          message: "Sector Wise Classification"
        })
      }
    })
  } catch (error) {
    return result(error, null);
  }
}

AttackModel.getOrgWiseAttack = async (req, result) => {
  var start_epoch = new Date(req.body.minDate);
  start_epoch = start_epoch.getTime();

  var end_epoch = new Date(req.body.maxDate);
  end_epoch = end_epoch.getTime();

  sectornew = await req.body.sector.map((e) => {
    return e.key
  })
  try {
    client.search({
      index: index_name,
      body: {
        query: {
          range: {
            event_timestamp: {
              gte: start_epoch,
              lte: end_epoch,
              format: "epoch_millis"
            }
          }
        },
        aggs: {
          sector_name: {
            terms: {
              field: "organization.keyword",
              size: 10
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
          scanPorts: resp.aggregations.sector_name.buckets,
          org_detail: resp.hits.hits
        }
        return result(null, {
          data: resp.aggregations.sector_name.buckets,
          message: "State Wise Classification"
        })
      }
    })
  } catch (error) {
    return result(error, null);
  }
}

AttackModel.getSnort = async (req, result) => {
  let node = await getUserNodesAssigned(req);

  const { start_date, end_date } = req.body;

  var start_epoch = new Date(start_date);
  start_epoch = start_epoch.getTime();

  var end_epoch = new Date(end_date);
  end_epoch = end_epoch.getTime();

  let query = {
    index: index_name,
    body: {
      size: 9000,
      query: {
        bool: {
          must: [
            {
              terms: {
                node_id: node,
              },
            },
            {
              match_phrase: {
                "event_label.keyword": {
                  query: "snort_alert",
                },
              },
            },

            {
              range: {
                event_timestamp: {
                  gte: start_epoch,
                  lte: end_epoch,
                  format: "epoch_millis",
                },
              },
            },
          ],
        },
      },
    },
  };
  try {
    client.search(query).then((resp) => {
      if (!resp) {
        return result(null, {
          data: resp,
          message: "response not found!!!",
        });
      } else {
        return result(null, {
          data: resp,
          message: "Snort Data",
        });
      }
    });
  } catch (error) {
    return result(error, null);
  }
};
// Top attacker IPs
AttackModel.getTopAttackerIPs = (req, result) => {
  var query
  const {
    region,
    sector,
    organization,
    minDate,
    maxDate
  } = req.body

  var aggKey = {
    "indicator_type.keyword": "ip"
  }
  elasticsearchQuery(region, sector, organization, minDate, maxDate, aggKey, "ip_address.keyword", (returndata) => {
    query = returndata
  })
  try {
    client.search(query)
      .then(resp => {
        if (!resp) {
          return result(null, {
            data: resp,
            message: "response not found!!!"
          })
        } else {
          let dataToSend = {
            scanPorts: resp.aggregations.Name.buckets,
            org_detail: resp.hits.hits
          }
          return result(null, {
            data: dataToSend.scanPorts,
            message: "Attacker IP's"
          })
        }
      })
  } catch (error) {
    return result(error, null);
  }
}

// Top attacker Country
AttackModel.getTopAttackerCountry = async (req, result) => {
  // var query
  var {
    region,
    sector,
    organization,
    minDate,
    maxDate
  } = req.body

  var start_epoch = new Date(minDate);
  start_epoch = start_epoch.getTime();

  var end_epoch = new Date(maxDate);
  end_epoch = end_epoch.getTime();

  region = region.map((x) => {
    return x.key
  });

  sector = sector.map((x) => {
    return x.key
  });

  organizationnew = organization.map((x) => {
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
              { terms: { "organization_region.keyword": region } },
              { terms: { "organization_sector.keyword": sector } },
              { terms: { "organization.keyword": organizationnew } },
              { match: { "indicator_type.keyword": "ip" } },
              {
                range: {
                  event_timestamp: {
                    gte: start_epoch,
                    lte: end_epoch,
                    format: "epoch_millis"
                  }
                }
              }
            ],
            must_not: [
              { match_phrase: { "ip2location_data.country_long.keyword": "-" } }
            ]
          }
        },
        aggs: {
          Name: {
            terms: {
              field: "ip2location_data.country_short.keyword",
              size: 10
            },
            aggs: {
              hits: {
                top_hits: {
                  _source: ["ip2location_data.country_long"],
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
            scanPorts: resp.aggregations.Name.buckets,
            org_detail: resp.hits.hits
          }
          return result(null, {
            data: dataToSend.scanPorts,
            message: "Source of Attack - Country"
          })
        }
      })
  } catch (error) {
    return result(error, null);
  }
}

// Top attacker Country
AttackModel.indiaIPsHash = (req, result) => {
  const {
    country_filter,
    end_date,
    start_date
  } = req.body

  var start_epoch = new Date(start_date);
  start_epoch = start_epoch.getTime();

  var end_epoch = new Date(end_date);
  end_epoch = end_epoch.getTime();
console.log(start_epoch, end_epoch);
  let query = {
    index: index_name,
    body: {
      size: "0",
      query: {
        bool: {
          must: [
            {
              match_phrase: {
                "ip2location_data.country_long": {
                  query: country_filter
                }
              }
            },
            {
              match: {
                indicator_type: "hash"
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
          ],
          must_not: [
            {
              match_phrase: {
                "event_data.remote_port": {
                  query: "0"
                }
              }
            }
          ]

        }
      },
      aggs: {
        ips: {
          terms: {
            field: "event_data.remote_ip.keyword",
            size: 9000

          },
          aggs: {
            top_result: {
              top_hits: {
                size: 1,
                _source: ["event_data.remote_port", "event_label", "ip2location_data.isp", "event_timestamp", "bin_vt_av_results", "bin_av_class", "bin_vt_av_labels"],
                sort: {
                  event_timestamp: "desc"
                }
              }
            }
          }

        }
      }
    }
  }

  try {
    client.search(query)
      .then(resp => {
        if (!resp) {
          return result(null, {
            data: resp,
            message: "response not found!!!"
          })
        } else {

          return result(null, {
            data: resp,
            message: country_filter + " Attacker"
          })
        }
      })
  } catch (error) {
    return result(error, null);
  }
}


AttackModel.getIndiaIps = (req, result) => {
  const {
    country_filter,
    end_date,
    start_date
  } = req.body

  var start_epoch = new Date(start_date);
  start_epoch = start_epoch.getTime();

  var end_epoch = new Date(end_date);
  end_epoch = end_epoch.getTime();

  let query = {
    index: index_name,
    body: {
      size: "0",
      query: {
        bool: {
          must: [
            {
              match_phrase: {
                "ip2location_data.country_long": {
                  query: country_filter
                }
              }
            },
            {
              match: {
                "indicator_type": "ip"
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
          ],
          must_not: [
            {
              match_phrase: {
                "event_data.remote_port": {
                  query: "0"
                }
              }
            }
          ]

        }
      },
      aggs: {
        ips: {
          terms: {
            field: "ip_address.keyword",
            size: 1000

          },
          aggs: {
            top_result: {
              top_hits: {
                size: 1,
                _source: ["event_data.remote_port", "event_label", "ip2location_data.isp", "event_timestamp"],
                sort: {
                  "event_timestamp": "desc"
                }
              }
            }
          }

        }
      }
    }
  }

  try {
    client.search(query)
      .then(resp => {
        if (!resp) {
          return result(null, {
            data: resp,
            message: "response not found!!!"
          })
        } else {

          return result(null, {
            data: resp,
            message: country_filter + " Attacker"
          })
        }
      })
  } catch (error) {
    return result(error, null);
  }
}



// Top Malware Family
AttackModel.getTopMalwareFamily = (req, result) => {
  var query
  const {
    region,
    sector,
    organization,
    minDate,
    maxDate
  } = req.body

  var aggKey = {
    "event_label.keyword": "classified_malware"
  }
  elasticsearchQuery(region, sector, organization, minDate, maxDate, aggKey, "bin_vt_av_results.keyword", (returndata) => {
    query = returndata
  })
  try {
    client.search(query)
      .then(resp => {
        if (!resp) {
          return result(null, {
            data: resp,
            message: "response not found!!!"
          })
        } else {
          let dataToSend = {
            scanPorts: resp.aggregations.Name.buckets,
            org_detail: resp.hits.hits
          }
          return result(null, {
            data: dataToSend.scanPorts,
            message: "Top Malware Types"
          })
        }
      })
  } catch (error) {
    return result(error, null);
  }
}

// Top getBinary 
AttackModel.getBinary = (req, result) => {

  const {
    minDate,
    maxDate
  } = req.body

  var start_epoch = new Date(minDate);
  start_epoch = start_epoch.getTime();

  var end_epoch = new Date(maxDate);
  end_epoch = end_epoch.getTime();


  let query = {
    index: index_name,
    body: {
      size: 0,
      query: {
        bool: {
          must: [
            {
              exists: {
                field: "bin_id"
              }
            },
            {
              range: {
                insertion_time: {
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
        NAME: {
          terms: {
            field: "bin_id",
            size: 10000,
            order: {
              _key: "asc"
            }
          },

          aggs: {
            hits: {
              top_hits: {
                _source: ["node_id", "event_timestamp"],
                size: 1
              }
            }
          }
        }
      }
    }
  }
  try {
    client.search(query)
      .then(resp => {
        if (!resp) {
          return result(null, {
            data: resp,
            message: "response not found!!!"
          })
        } else {

          return result(null, {
            data: resp.aggregations.NAME,
            message: "Top Malware Families"
          })
        }
      })
  } catch (error) {
    return result(error, null);
  }
}

AttackModel.getMapStateRecords = (req, result) => {
  let startDate = req.query.start_date;
  let endDate = req.query.end_date
  let query = {
    index: index_name,
    body: {
      query: {
        bool: {
          must: [
            {
              match_all: {}
            },
            {
              range: {
                event_timestamp: {
                  gte: startDate,
                  lte: endDate,
                  format: "epoch_millis"
                }
              }
            }
          ]
        }
      },
      sort: [
        { "organization_region.keyword": { "order": "desc" } }
      ],

      aggs: {
        event_label: {
          terms: {
            "field": "node_id",
            size: 1000
          },
          aggs: {
            org: {
              terms: {
                "field": "organization.keyword"
              },
              aggs: {
                time: {
                  terms: {
                    "field": "event_timestamp",
                    size: 1,
                    order: {
                      "_key": "desc"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  try {
    client.search(query).then(resp => {
      if (!resp) {
        return result(null, {
          data: resp,
          message: "response not found!!!"
        })
      } else {
        let dataToSend = {
          stateData: resp.aggregations.event_label.buckets,
          total_count: resp.hits.total
        }
        return result(null, {
          data: dataToSend.stateData,
          message: "Top Malware Families"
        })
      }
    });
  } catch (error) {
    return result(error, null);
  }
}


AttackModel.getAttackIps = async (req, res) => {
  let {
    region,
    sector,
    organization,
    minDate,
    maxDate
  } = req.body

  var start_epoch = new Date(minDate);
  start_epoch = start_epoch.getTime();

  var end_epoch = new Date(maxDate);
  end_epoch = end_epoch.getTime();

  region = await region.map((x) => {
    return x.key
  });

  sector = await sector.map((x) => {
    return x.key
  });

  organizationnew = await organization.map((x) => {
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
              { terms: { "organization_region.keyword": region } },
              { terms: { "organization_sector.keyword": sector } },
              { terms: { "organization.keyword": organizationnew } },
              { match: { indicator_type: "ip" } },
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
          ips: {
            terms: {
              field: "ip_address.keyword",
              size: 10
            },
            aggs: {
              hits: {
                top_hits: {
                  _source: ["ip2location_data.country_long"],
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
          return res(null, {
            message: "reponse not found!!!"
          })
        } else {
          let dataToSend = {
            scanPorts: resp.aggregations.ips.buckets,
            org_detail: resp.hits.hits
          }
          return res(null, {
            data: dataToSend.scanPorts,
            message: "Attacker IP's"
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

  let allNodes = await Node_id.findAll({
    attributes: [["node_id", "id"]],
    where: { user_id: user.dataValues.user_id },
  });
  if (allNodes[0].id == 0) {
    allNodes = await NodeLocations.findAll({ attributes: ["id"] });
  }
  let node = [];
  allNodes.forEach((val) => {
    node.push(val?.dataValues?.id);
  });

  return node;
}

AttackModel.getThreatScore = async (req, result) => {
  // let node = await getUserNodesAssigned(req);
  try {
    client
      .search({
        index: index_name,
        body: {
          size: 0,
          query: {
            bool: {
              must: [
                {
                  term: req.body.data,
                },
              ],
            },
          },
          aggs: {
            termAgg: {
              terms: {
                field: "event_label.keyword",
                size: 100,
              },
              aggs: {
                cardinalityAgg: {
                  cardinality: {
                    field: "organization.keyword",
                  },
                },
              },
            },
          },
        },
      })
      .then(async (resp) => {
        if (!resp) {
          return result(null, {
            data: resp,
            message: "reponse not found!!!",
          });
        } else {
          const indicator = await calculateSeverity(resp, req.body.data);
          // console.log("-----",indicator)
          return result(null, {
            data: indicator,
            message: "Here is your finding result!!",
          });
        }
      });
  } catch (error) {
    return result(error, null);
  }
};

async function calculateSeverity(resp, keyValue) {
  const terms = resp.aggregations.termAgg;
  const eventWeight = {
    connect: 0.3,
    scan: 0.5,
    bruteforce: 0.7,
    command_execution: 0.7,
    vulnerability_exploited: 0.7,
    binary_drop: 0.5,
    unclassified_binary: 0.0,
    classified_malware: 1,
    yara_static_match: 1,
    repeated_attack: 0.7,
    download_url: 0.3,
    exploit: 0.5,
    bind_port_attempt: 0.3,
    bind_port_shell_Command: 0.3,
    egg_download_ip: 0.7,
    infector_ip: 0.7,
    snort_alert: 0.7,
    cnc_ip: 1.0,
    attack_log: 0.3,
    url_redirection: 0.6,
  };
  const eventList = [];
  for (const bucket of terms.buckets) {
    // Get the event name
    const eventName = bucket.key;

    // Get the event count
    const eventCount = bucket.doc_count;

    // Get the cardinality of the organizations associated with the event
    const cardinality = bucket.cardinalityAgg.value;
    // console.log("cardinality",cardinality)
    // Calculate the event score
    const eventScore =
      (eventWeight[eventName] || 0) +
      (eventName === "cnc_ip" ? 0.5 : 0) +
      (eventName === "connect" && eventCount > 10000 ? 0.1 : 0) +
      (eventName === "connect" && cardinality > 1 ? 0.1 : 0) +
      (eventName === "scan" && eventCount > 100 ? 0.1 : 0) +
      (eventName === "scan" && cardinality > 1 ? 0.1 : 0) +
      (eventName === "binary_drop" && eventCount > 100 ? 0.1 : 0) +
      (eventName === "binary_drop" && cardinality > 1 ? 0.1 : 0) +
      (eventName === "download_url" && eventCount > 100 ? 0.1 : 0) +
      (eventName === "download_url" && cardinality > 1 ? 0.1 : 0) +
      (eventName === "classified_malware" && eventCount > 100 ? 0.1 : 0) +
      (eventName === "classified_malware" && cardinality > 1 ? 0.1 : 0);
    // Create a new event severity object
    const eventSeverity = {
      eventName,
      eventCount,
      eventScore,
    };

    // Add the event severity object to the list
    eventList.push(eventSeverity);
  }
  let totalScore = 0;
  let confidenceScore = 0;
  for (const eventSeverity of eventList) {
    totalScore += eventSeverity.eventScore;
    confidenceScore += eventSeverity.eventScore / eventSeverity.eventCount;
    // console.log("confidenceScore",confidenceScore)
  }

  // If there are more than 2 events, add a bonus to the confidence score
  if (eventList.length > 2) {
    confidenceScore += eventList.length * 0.13;
  }

  // Calculate the indicator severity label
  const indicatorSeverityLabel =
    confidenceScore >= 0.8
      ? "Very High"
      : confidenceScore >= 0.7
      ? "High"
      : confidenceScore >= 0.5
      ? "Medium"
      : confidenceScore >= 0.3
      ? "Low"
      : "Very Low";

  // Create the indicator object
  const indicator = {
    indicatorValue: keyValue[Object.keys(keyValue)[0]],
    confidenceScore,
    indicatorScore: confidenceScore.toFixed(2),
    indicatorEventList: eventList,
    indicatorSeverity: indicatorSeverityLabel,
  };
  console.log("indicator", indicator);
  return indicator;
}

module.exports = AttackModel;