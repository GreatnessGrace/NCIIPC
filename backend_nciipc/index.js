const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const app = express();
const https = require("https");
// const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
// const session = require('express-session');
// const Sequelize = require('sequelize');
const config = process.env;
const fs = require('fs');
const { constants } = require('crypto')
// create express app
const helmet = require('helmet');
// const frameguard = require("frameguard");
// app.use(helmet());
app.use(helmet.frameguard({ action: "SAMEORIGIN" }));
// Set up Global configuration access
dotenv.config();



// setup the server port
const port = process.env.PORT || 5000;
// parser request data content type application


app.use(bodyParser.urlencoded({
    extended: true
  }));
 
  app.disable('etag');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'max-age=3600; public');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('ETag','');
    next();
  });


// parser request data content type application/json
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World');
    return;
});
app.set('env', 'production');
app.use(cors({
  origin: ["http://localhost:4200", "https://192.168.100.53","https://192.168.100.109","https://192.168.100.102", "https://192.168.8.160"]
}));


// const activehpRouter = require('./src/routes/activehp.route')
const userElasticRouter = require('./src/routes/elastic.route.js')
const userRouter = require('./src/routes/users.route.js');
const { send } = require('process');
const NodeModel = require('./src/routes/nodeManagement.route.js');
const honeypotRouter = require("./src/routes/honeypot.route");

const NodePermission = require('./src/routes/node_permission.route.js');
// create users routes
app.use('/api/v1/users', userRouter)

app.use('/', userElasticRouter);

app.use('/', NodeModel)

app.use("/honeypot", honeypotRouter);

// app.use('/activehp/',activehpRouter)

app.use('/permission', NodePermission);

app.get('*', function(req, res){
    res.status(404).send('Page Not Found');
  });
  
const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
    ciphers: "ECDHE-RSA-AES256-GCM-SHA384:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA:HIGH:!AES128"
};

// const options = {
//   key: fs.readFileSync("/etc/ssl/192.168.100.53-key.pem"),
//   cert: fs.readFileSync("/etc/ssl/192.168.100.53-cert.pem"),
//   ciphers: "ECDHE-RSA-AES256-GCM-SHA384:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA:HIGH:!AES128"
// };
const scheduledFunctions = require('./src/schedulers/node-cron');
scheduledFunctions.initScheduledJobs();

// listen to the port
//comment below at time of production
app.listen(port, () => {
   secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1
});

// uncomment below at production
//  https.createServer(options, app).listen(port, () => {
//      secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1
//  });



app.timeout = 20000;