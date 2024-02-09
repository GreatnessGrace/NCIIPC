const CronJob = require("node-cron");
const NodeModel = require('../models/nodeManagement.model');
const userModel = require('../models/users.model')


exports.initScheduledJobs = (dbConn) => {
  const scheduledJobFunction = CronJob.schedule("0 * * * *", () => {
      NodeModel.getDownNodes((err, data) => {
        if(err) {
            console.log('error =>>>>>', err)
        } else {
       
        }
      })

      NodeModel.getUpNodes((err, data) => {
        if(err) {
            console.log('error =>>>>>', err)
        } else {
       
        }
      })

      NodeModel.deleteNoti((err, data) => {
        if(err) {
            console.log('error =>>>>>', err)
        } else {
       
        }
      })

  });

  const scheduledTokenFunction = CronJob.schedule("*/20 * * * *", () => {
    userModel.removeToken((err, data) => {
      if(err) {
          console.log('error =>>>>>', err)
      } else {
     
      }
    })

 

});
  scheduledJobFunction.start();
  // scheduledTokenFunction.start();
}