const PermissionModel = require('../models/node_permission.model')

exports.getRegionList = (req, res) => {
    PermissionModel.getRegionList((err, data) => {
        if (err) {
            res.send(err)
        } else {
            res.send(data)
        }
    })
}

exports.getRegionbyNode = (req, res) => {
    PermissionModel.getRegionbyNode(req, (err, data) => {
        if (err) {
            res.send(err)
        } else {
            res.send(data)
        }
    })
}

exports.getSector = (req, res) => {
    PermissionModel.getSector(req, (err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    })
}

exports.getOrganization = (req, res) => {
    PermissionModel.getOrganization(req, (err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    })
}

exports.getNodeId = (req, res) => {
    PermissionModel.getNodeId(req, (err, data) => {
        if (err) {
            res.send(err)
        } else {
            res.send(data);
        }
    })
}

exports.getNodeAllId = (req, res) => {
    PermissionModel.getNodeAllId(req, (err, data) => {
        if (err) {
            res.send(err)
        } else {
            res.send(data);
        }
    })
}

exports.nodePermission = (req, res) =>{
    PermissionModel.nodePermission(req, async (err, data)=>{
        if(err){
           return res.send(err)
        }else{
            return res.send( {msg:"permission granted successfully"});
        }
    })
}

exports.delteHoneypot = (req, res) =>{
    PermissionModel.delteHoneypot(req, async (err, data)=>{
        if(err){
           return res.send(err)
        }else{
            return res.send( {msg:"permission granted successfully"});
        }
    })
}