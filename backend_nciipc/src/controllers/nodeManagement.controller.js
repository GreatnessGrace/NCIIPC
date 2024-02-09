// const NodeModel = require('../models/nodeManagement.model');

// // get honeypot details
// // exports.honeypotDetail = (req, res) => {
// //     NodeModel.honeypotDetail(req,(err, data) => {
// //         if (err) {
// //            return res.send(err)
// //         } else {
// //             return res.send(data)
// //         }
// //     })
// // }

// exports.getDownNodes = (req,res)=>{
//     NodeModel.getDownNodes((err,data)=>{
//         if (err) {
//             return res.send(err)
//          } else {
//              return res.send(data)
//          }
//     })
// }

// exports.deleteNoti = (req,res)=>{
//     NodeModel.deleteNoti((err,result)=>{
//         if (err) {
//             return res.send(err)
//          } else {
//              return res.send(result)
//          }
//     })
// }

// exports.honeypotConfig = (req, res) => {
//     NodeModel.honeypotConfig(req,(err, data) => {
//         if (err) {
//            return res.send(err)
//         } else {
//             return res.send(data)
//         }
//     })
// }

// exports.getHoneypotData = (req, res) => {
//     NodeModel.getHoneypotData(req,(err, data) => {
//         if (err) {
//            return res.send(err)
//         } else {
//             return res.send(data)
//         }
//     })
// }

// exports.hpProfileConfig = (req, res) => {
//     NodeModel.hpProfileConfig(req,(err, data) => {
//         if (err) {
//            return res.send(err)
//         } else {
//             return res.send(data)
//         }
//     })
// }

// exports.gethpProfile = (req, res) => {
//     NodeModel.gethpProfile(req,(err, data) => {
//         if (err) {
//            return res.send(err)
//         } else {
//             return res.send(data)
//         }
//     })
// }

// exports.getNodeConfig = (req, res) => {
//     NodeModel.getNodeConfig(req,(err, data) => {
//         if (err) {
//            return res.send(err)
//         } else {
//             return res.send(data)
//         }
//     })
// }

// exports.hp_image = (req, res) => {
//     NodeModel.hp_image(req,(err, data) => {
//         if (err) {
//            return res.send(err)
//         } else {
//             return res.send(data)
//         }
//     })
// }

// exports.hp_service = (req, res) => {
//     NodeModel.hp_service(req,(err, data) => {
//         if (err) {
//            return res.send(err)
//         } else {
//             return res.send(data)
//         }
//     })
// }

// exports.getNodeHealthConnection = (req, res) => {
//     NodeModel.getNodeHealthConnection(req,(err, data) => {
//         if (err) {
//            return res.send(err)
//         } else {
//             return res.send(data)
//         }
//     })
// }

// exports.saveHoneypotConfig = (req, res) => {
//     NodeModel.saveHoneypotConfig(req,(err, data) => {
//         if (err) {
//            return res.send(err)
//         } else {
//             return res.send(data)
//         }
//     })
// }

// exports.honeypotDeviceType = (req, res) => {
//     NodeModel.honeypotDeviceType(req, (err, data) => {
//       if (err) {
//         return res.send(err);
//       } else {
//         return res.send(data);
//       }
//     });
//   };

  
// exports.organizationFilterData = (req, res) => {
//     NodeModel.organizationFilterData(req, (err, data) => {
//       if (err) {
//         return res.send(err);
//       } else {
//         return res.send(data);
//       }
//     });
//   };
  
//   exports.regionFilterData = (req, res) => {
//     NodeModel.regionFilterData(req, (err, data) => {
//       if (err) {
//         return res.send(err);
//       } else {
//         return res.send(data);
//       }
//     });
//   };
  
//   exports.sectorFilterData = (req, res) => {
//     NodeModel.sectorFilterData(req, (err, data) => {
//       if (err) {
//         return res.send(err);
//       } else {
//         return res.send(data);
//       }
//     });
//   };
  

  
// exports.deployedHoneypotCategory = (req, res) => {
//     NodeModel.deployedHoneypotCategory(req, (err, data) => {
//       if (err) {
//         return res.send(err);
//       } else {
//         return res.send(data);
//       }
//     });
//   };
  
//   // exports.deployedHoneypotType = (req, res) => {
//   //   NodeModel.deployedHoneypotType(req, (err, data) => {
//   //     if (err) {
//   //       return res.send(err);
//   //     } else {
//   //       return res.send(data);
//   //     }
//   //   });
//   // };
  
//   exports.deployedHoneypotStatus = (req, res) => {
//     NodeModel.deployedHoneypotStatus(req, (err, data) => {
//       if (err) {
//         return res.send(err);
//       } else {
//         return res.send(data);
//       }
//     });
//   };
  
//   exports.deployedNodeStatus = (req, res) => {
//     NodeModel.deployedNodeStatus(req, (err, data) => {
//       if (err) {
//         return res.send(err);
//       } else {
//         return res.send(data);
//       }
//     });
//   };
  
//   exports.deployedNodeHardware = (req, res) => {
//     NodeModel.deployedNodeHardware(req, (err, data) => {
//       if (err) {
//         return res.send(err);
//       } else {
//         return res.send(data);
//       }
//     });
//   };
  
//   exports.deployedHoneypotType = (req, res) => {
//     NodeModel.deployedHoneypotType(req, (err, data) => {
//       if (err) {
//         return res.send(err);
//       } else {
//         return res.send(data);
//       }
//     });
//   };
  
//   exports.deployedNodeSectorWise = (req, res) => {
//     NodeModel.deployedNodeSectorWise(req, (err, data) => {
//       if (err) {
//         return res.send(err);
//       } else {
//         return res.send(data);
//       }
//     });
//   };
  
