var dbConn = require('../../config/db.config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const nodemailer = require('nodemailer');
const os = require('os');
const config = process.env;
const {sequelize,DataTypes} = require('../../config/sequelize');
const User = require('../models/user.model')(sequelize, DataTypes);
const Node_id = require('../models/node_id.model')(sequelize, DataTypes);
const NodeLocations = require('../models/nodelocations.model')(sequelize, DataTypes);
const CryptoJS = require("crypto-js");
const axios = require('axios');
const encryptionKey = "k7qliZ4fW4zrsm@PrEapGVDuTM6J5mZYg";


let Users = (user) => {
    this.name = user.name;
    this.email = user.email;
    this.user_id = user.user_id;
    this.username = user.username;
    this.password = bcrypt.hash(user.password, 10);
    this.role = user.role;
    create_at = new Date() | any;
    updated_at = new Date() | any;
}

NodeLocations.hasMany(User, {
    foreignKey: 'user_id'
});

Node_id.hasOne(User, {
    foreignKey: 'user_id'
});

async function getLoggedUser(req){
    const token = req.headers.authorization;

    const decoded = jwt.verify(token, config.JWT_PASSWORD_KEY);
    
    const user = await User.findOne({ where: { username: decoded.data } });
    return user;
}



// get all users
Users.getAllUsers = (result) => {
    try{
        dbConn.query('SELECT * FROM users', (err, res) => {
            result(null, res);
        })
    } catch(err){
        return result(null, err);
    }
}

// get all countries
Users.allcountries = (result) => {
    try{
        dbConn.query('SELECT * FROM countries', (err, res) => {
            result(null, res);
        })
    } catch(err){
        return result(null, err);
    }
}

// get User by ID
Users.getUserListByID = (id, result) => {
    try{
        dbConn.query('SELECT * FROM users WHERE user_id=?', id, (err, res) => {
            result(null, res);
        })
    } catch(err){
        return result(null, err);
    }
}


// create user account

Users.createUser = async (req, result) => {
   
        
    let getCapstatus = await fetchcapchaStatus(req.body.capcha_token,req.body.ip);
    if(getCapstatus.data.success != true){
        return  result({
            message: 'Capcha verification failed! Please try again.'
        })
    }
    
    var user_id = 0;
    try {
        let {
            name,
            email,
            password,
            cpassword,
            role,
            user_status,
            username
        } = req.body

        password = CryptoJS.AES.decrypt(password, 'k7qliZ4fW4zrsm@PrEapGVDuTM6J5mZYg').toString(CryptoJS.enc.Utf8);
        cpassword = CryptoJS.AES.decrypt(cpassword, 'k7qliZ4fW4zrsm@PrEapGVDuTM6J5mZYg').toString(CryptoJS.enc.Utf8);
        if (cpassword != password){
            return result(null, {
                status: 0,
                message: 'Password Doesn\'t match Confirm Password'
            })
        }
    
        let reg = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
     
        if(!reg.test(password)){
            return result(null, {
                status: 0,
                message: 'Invalid Password Pattern '
            })
        }

        if (!email || !password || !name) {
            return res.status(400).json({
                status: 0,
                message: 'Invalid request!'
            })
        }


        const hashedPassword = await bcrypt.hash(password, 10);
        password = hashedPassword;
        // let sql = 'Select * from users'
        let sql = 'INSERT INTO users SET ?'
        let post = {
            name,
            email,
            password,
            username,
            token: "I am not having token",
            role,
            user_status: user_status || "inactive"
        }

        await dbConn.query(sql, post, async (err, dbresult) => {
            var user_id = await dbresult?.insertId;

            if (err) {
                result(null, {
                    status: 0,
                    message: "some error",

                })
            }
            if (dbresult) {
                post.id = dbresult?.insertId;

                // assign node to user

                node_Sql = "INSERT INTO node_ids SET ? "
                // let user_id: post.id;
                node_post = {
                    user_id: post.id,
                    node_id: req.body.node || 0,
                    permission: 'yes'
                }
                if (req.body.node) {
                    req.body.node.map(ele => {
                        dbConn.query(`insert into node_ids (user_id, node_id, permission) value(${dbresult?.insertId},${ele.id},'yes')`, (err, dbres) => {
                            if (err) {
                                return result(null, {
                                    status: 0,
                                    message: "Something went wrong"
                                })

                            } else {

                                return result(null, {
                                    status: 1,
                                    user_id: user_id,
                                    message: "User Added Successfully"

                                })
                            }
                        })
                    });
                } else {
                    return result(null, {
                        status: 1,
                        user_id: user_id,
                        message: "User Added Successfully"
                    })
                }
            }


        })


    } catch (error) {
        return result(null, error);
    }

}


Users.addUser = async (req, result) => {
    
    console.log("------------------",req.body)
    try {
        let {
            name,
            email,
            password,
            role,
            user_status,
            username,
            cpassword
        } = req.body


        if (!email || !password || !name) {
            return result({
                status: 0,
                message: 'Invalid request'
            },null)
        }

        password = CryptoJS.AES.decrypt(password, 'k7qliZ4fW4zrsm@PrEapGVDuTM6J5mZYg').toString(CryptoJS.enc.Utf8);
        cpassword = CryptoJS.AES.decrypt(cpassword, 'k7qliZ4fW4zrsm@PrEapGVDuTM6J5mZYg').toString(CryptoJS.enc.Utf8);

        if (cpassword != password){
            return result({
                status: 0,
                message: 'Password Doesn\'t match Confirm Password'
            },null)
           
        }
    
        let reg = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
        let namereg = new RegExp("^[a-zA-Z0-9 ]+$")
        let emailReg = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")

        if(!reg.test(password)){
            return result({
                status: 0,
                message: 'Invalid Password Pattern'
            },null)
        }

    if(!namereg.test(name) || !namereg.test(username)){
        return result({
            status: 0,
            message: 'Invalid Name or Username Pattern'
        },null)
    }

    if(!emailReg.test(email)){
        return result({
            status: 0,
            message: 'Invalid Email Pattern'
        },null)
    }

        const hashedPassword = await bcrypt.hash(password, 10);
        password = hashedPassword;

        let sql = 'INSERT INTO users SET ?'
        let post = {
            name,
            email,
            password,
            username,
            token: "I am not having token",
            role,
            user_status: user_status 
        }

        await dbConn.query(sql, post, async (err, dbresult) => {
            var user_id = await dbresult?.insertId;

            if (err) {
                result(null, {
                    message: "some error",

                })
            }
            if (dbresult) {
                post.id = dbresult?.insertId;

                // assign node to user

                node_Sql = "INSERT INTO node_ids SET ? "
                // let user_id: post.id;
                node_post = {
                    user_id: post.id,
                    node_id: req.body.node || 0,
                    permission: 'yes'
                }
                if (req.body.node) {
                    try {
                        for (const ele of req.body.node) {
                            await new Promise((resolve, reject) => {
                                dbConn.query(`INSERT INTO node_ids (user_id, node_id, permission) VALUES (${dbresult?.insertId},${ele.id},'yes')`, (err, dbres) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(dbres);
                                    }
                                });
                            });
                        }
                
                        return result(null, {
                            status: 1,
                            user_id: user_id,
                            message: "User Added Successfully"
                        });
                    } catch (error) {
                        console.error("Error inserting nodes:", error);
                    }
                } else {
                    return result(null, {
                        status:1,
                        user_id: user_id,
                        message: "User Added Successfully"
                    })
                }
            }


        })


    } catch (error) {
        // console.log(error);
        return result(null, error);
    }

}

