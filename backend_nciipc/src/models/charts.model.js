var XMLHttpRequest = require('xhr2');
var elasticsearch = require('elasticsearch')
const config = process.env;
const { sequelize, DataTypes } = require('../../config/sequelize');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model')(sequelize, DataTypes);
const NodeLocations = require('../models/nodelocations.model')(sequelize, DataTypes);
const Node_id = require('../models/node_id.model')(sequelize, DataTypes);

var client = new elasticsearch.Client({
  requestTimeout: 120000,
  host: process.env.ES_Address
});

let ChartsModel = (user) => {
  create_at = new Date() | any;
  updated_at = new Date() | any;
}

var index_name = process.env.ES_Index
var urlIP = process.env.ES_Address;
var searchKey = "/indicator_events/_search/"

function elasticsearchQuery(field, returndata) {
  let query = {
    index: index_name,
    size: 0,
    body: {
      aggs: {
        sectors: {
          terms: {
            field: field
          },
          aggs: {
            nodes: {
              cardinality: { field: "node_id" }
            }
          }
        }

      },
      size: 0
    }
  }
  returndata(query)

}

ChartsModel.getSectorNodes = (req, result) => {
  elasticsearchQuery(req.body.field, (returndata) => {
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
          return result(null, {
            data: resp.aggregations.sectors.buckets,
            message: "success"
          })
        }
      });
  } catch (error) {
    return result(error, null);
  }
  finally {
    // closeClient(client);
  }
}


ChartsModel.getTopPorts = (req, result) => {
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

  // organization = organization.map((e)=>{
  //   return e.key
  // });
  organization = organization.map((x) => {
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
                bool: {
                  must_not: {
                    match_phrase: {
                      "event_data.local_port": "0"
                    }
                  }
                }
              }
            ]
          }
        },
        aggs: {
          Name: {
            terms: {
              field: "event_data.local_port.keyword",
              size: 10
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
            message: "Top Targeted Ports"
          })
        }
      })
  } catch (error) {
    return result(error, null);
  }
}







ChartsModel.getTrendPorts = (req, result) => {
  const {
    region,
    sector,
    organization,
    minDate,
    maxDate,
    dateFilter
  } = req.body

  let interval_gap = "1d"

  if (dateFilter == 1) {
    interval_gap = "1h"
  }
  var start_epoch = new Date(minDate);
  start_epoch = start_epoch.getTime();

  var end_epoch = new Date(maxDate);
  end_epoch = end_epoch.getTime();
  try {

    client.search({
      index: index_name,
      body: {
        size: 0,
        query: {
          bool: {
            must: [
              {
                terms: {
                  "organization_region.keyword": region
                }
              },
              {
                terms: {
                  "organization_sector.keyword": sector
                }
              },
              {
                terms: {
                  "organization.keyword": organization
                }
              },
              {
                range: {
                  event_timestamp: {
                    "gte": start_epoch,
                    "lte": end_epoch,
                    "format": "epoch_millis"
                  }
                }
              }
            ],
            must_not: [
              {
                match_phrase: {
                  "event_data.local_port": {
                    query: "0"
                  }
                }
              }
            ]
          }
        },
        aggs: {
          Name: {
            terms: {
              field: "event_data.local_port.keyword"
            },
            aggs: {
              time: {
                date_histogram: {
                  field: "event_timestamp",
                  format: "dd-MM-yyy",
                  interval: interval_gap,
                  time_zone: "+05:30"

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
            message: "Attack Trend on Ports",
            status: 1
          })
        }
      })
  } catch (error) {
    return result(error, null);
  }
}


function epoch(date) {
  return Date.parse(date)
}

ChartsModel.getTopTrendAttack = async (req, result) => {
  const {
    region,
    sector,
    organization,
    minDate,
    maxDate,
    dateFilter
  } = req.body

  let interval_gap = "1d"

  if (dateFilter == 1) {
    interval_gap = "1h"
  }

  var start_epoch = epoch(minDate);
  // start_epoch = start_epoch.getTime();

  var end_epoch = epoch(maxDate);
  // end_epoch = end_epoch.getTime();


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
              {
                terms: {
                  "organization.keyword": organizationnew
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
                bool: {
                  must_not: {
                    match_phrase: {
                      "event_data.local_port": "0"
                    }
                  }
                }
              }
            ]
          }
        },
        aggs: {
          Name: {
            terms: {
              field: "event_label.keyword"
            },
            aggs: {
              time: {
                date_histogram: {
                  field: "event_timestamp",
                  format: "dd-MM-yyyy",
                  interval: interval_gap,
                  time_zone: "+05:30"
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
            message: "Attack Trend"
          })
        }
      })
  } catch (error) {
    return result(error, null);
  }
}







module.exports = ChartsModel