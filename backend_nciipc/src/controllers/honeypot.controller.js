const honeypotModel = require("../models/honeypot.model");
const { validationResult } = require("express-validator");

exports.blueprintSubmit = (req, res) => {
  honeypotModel.blueprintSubmit(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.getHighNode = (req, res) => {
  honeypotModel.getHighNode((err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.snapCount = (req, res) => {
  honeypotModel.snapCount(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.profileCount = (req, res) => {
  honeypotModel.profileCount(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.timeGraph = (req, res) => {
  honeypotModel.timeGraph(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.vulnerabilityCount = (req, res) => {
  honeypotModel.vulnerabilityCount(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.getProfiles = (req, res) => {
  honeypotModel.getProfiles(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.getHoneypots = (req, res) => {
  honeypotModel.getHoneypots(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.getVulnerabilities = (req, res) => {
  honeypotModel.getVulnerabilities(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.totalVulnerabilities = (req, res) => {
  honeypotModel.totalVulnerabilities(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.protocolTable = (req, res) => {
  honeypotModel.protocolTable(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.imageTable = (req, res) => {
  honeypotModel.imageTable(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.deviceNameTable = (req, res) => {
  honeypotModel.deviceNameTable(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.deviceTable = (req, res) => {
  honeypotModel.deviceTable(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.protocolsChart = (req, res) => {
  honeypotModel.protocolsChart(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.profileImage = (req, res) => {
  honeypotModel.profileImage(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.doubleVulnerabilities = (req, res) => {
  honeypotModel.doubleVulnerabilities(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.protocols = (req, res) => {
  honeypotModel.protocols(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.devices = (req, res) => {
  honeypotModel.devices(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.pieDevices = (req, res) => {
  honeypotModel.pieDevices(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.doubleProfilesDevices = (req, res) => {
  honeypotModel.doubleProfilesDevices(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.doubleProtocols = (req, res) => {
  honeypotModel.doubleProtocols(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.doubleDeviceVulnerabilities = (req, res) => {
  honeypotModel.doubleDeviceVulnerabilities(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.configData = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var extractedErrors = errors.array({ onlyFirstError: true });
    return res.status(400).json({
      status: 400,
      data: null,
      message: extractedErrors[0].msg,
      error: true,
    });
  }

  honeypotModel.configData(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.getStates = (req, res) => {
  honeypotModel.getStates(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.getCities = (req, res) => {
  honeypotModel.getCities(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.addCity = (req, res) => {
  honeypotModel.addCity(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.imageCheck = (req, res) => {
  honeypotModel.imageCheck(req, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};