// verify capcha on server start

// https://www.google.com/recaptcha/api/siteverify?secret=your_secret&response=response_string&remoteip=user_ip_address

   async function fetchcapchaStatus(capcha_res,user_ip){

        return new Promise((resolve, reject) => {
            setTimeout(async () => {
               
                try {
          
                    axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.Capcha_Secret}&response=${capcha_res}&remoteip=${user_ip}`)
                    .then(function (response) {
                      resolve(response);
                    })
                    .catch(function (error) {
                      reject(error);
                    })
                  } catch (error) {
                    reject(error.response.body)
                    console.log(error.response.body);
                  }
                  
            }, 1);
        });


     
    }
// verify capcha on server end


// login user

Users.loginUser = async (req, result) => {

    // let getCapstatus = await fetchcapchaStatus(req.body.capcha_token,req.body.ip);
        // if(getCapstatus.data.success != true){
        //     return  result({
        //         message: 'Capcha verification failed! Please try again.'
        //     })
        // }
    date = new Date()
    hotDetails = os.networkInterfaces()
    // console.log('hotDetails',hotDetails);
    try {
        let {
            username,
            password
        } = req.body
        if (!username || !password) {
            res.status(400).json({
                details: 'Invalid request!'
            })
        }

        // check number of login attempts
        // let dateToday = new Date().toLocaleString(undefined, {timeZone: 'Asia/Kolkata'});
        var date = new Date();
                var dateToday =
                    date.getFullYear() + "-" +
                    ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
                    ("00" + date.getDate()).slice(-2) + " " +
                    ("00" + date.getHours()).slice(-2) + ":" +
                    ("00" + date.getMinutes()).slice(-2) + ":" +
                    ("00" + date.getSeconds()).slice(-2);

                    // console.log('dateToday',dateToday);

         dbConn.query(`SELECT count(*) AS count
         FROM failed_logins
         WHERE username = '${username}'
         AND failed_at > NOW() - INTERVAL 1 HOUR`,async (err, res) => {
          
        if(res && res[0] && res[0].count >= 3){
          
            return result(null, {
                message: 'Account Blocked for 1 hr due to multiple Invalid attemps. Please try after an Hour!'
            })
        }
       

        });

        // check number of login attempts



        // password = Buffer.from(password, 'base64').toString('binary');
        password = CryptoJS.AES.decrypt(password, 'k7qliZ4fW4zrsm@PrEapGVDuTM6J5mZYg').toString(CryptoJS.enc.Utf8);


        dbConn.query(`SELECT * FROM users WHERE username = ? ''`, [username], async (err, res) => {
            if (err) {

                return result(null, {
                    message: "fail to execute Database"
                })
            } else {

                if (res.length > 0) {
                    const varify = await bcrypt.compareSync(password, res[0].password);
                    if (varify) {

                        let arrlen = req.ip?.split(':').length
                        let ipAddress = req.ip.split(':')[arrlen - 1]

                        sessionDetails = {
                            ip_address: req.body.ip,
                            // mac_address: hotDetails?.en6[1]?.mac,
                            login_time: date,
                            user_id: res[0].user_id
                        }

                        let sql = 'INSERT INTO user_session SET ?'
                        dbConn.query(sql, sessionDetails)
                        // let accessToken
                        const accessToken = jwt.sign({
                            data: res[0].username,
                            role: res[0].role
                        },
                            process.env.JWT_PASSWORD_KEY, {
                            expiresIn: "10D"
                        }
                        );
                        if (res[0].token) {
                            let body = res[0]
                            let date_ob = new Date();
                            let date = ("0" + date_ob.getDate()).slice(-2);
                            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                            let year = date_ob.getFullYear();
                            let generate_date = year + "-" + month + "-" + date + " " + date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds();
                            console.log("generate_date",generate_date)
                            dbConn.query(
                              `UPDATE users SET token = '${accessToken}', updated_at='${generate_date}' WHERE user_id = '${res[0].user_id}'`,
                              (err, res) => {
                                if (err) {
                                  return result(null, {
                                    message: "token doesn't match",
                                  });
                                } else {
                                    if ((body.user_status == null) || (body.user_status == '')) {
                                        return result(null, {
                                            message: "Wait for admin approval"
                                        })
                                    } else if (body.user_status == "inactive") {
                                        return result(null, {
                                            message: "Your account suspended!!/Waiting for approval"
                                        })
                                    } else if (body.user_status == "active") {

                                        return result(null, {

                                            message: "Logged Successfully!!",
                                            accessToken: accessToken,
                                            user: body
                                        })
                                    }
                                }
                            })
                        } else {
                            return result(null, {
                                message: "user not authrize"
                            })
                        }
                    } else {
                        
                        let ipAddress = req.ip;
                        dbConn.query(`INSERT INTO failed_logins (username, ip_address, failed_at)
                         VALUES ('${username}', '${ipAddress}', '${dateToday}')`,async (err, res) => {
                          
                            return result(null, {
                                message: "Invalid Username or Password!!!. Your account will be blocked for 1 hr after 3 unsuccessfull attempts."
                            })
                        })
                            
                    }
                       
                    

                } else {
                    return result(null, {
                        message: "Invalid user!!",
                    })
                }
            }
        })
    } catch (error) {
        console.log("error==111111111111111111=>>>", error)
        return result(null, error);
    }
}



async function saveFailedAttempt(username){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let dateToday = new Date();
            dbConn.query(`INSERT INTO failed_logins (username, ip_address, failed_at)
            VALUES (${username}, '192.168.1.1', ${dateToday})`,async (err, res) => {
                resolve(res)
            })
        
        }, 300);
    });

   
}

// Forgot password
Users.forgotPassword = async(req, result) => {
    let getCapstatus = await fetchcapchaStatus(req.body.capcha_token,req.body.ip);
        if(getCapstatus.data.success != true){
            return  result({
                message: 'Capcha verification failed! Please try again.'
            })
        }

    const {
        email,
        urlPass
    } = req.body

    let reg = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")
     
    if(!reg.test(email)){
        return result(null, {
            status: 0,
            message: 'Invalid Email Pattern '
        })
    }

    if (!email) {
        return result(null, {
            status: 0,
            message: "Please enter email field must not be blank"
        })
    } else {
        try{
            dbConn.query(`SELECT * FROM users WHERE email = ? ''`, [email], async (err, res) => {

                if (err) {
                    console.log("what is error===>>>", err);
                    return result(null, {
                        status: 0,
                        message: "fail to execute Database"
                    })
                } else {
                    if (res.length > 0) {
                        let {
                            email,
                            username,
                            password,
                            user_id
                        } = res[0]
                        let otpCode = Math.floor((Math.random() * 10000) + 1)

                        dbConn.query(`UPDATE users SET otp = ${otpCode} WHERE user_id = ${user_id}`)
                        // sent to npm i nodemailer
                        var transport = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: "ctms.cdac.mohali@gmail.com",
                                pass: "yjjdlumohfydltky"
                            }
                        });
                        
                        // let encId = await encrypt(user_id);
                        var mailOptions = {
                            from: "ctms.cdac.mohali@gmail.com",
                            to: email,
                            subject: "OTP to reset Your Password",
                            text: `Dear ${username},\n\nTo reset your password please open this link: ${urlPass}/${user_id} .\nYour otp is: ${otpCode}.\n\nThanks and Regards,\nCTMS Team `,
                        }
                        transport.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                //  res.send("Email could not sent due to error: "+error);
                                console.log('Error', error);
                            } else {
                                res.send("Email has been sent successfully");

                            }
                        });
                        setTimeout(otpDestroy, 360000, user_id)

                        return result(null, {
                            status: 0,
                            details: 'OTP sent to your mail'
                        })
                    } else {
                        return result(null, {
                            status: 0,
                            message: "This email doesn't exists!!",
                        })
                    }
                }
            })
        } catch(err){
            return result(null, err);
        }
    }
}

function otpDestroy(user_id) {
    dbConn.query(`UPDATE users SET otp = NULL WHERE user_id = '${user_id}'`)
}

// Recover password
Users.recoverPassword = async(req, result) => {
    let getCapstatus = await fetchcapchaStatus(req.body.capcha_token,req.body.ip);
    if(getCapstatus.data.success != true){
        return  result({
            status: 0,
            message: 'Capcha verification failed! Please try again.'
        })
    }

    let {
        id,
        newPwd,
        confirmPwd,
        otp
    } = req.body;

    newPwd = CryptoJS.AES.decrypt(newPwd, 'k7qliZ4fW4zrsm@PrEapGVDuTM6J5mZYg').toString(CryptoJS.enc.Utf8);
    confirmPwd = CryptoJS.AES.decrypt(confirmPwd, 'k7qliZ4fW4zrsm@PrEapGVDuTM6J5mZYg').toString(CryptoJS.enc.Utf8);
    if (newPwd != confirmPwd){
        return result(null, {
            status: 0,
            message: 'New Password Doesn\'t match Confirm Password'
        })
    }

    let reg = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
     
    if(!reg.test(newPwd)){
        return result(null, {
            status: 0,
            message: 'Invalid Password Pattern '
        })
    }


    try{
        dbConn.query(`SELECT * FROM users WHERE otp = ? ''`, [otp], async (err, res) => {
            
                if (res.length > 0) {
                    if ((res[0].user_id == id) && (res[0].otp == otp)) {
                        let encryptPassword = await bcrypt.hash(newPwd, 10);
                        try{
                            dbConn.query(`UPDATE users SET password = '${encryptPassword}' WHERE user_id = '${id}'`, function (err, res) {
                                dbConn.query(`UPDATE users SET otp = NULL WHERE user_id = '${id}'`)
                                return result(null, {
                                    status:1,
                                    message: `password reset successfully!!!`
                                })
                            });
                        } catch(err){
                            return result(null, err);
                        }

                    } else {
                        return result(null, {
                            status: 0,
                            message: "OTP doesn't match"
                        })
                    }
                } else {
                    return result(null, {
                        status: 0,
                        message: "Something went wrong!!!"
                    })
                }
        })
    } catch(err){
        return result(null, err);
    }
}


// change password
Users.changePassword = async (req, result) => {

    var { oldpass, password,cpassword } = req.body;
    password = CryptoJS.AES.decrypt(password, 'k7qliZ4fW4zrsm@PrEapGVDuTM6J5mZYg').toString(CryptoJS.enc.Utf8);
    cpassword = CryptoJS.AES.decrypt(cpassword, 'k7qliZ4fW4zrsm@PrEapGVDuTM6J5mZYg').toString(CryptoJS.enc.Utf8);
    oldpass = CryptoJS.AES.decrypt(oldpass, 'k7qliZ4fW4zrsm@PrEapGVDuTM6J5mZYg').toString(CryptoJS.enc.Utf8);


    if (cpassword != password){
        return result(null, {
            status: 0,
            message: 'Password Doesn\'t match Confirm Password'
        })
    }

    let reg = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
 
    if(!reg.test(password)){
        return result(null, {
            status: 0,
            message: 'Invalid Password Pattern '
        })
    }
    let encryptPassword = await bcrypt.hash(password, 10);

  
    const token =
        req.headers.authorization || req.headers.token || req.query.authorization || req.headers["x-access-token"];

    const decoded = jwt.verify(token, config.JWT_PASSWORD_KEY);

    try{
        dbConn.query(`select * from users where username = '${decoded.data}'`, async (err, res) => {

                // validate old password
                const isValidPassword = await bcrypt.compare(oldpass, res[0].password);


                if (!isValidPassword) {
                    return result(null, {
                        status: 0,
                        message: 'Please enter correct Current password'
                    })
                }

                let id = res[0].user_id;
                
    
            dbConn.query(`UPDATE users SET password = '${encryptPassword}' WHERE user_id = '${id}'`, function (err, res) {

                });

                return result(null, {
                    status: 1,
                    message: 'Password updated Successfully'
                })


        })
    } catch(err){
        return result(null, err);
    }
};


Users.logOut = async (req, result) => {
   var date = new Date();
    const token = req.headers.authorization || req.headers.token || req.query.authorization || req.headers["x-access-token"];
        var loggedUser = await getLoggedUser(req);
    if (token) {
        try{
            dbConn.query(`UPDATE users SET token = 'I am not having token' WHERE token = '${token}'`, async function (err, res) {
                    
                await dbConn.query(`UPDATE user_session SET logout_time = '${date}' WHERE user_id = ${loggedUser.dataValues.user_id}  order by id desc limit 1`, function (err, res) {
                    
                    }); 
                    return result(null, {
                        message: "Logged out successfully!!!"
                    })
            });
        } catch(err){
            return result(null,{
                data:err,
                message:"Something went Wrong"
            })
        }
    }
    else{
        return result({
            data:err,
            message:"Something went Wrong"
        },null)
    }
}

Users.getSeverityAlert = async(req,result)=>{
    let node = await getUserNodesAssigned(req);
    // console.log("node",node)
    try{
        dbConn.query(`SELECT severity_alert.node_id, node_location.organization, node_location.sector, node_location.region, severity_alert.alert_type, severity_alert.alert, severity_alert.description, Max(severity_alert.date_time) AS date_time FROM severity_alert Inner Join node_location ON node_location.id = severity_alert.node_id   where severity_alert.node_id IN (`+node+`) GROUP BY severity_alert.node_id, severity_alert.alert_type, severity_alert.description ORDER BY date_time DESC LIMIT 2000`, (err, res) =>{
            result(null, res);
        })
    } catch(err){
        return result(null, err);
    }
}


Users.getMitreAttack = async(req,result)=>{
  
    try{
        dbConn.query(`SELECT t.tactics,t.codeValue,
        GROUP_CONCAT(CASE WHEN mt.tactics_id = t.id THEN mt.techniques END SEPARATOR ', ') AS techniques
 FROM mitre_techniques mt
 JOIN mitre_tactics t ON mt.tactics_id = t.id
 GROUP BY t.tactics;`, (err, res) =>{
            result(null, res);
        })
    } catch(err){
        return result(null, err);
    }
}


async function getUserNodesAssigned(req) {

    const token = req.headers.authorization;

    const decoded = jwt.verify(token, config.JWT_PASSWORD_KEY);

    const user = await User.findOne({ where: { username: decoded.data } });


    let allNodes = await Node_id.findAll({ attributes: [['node_id', 'id']], where: { user_id: user.dataValues.user_id } });
    if (allNodes[0].id == 0) {
        allNodes = await NodeLocations.findAll({ attributes: ['id'] });
    }
    let node = [];
    allNodes.forEach(val => {
        node.push(val?.dataValues?.id)
    });
    return node;
}


Users.removeToken = async (result) => {

    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();

    try{
        dbConn.query(`select * from users WHERE updated_at < DATE_SUB( NOW(), INTERVAL 20 MINUTE )  and token != "I am not having token"`, (err, res) =>{
                return result(null, res);
        })
    } catch(err){
        return result(null, err);
    }
}

Users.editProfile = (req, result) => {
    let { user_id, name, email } = req.body;
    try {
      dbConn.query(
        `SELECT * FROM users where email='${email}' and user_id <> ${user_id}`,
        (err, res) => {
          if (res.length > 0) {
            console.log("response", res);
            result(null, {
              message: "this Email already existed",
            });
          } else {
            dbConn.query(
              `update users  set name='${name}',email='${email}' where user_id=${user_id}`,
              (err, resp) => {
                console.log("resp");
                result(null, {
                  message: "Profile Edit SuccessFully",
                });
              }
            );
          }
        }
      );
    } catch (err) {
      return result(null, err);
    }
  };
  
module.exports = Users;