//   exports.deployedNodeRegionWise = (req, res) => {
//     NodeModel.deployedNodeRegionWise(req, (err, data) => {
//       if (err) {
//         return res.send(err);
//       } else {
//         return res.send(data);
//       }
//     });
//   };
  
//   exports.deployedHoneypotGraph = (req, res) => {
//     NodeModel.deployedHoneypotGraph(req, (err, data) => {
//       if (err) {
//         return res.send(err);
//       } else {
//         return res.send(data);
//       }
//     });
//   };
  
const NodeModel = require("../models/nodeManagement.model");
const path = require("path");
var fs = require("fs");

exports.pdfbinary = (req, res) => {
  NodeModel.pdfbinary(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      const pdfFilePath = path.join(__dirname, "../../" + data.file);
      const pdfFile = fs.createReadStream(pdfFilePath);

      res.setHeader("Content-Disposition", "attachment; filename=example.pdf");
      return pdfFile.pipe(res);
    }
  });
};

exports.sqlBinaries = (req, res) => {
  NodeModel.sqlBinaries(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.sqlAVdetails = (req, res) => {
  NodeModel.sqlAVdetails(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.sqlpdfbinary = (req, res) => {
  NodeModel.sqlpdfbinary(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      const pdfFilePath = path.join(__dirname, "../../" + data.file);
      const pdfFile = fs.createReadStream(pdfFilePath);

      res.setHeader("Content-Disposition", "attachment; filename=example.pdf");
      return pdfFile.pipe(res);
    }
  });
};

exports.getDownNodes = (req, res) => {
  NodeModel.getDownNodes((err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.deleteNoti = (req, res) => {
  NodeModel.deleteNoti((err, result) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(result);
    }
  });
};

// exports.honeypotConfig = (req, res) => {
//   NodeModel.honeypotConfig(req, (err, data) => {
//     if (err) {
//       return res.send(err);
//     } else {
//       return res.send(data);
//     }
//   });
// };

exports.getHoneypotData = (req, res) => {
  NodeModel.getHoneypotData(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

// exports.hpProfileConfig = (req, res) => {
//   NodeModel.hpProfileConfig(req, (err, data) => {
//     if (err) {
//       return res.send(err);
//     } else {
//       return res.send(data);
//     }
//   });
// };

exports.gethpProfile = (req, res) => {
  NodeModel.gethpProfile(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.getNodeConfig = (req, res) => {
  NodeModel.getNodeConfig(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.getImageName = (req, res) => {
  NodeModel.getImageName(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.deviceType = (req, res) => {
  NodeModel.deviceType(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.deviceName = (req, res) => {
  NodeModel.deviceName(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};


// HIHP

exports.getHoneypotDataHiHp = (req, res) => {
  NodeModel.getHoneypotDataHiHp(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};


exports.deviceTypeHiHp = (req, res) => {
  NodeModel.deviceTypeHiHp(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.deviceNameHiHp = (req, res) => {
  NodeModel.deviceNameHiHp(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.getNodeConfigHIHP = (req, res) => {
  NodeModel.getNodeConfigHIHP(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};


///////////////

// exports.hp_image = (req, res) => {
//   NodeModel.hp_image(req, (err, data) => {
//     if (err) {
//       return res.send(err);
//     } else {
//       return res.send(data);
//     }
//   });
// };

// exports.hp_service = (req, res) => {
//   NodeModel.hp_service(req, (err, data) => {
//     if (err) {
//       return res.send(err);
//     } else {
//       return res.send(data);
//     }
//   });
// };

exports.getNodeHealthConnection = (req, res) => {
  NodeModel.getNodeHealthConnection(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.getHoneypotHealthConnection = (req, res) => {
  NodeModel.getHoneypotHealthConnection(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.saveHoneypotConfig = (req, res) => {
  NodeModel.saveHoneypotConfig(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.saveHoneypotConfigHiHp = (req, res) => {
  NodeModel.saveHoneypotConfigHiHp(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

// Controller for getting data of node table where node_sensor_hp_type = "HIHP"

exports.nodeSensor = (req, res) => {
  NodeModel.nodeSensor(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};


// Node Dashboard(heat-map) Controller

exports.honeypotDeviceType = (req, res) => {
  NodeModel.honeypotDeviceType(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.deployedHoneypotCategory = (req, res) => {
  NodeModel.deployedHoneypotCategory(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

// exports.deployedHoneypotType = (req, res) => {
//   NodeModel.deployedHoneypotType(req, (err, data) => {
//     if (err) {
//       return res.send(err);
//     } else {
//       return res.send(data);
//     }
//   });
// };

exports.deployedHoneypotStatus = (req, res) => {
  NodeModel.deployedHoneypotStatus(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.deployedNodeStatus = (req, res) => {
  NodeModel.deployedNodeStatus(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.deployedNodeHardware = (req, res) => {
  NodeModel.deployedNodeHardware(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.deployedHoneypotType = (req, res) => {
  NodeModel.deployedHoneypotType(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.deployedNodeSectorWise = (req, res) => {
  NodeModel.deployedNodeSectorWise(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.deployedNodeRegionWise = (req, res) => {
  NodeModel.deployedNodeRegionWise(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.deployedHoneypotGraph = (req, res) => {
  NodeModel.deployedHoneypotGraph(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.organizationFilterData = (req, res) => {
  NodeModel.organizationFilterData(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.regionFilterData = (req, res) => {
  NodeModel.regionFilterData(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

exports.sectorFilterData = (req, res) => {
  NodeModel.sectorFilterData(req, (err, data) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(data);
    }
  });
};

// exports.deployedDeviceType = (req, res) => {
//   NodeModel.deployedDeviceType(req, (err, data) => {
//     if (err) {
//       return res.send(err);
//     } else {
//       return res.send(data);
//     }
//   });
// };
