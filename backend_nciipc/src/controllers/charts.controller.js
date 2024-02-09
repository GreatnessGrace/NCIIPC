const ChartsModel = require('../models/charts.model')
const { sequelize, DataTypes } = require('../../config/sequelize');
const NodeLocations = require('../models/nodelocations.model')(sequelize, DataTypes);
const fs = require('fs');

// Malware indicator post
exports.getSectorNodes = (req, res) => {
    ChartsModel.getSectorNodes(req, (err, data) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(data)
        }
    })
}

exports.getTopPorts = (req, res) => {
    ChartsModel.getTopPorts(req, (err, data) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(data)
        }
    })
}




exports.getTrendPorts = (req, res) => {
    ChartsModel.getTrendPorts(req, (err, data) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(data)
        }
    })
}







exports.getTopTrendAttack = (req, res) => {
    ChartsModel.getTopTrendAttack(req, (err, data) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send(data)
        }
    })
}

exports.getFile = (req, res) => {
    res.download(req.query.filePath);
}