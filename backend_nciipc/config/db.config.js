const mysql = require('mysql');


const dbConn = mysql.createPool({
  connectionLimit : 5, //important
    host: process.env.DB_Host,
    user: process.env.DB_User,
     database: process.env.DB_Database,
     password: process.env.DB_Password,
     debug    :  false
});



module.exports = dbConn;

