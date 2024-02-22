var dbConn = require("../../config/db.config");
require("dotenv").config();
const os = require("os");
const config = process.env;
const { sequelize, DataTypes } = require("../../config/sequelize");
const fs = require("fs");
const xml2js = require("xml2js");
const requestIp = require("request-ip");
const axios = require("axios");
const path = require('path'); 

let Honeypot = (data) => {
  create_at = new Date() | any;
  updated_at = new Date() | any;
};

Honeypot.blueprintSubmit = async (req, result) => {
  try {
    let nodeImage_id = await parseImage(req);

    let snapshot_id = await parseSnapshot(req, nodeImage_id);

    let honeypot_id = await parseHoneypotType(req);

    await parseSnaphotHoneypot(honeypot_id, snapshot_id);

    const profilePackageMap = [];
    const vulPackageMap = [];
    var packageSnap = [];
    for (let i = 0; i < req.body.honeypot_profiles.length; i++) {
      let profileId = await parseProfile(
        req.body.honeypot_profiles[i].profile_name,
        snapshot_id,
        nodeImage_id
      );
      // console.log("NodeImage_id :",nodeImage_id,"\nprofileId :",profileId);

      const packageIds = [];
      var vulIds = [];
      if (req.body.honeypot_profiles[i]?.service.length > 0) {
        const packageId = await parsePackage(
          req.body.honeypot_profiles[i].service
        );
        packageSnap.push(packageId.package_ids);
        vulIds = packageId.vul_ids;
        packageIds.push({
          profileId: profileId,
          package_id: packageId.package_ids,
        });
      }
      // console.log("--PID",packageIds)

      for (const entry of packageIds) {
        profilePackageMap.push({
          profile_id: entry.profileId,
          package_id: entry.package_id,
        });
      }

      for (const entry of vulIds) {
        vulPackageMap.push({
          package_id: entry.package_id,
          vul_id: entry.vul_id,
          profile_id:profileId
        });
      }
    }
    const resultArray = [];
    packageSnap.forEach((subArray) => {
      subArray.forEach((value) => {
        resultArray.push({ snapshot_id, value });
      });
    });

    function checkAndInsert(entry) {
      return new Promise((resolve, reject) => {
        dbConn.query(
          `SELECT * FROM node_snapshot_package WHERE snapshot_id = ? AND package_id = ?`,
          [entry.snapshot_id, entry.value],

          (selectErr, selectRes) => {
            if (selectErr) {
              reject(selectErr);
            } else if (selectRes.length === 0) {
              dbConn.query(
                `INSERT INTO node_snapshot_package(snapshot_id, package_id) VALUES (?, ?)`,
                [entry.snapshot_id, entry.value],

                (insertErr, insertRes) => {
                  if (insertErr) {
                    reject(insertErr);
                  } else {
                    resolve(insertRes);
                  }
                }
              );
            } else {
              resolve("Data already exists.");
            }
          }
        );
      });
    }

    async function insertEntriesIntoDatabase() {
      for (const entry of resultArray) {
        try {
          await checkAndInsert({ snapshot_id, value: entry.value });
        } catch (error) {
          console.error("Error inserting entry:", error);
        }
      }
    }

    insertEntriesIntoDatabase();

    const flattenedMappings = [];
    const vulMapping = [];
    // console.log("PPP", profilePackageMap)
    for (const entry of profilePackageMap) {
      const profileId = entry.profile_id;

      for (const packageId of entry.package_id) {
        // console.log("packageId from for loop",packageId)
        // console.log("entry from for loop",entry)
        flattenedMappings.push({
          profile_id: profileId,
          package_id: packageId,
        });
      }
    }

    for (const entry of vulPackageMap) {
      const packageID = entry.package_id;
      const profileID=entry.profile_id;
      for (const vulId of entry.vul_id) {
        vulMapping.push({ package_id: packageID, vul_id: vulId, profile_id:profileID });
      }
    }

    // console.log("vulMapping",vulMapping)
    let map_id = [];
    for (const entry of flattenedMappings) {
      let mapId = await profilePackage(entry.profile_id, entry.package_id);
      map_id.push(mapId);
    }
    // console.log("profileId::::: ",profileId);
    let vul_map_id = [];
    for (const entry of vulMapping) {
      let vulmap_id = await vulPackage(
        entry.package_id,
        entry.vul_id,
        snapshot_id,
        entry.profile_id
      );
      vul_map_id.push(vulmap_id);
    }
    // console.log("vul_map_id",vul_map_id)
  } catch (err) {
    // console.log(err);
    return result(null, {
      status: 0,
      msg: "Something Went Wrong !!!",
    });
  }
  return result(null, {
    repeatedProfiles: profileFound,
    uniqueProfiles: profileNotFound,
    status: 1,
    msg: "Blueprint Created",
  });
};

async function parseImage(req) {
  var {
    base_system,
    image_name,
    image_tag,
    vm_type,
    vm_name,
    os_type,
    os_name,
    node_id,
  } = req.body;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT image_id FROM node_image WHERE node_id = ${node_id} AND vm_name = '${vm_name}' AND status = 0`,
        async (err, res) => {
          if (err) {
            reject(err);
          } else {
            if (res.length == 0) {
              if(image_tag == 0 || image_name == "undefined") {
                dbConn.query(
                  `INSERT INTO node_image(node_id, os_name, vm_name, os_type, vm_type, status,  node_hardware) VALUES ('${node_id}', '${os_name}', '${vm_name}', '${os_type}', '${vm_type}', 0,  '${base_system}')`,
                  async (err, insertResult) => {
                    if (err) {
                      reject(err);
                    } else {
                      const image_id = insertResult.insertId;
                      resolve(image_id); // Resolve with the fetched image_id
                    }
                  }
                );
              }
              // if(image_name == "undefined") {
              //   image_name = ''
              // }
              else {
                dbConn.query(
                  `INSERT INTO node_image(node_id, os_name, vm_name, os_type, vm_type, status, image_name, image_tag, node_hardware) VALUES ('${node_id}', '${os_name}', '${vm_name}', '${os_type}', '${vm_type}', 0, '${image_name}', '${image_tag}', '${base_system}')`,
                  async (err, insertResult) => {
                    if (err) {
                      reject(err);
                    } else {
                      const image_id = insertResult.insertId;
                      resolve(image_id); // Resolve with the fetched image_id
                    }
                  }
                );
              }
           
            } else {
              resolve(res[0].image_id);
            }
          }
        }
      );
    }, 300);
  });
}

async function parseSnapshot(req, imageid) {
  var { honeypot_name, snap_name, honeypot_type, honeypot_cat } = req.body;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT snapshot_id FROM node_snapshot WHERE image_id = ${imageid} AND snapshot_name = '${snap_name}'`,
        async (err, res) => {
          if (err) {
            reject(err);
          } else {
            if (res.length == 0) {
              dbConn.query(
                `INSERT INTO node_snapshot(image_id, snapshot_name, honeypot_name, honeypot_type, honeypot_category) VALUES ('${imageid}', '${snap_name}', '${honeypot_name}', '${honeypot_type}', '${honeypot_cat}')`,
                async (err, insertResult) => {
                  if (err) {
                    reject(err);
                  } else {
                    const snapshot_id = insertResult.insertId;
                    resolve(snapshot_id);
                  }
                }
              );
            } else {
              resolve(res[0].snapshot_id);
            }
          }
        }
      );
    }, 300);
  });
}

async function parseHoneypotType(req) {
  var { honeypot_type, honeypot_detail } = req.body;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT hp_id FROM node_honeypot_type WHERE hp_type = '${honeypot_type}'`,
        async (err, res) => {
          if (err) {
            reject(err);
          } else {
            if (res.length == 0) {
              dbConn.query(
                `INSERT INTO node_honeypot_type(hp_type, hp_detail) VALUES ('${honeypot_type}', '${honeypot_detail}')`,
                async (err, insertResult) => {
                  if (err) {
                    reject(err);
                  } else {
                    const hp_id = insertResult.insertId;
                    resolve(hp_id);
                  }
                }
              );
            } else {
              resolve(res[0].hp_id);
            }
          }
        }
      );
    }, 300);
  });
}

async function parseSnaphotHoneypot(hp_id, snap_id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT map_id FROM node_snapshot_honeypot WHERE hp_id = '${hp_id}' AND snapshot_id = '${snap_id}'`,
        async (err, res) => {
          if (err) {
            reject(err);
          } else {
            if (res.length == 0) {
              dbConn.query(
                `INSERT INTO node_snapshot_honeypot(hp_id, snapshot_id) VALUES ('${hp_id}', '${snap_id}')`,
                async (err, insertResult) => {
                  if (err) {
                    reject(err);
                  } else {
                    const map_id = insertResult.insertId;
                    resolve(map_id);
                  }
                }
              );
            } else {
              resolve(res[0].map_id);
            }
          }
        }
      );
    }, 300);
  });
}
let profileFound = 0;
let profileNotFound = 0;

// async function parseProfile(profile, snapshot_id,image_id) {

  
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       dbConn.query(
//         `SELECT node_hp_profile.profile_id FROM node_hp_profile INNER JOIN node_snapshot_hp_profile on node_hp_profile.profile_id = node_snapshot_hp_profile.profile_id INNER JOIN
//         node_image ON node_image.image_id = node_snapshot_hp_profile.snapshot_id WHERE node_snapshot_hp_profile.snapshot_id = '${snapshot_id}' AND node_hp_profile.profile_name = '${profile}' and node_image.image_id=${image_id}`,
//         async (err, res) => {
//           if (err) {
//             reject(err);
//           } else {
//             if (res.length != 0) {
//               profileFound++;
//             }
//             if (res.length == 0) {
//               profileNotFound++;
//               const parts = profile.trim().split(':');
//               const detailedProfileName = parts.length >= 4;

//               // const singleDepth = /:[^:]+:[^:]+:[^:]+:/.test(profile);
//               let query = ``
//               if(!detailedProfileName){
//                 console.log("I am in single depth")
//                 query = `INSERT INTO node_hp_profile(profile_name, device_name, device_type) VALUES ('${profile}', '${profile}', 'OS')`;
//               }
//               else {
//                 console.log("I am in else ")

//                 const profileParts = profile.split(":");
//                 const device_name = profileParts[profileParts.length - 1];
  
//                 const device_type = profileParts[profileParts.length - 2];
//                 query = `INSERT INTO node_hp_profile(profile_name, device_name, device_type) VALUES ('${profile}', '${device_name}', '${device_type}')`;  
//               }

//               console.log("-----Which query is running-----", query)
//               ///
//               // db.query(`Select `)
//               ///
//               dbConn.query(query,
//                 async (err, insertResult) => {
//                   if (err) {
//                     reject(err);
//                   } else {
//                     const profile_id = insertResult.insertId;

//                     // Insertion into node_profile_device table

//                     // const profileParts = profile.split(":");
//                     // const device_name = profileParts[profileParts.length - 1];

//                     // const device_type = profileParts[profileParts.length - 2];

//                     // dbConn.query(
//                     //   `INSERT INTO node_profile_device (profile_id, device_name, device_type) VALUES (?, ?, ?)`,
//                     //   [profile_id, device_name, device_type],
//                     //   async (err, insertRes) => {
//                     //     if (err) {
//                     //       reject(err);
//                     //     }
//                     //   }
//                     // );

//                     dbConn.query(
//                       `INSERT INTO node_snapshot_hp_profile(snapshot_id,profile_id) VALUES ('${snapshot_id}','${profile_id}')`,
//                       async (err, insertRes) => {
//                         if (err) {
//                           reject(err);
//                         }
//                       }
//                     );
//                     resolve(profile_id); // Resolve with the fetched image_id
//                   }
//                 }
//               );
//             } else {
//               resolve(res[0].profile_id);
//             }
//           }
//         }
//       );
//     }, 300);
//   });
// }
async function parseProfile(profile, snapshot_id, image_id) {
  // console.log("parseProfile Parameters received:", profile, snapshot_id, image_id);
  return new Promise((resolve, reject) => {
    dbConn.query(
      `SELECT node_hp_profile.profile_id FROM node_hp_profile WHERE node_hp_profile.profile_name = '${profile}'`,
      async (err, existingProfileResult) => {
        if (err) {
          reject(err);
        } else {
          // console.log("existingProfileResult", existingProfileResult)
          if (existingProfileResult.length !== 0) {
            const profile_id = existingProfileResult?.[0]?.profile_id;

                            // check on node_snapshot_hp_profile
                            dbConn.query(
                              `SELECT node_hp_profile.profile_id FROM node_hp_profile INNER JOIN node_snapshot_hp_profile on node_hp_profile.profile_id = node_snapshot_hp_profile.profile_id INNER JOIN
                              node_image ON node_image.image_id = node_snapshot_hp_profile.snapshot_id WHERE node_snapshot_hp_profile.snapshot_id = '${snapshot_id}' AND node_hp_profile.profile_name = '${profile}' and node_image.image_id=${image_id}`,
                              async (err, res) => {
                                // console.log("Response", res);
                                if (err) {
                                  reject(err);
                                } else {
                                  if (res.length !== 0) {
                                    profileFound++;
                                    // Handle the case when res.length !== 0
                                  }
                                  if (res.length === 0) {
                                    profileNotFound++;
                                    // Insertion into node_snapshot_hp_profile table
                                    dbConn.query(
                                      `INSERT INTO node_snapshot_hp_profile(snapshot_id,profile_id) VALUES ('${snapshot_id}','${profile_id}')`,
                                      async (err, insertRes) => {
                                        if (err) {
                                          reject(err);
                                        } else {
                                          // Handle the case when insertion is successful
                                          resolve(profile_id); // Resolve with the fetched image_id
                                        }
                                      }
                                    );
                                  }
                                }
                              }
                            );
            resolve(existingProfileResult[0].profile_id);
          } else {
            const parts = profile.trim().split(':');
            const detailedProfileName = parts.length >= 4;

            let query = '';
            if (!detailedProfileName) {
              const profileParts = profile.split(":");
              const device_name = profileParts[profileParts.length - 1];
              const device_type = profileParts[profileParts.length - 2];

                          // console.log("I am in single depth")
              query = `INSERT INTO node_hp_profile(profile_name, device_name, device_type) VALUES ('${profile}', '${device_name}', '${device_type}')`;
            } else {
              
              // console.log("I am in else ");

              const profileParts = profile.split(":");
              const device_name = profileParts[profileParts.length - 1];
              const device_type = profileParts[profileParts.length - 2];
              query = `INSERT INTO node_hp_profile(profile_name, device_name, device_type) VALUES ('${profile}', '${device_name}', '${device_type}')`;
            }

            // console.log("-----Which query is running-----", query);

            dbConn.query(query, async (err, insertResult) => {
              if (err) {
                reject(err);
              } else {
                const profile_id = insertResult.insertId;

                // check on node_snapshot_hp_profile
                dbConn.query(
                  `SELECT node_hp_profile.profile_id FROM node_hp_profile INNER JOIN node_snapshot_hp_profile on node_hp_profile.profile_id = node_snapshot_hp_profile.profile_id INNER JOIN
                  node_image ON node_image.image_id = node_snapshot_hp_profile.snapshot_id WHERE node_snapshot_hp_profile.snapshot_id = '${snapshot_id}' AND node_hp_profile.profile_name = '${profile}' and node_image.image_id=${image_id}`,
                  async (err, res) => {
                    // console.log("Response", res);
                    if (err) {
                      reject(err);
                    } else {
                      if (res.length !== 0) {
                        profileFound++;
                        // Handle the case when res.length !== 0
                      }
                      if (res.length === 0) {
                        profileNotFound++;
                        // Insertion into node_snapshot_hp_profile table
                        dbConn.query(
                          `INSERT INTO node_snapshot_hp_profile(snapshot_id,profile_id) VALUES ('${snapshot_id}','${profile_id}')`,
                          async (err, insertRes) => {
                            if (err) {
                              reject(err);
                            } else {
                              resolve(profile_id); // Resolve with the fetched image_id
                            }
                          }
                        );
                      }
                    }
                  }
                );
              }
            });
          }
        }
      }
    );
  });
}


// async function parseProfile(profile, snapshot_id, image_id) {
//   console.log("parseProfile Parameters received :",  profile, snapshot_id, image_id)
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//               dbConn.query(
//                 `SELECT node_hp_profile.profile_id FROM node_hp_profile INNER JOIN node_snapshot_hp_profile on node_hp_profile.profile_id = node_snapshot_hp_profile.profile_id INNER JOIN
//                 node_image ON node_image.image_id = node_snapshot_hp_profile.snapshot_id WHERE node_snapshot_hp_profile.snapshot_id = '${snapshot_id}' AND node_hp_profile.profile_name = '${profile}' and node_image.image_id=${image_id}`,
//                 async (err, res) => {
//                   console.log("RESponse", res)
//                   if (err) {
//                     reject(err);
//                   } else {
//                     if (res.length !== 0) {
//                       console.log("The Response---",res)
//                       profileFound++;
//                       // Pending to implement
//                       //  // Insertion into node_snapshot_hp_profile table
//                       //  dbConn.query(
//                       //   `INSERT INTO node_snapshot_hp_profile(snapshot_id,profile_id) VALUES ('${snapshot_id}','${profile_id}')`,
//                       //   async (err, insertRes) => {
//                       //     if (err) {
//                       //       reject(err);
//                       //     }
//                       //   }
//                       // );
//                     }
//                     if (res.length === 0) {
//                       profileNotFound++;
//                       const parts = profile.trim().split(':');
//                       const detailedProfileName = parts.length >= 4;

//                       let query = '';
//                       if (!detailedProfileName) {
//                         // console.log("I am in single depth")
//                         query = `INSERT INTO node_hp_profile(profile_name, device_name, device_type) VALUES ('${profile}', '${profile}', 'OS')`;
//                       } else {
//                         console.log("I am in else ")

//                         const profileParts = profile.split(":");
//                         const device_name = profileParts[profileParts.length - 1];
//                         const device_type = profileParts[profileParts.length - 2];
//                         query = `INSERT INTO node_hp_profile(profile_name, device_name, device_type) VALUES ('${profile}', '${device_name}', '${device_type}')`;
//                       }

//                       console.log("-----Which query is running-----", query);
//                       dbConn.query(
//                         `SELECT node_hp_profile.profile_id FROM node_hp_profile WHERE node_hp_profile.profile_name = '${profile}'`,
//                         async (err, existingProfileResult) => {
//                           if (err) {
//                             reject(err);
//                           } else {
//                             if (existingProfileResult.length !== 0) {
//                               resolve(existingProfileResult[0].profile_id);
//                             } else {
//                       dbConn.query(query,
//                         async (err, insertResult) => {
//                           if (err) {
//                             reject(err);
//                           } else {
//                             const profile_id = insertResult.insertId;

//                             // Insertion into node_snapshot_hp_profile table
//                             dbConn.query(
//                               `INSERT INTO node_snapshot_hp_profile(snapshot_id,profile_id) VALUES ('${snapshot_id}','${profile_id}')`,
//                               async (err, insertRes) => {
//                                 if (err) {
//                                   reject(err);
//                                 }
//                               }
//                             );
//                             resolve(profile_id); // Resolve with the fetched image_id
//                           }
//                         }
//                       );
//                     }
//                     //  else {
//                     //   resolve(res[0].profile_id);
//                     // }
//                   }
//                 }
//               );
//             }
            
//              else {
//                       resolve(res[0].profile_id);
//                     }
//           }
//         }
//       );
//     }, 300);
//   });
// }



///
async function parsePackage(service) {
  return new Promise(async (resolve, reject) => {
    const package_ids = [];
    const promises = [];
    const vul_ids = [];
    service.forEach((service) => {
      const query = `SELECT package_id FROM node_package WHERE package_name = '${service.name}' AND package_version = '${service.version}' AND port = '${service.port}'`;
      
      promises.push(
        new Promise((innerResolve, innerReject) => {
          dbConn.query(query, async (err, res) => {
            if (err) {
              innerReject(err);
            } else {
              if (res.length === 0) {
                dbConn.query(
                  `INSERT INTO node_package(package_name, package_version, package_type, port) VALUES ('${service.name}', '${service.version}', 'service', '${service.port}')`,
                  async (err, insertResult) => {
                    if (err) {
                      innerReject(err);
                    } else {
                      const package_id = insertResult.insertId;
                      if (service?.vulnerability.length > 0) {
                        const VulId = await parseVulnerability(
                          service.vulnerability
                        );
                        vul_ids.push({ package_id: package_id, vul_id: VulId });
                      }
                      package_ids.push(package_id);
                      innerResolve();
                    }
                  }
                );
              } else {
                if (service?.vulnerability.length > 0) {
                  const VulId = await parseVulnerability(service.vulnerability);
                  vul_ids.push({
                    package_id: res[0].package_id,
                    vul_id: VulId,
                  });
                }
                package_ids.push(res[0].package_id);
                innerResolve();
              }
            }
          });
        })
      );
    });
    await Promise.all(promises);

    resolve({ package_ids, vul_ids });
  });
}

async function profilePackage(profile_id, package_id) {
  // console.log("--ProfileId---",profile_id)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT map_id FROM node_hp_profile_package WHERE profile_id = '${profile_id}' AND  package_id ='${package_id}'`,
        async (err, res) => {
          if (err) {
            reject(err);
          } else {
            if (res.length == 0) {
              // console.log("--ProfileId 2---",profile_id)

              dbConn.query(
                `INSERT INTO node_hp_profile_package(profile_id, package_id) VALUES ('${profile_id}', '${package_id}')`,
                async (err, insertResult) => {
                  if (err) {
                    reject(err);
                  } else {
                    const map_id = insertResult.insertId;
                    resolve(map_id);
                  }
                }
              );
            } else {
              resolve(res[0].map_id);
            }
          }
        }
      );
    }, 300);
  });
}

// async function parseVulnerability(vulnerability) {
//   return new Promise(async (resolve, reject) => {
//     const vul_ids = [];
//     const promises = [];

//     vulnerability.forEach((vul) => {
//       const query = `SELECT vulnerability_id FROM node_vulnerability WHERE vulnerability = '${vul.vulnerability_name}'`;

//       promises.push(
//         new Promise((innerResolve, innerReject) => {
//           dbConn.query(query, async (err, res) => {
//             if (err) {
//               innerReject(err);
//             } else {
//               if (res.length === 0) {
//                 dbConn.query(
//                   `INSERT INTO node_vulnerability(vulnerability_description, vulnerability) VALUES ("${vul.vulnerability_description}", "${vul.vulnerability_name}")`,
//                   async (err, insertResult) => {
//                     if (err) {
//                       innerReject(err);
//                     } else {
//                       const vulnerability_id = insertResult.insertId;
//                       vul_ids.push(vulnerability_id);
//                       innerResolve();
//                     }
//                   }
//                 );
//               } else {
//                 vul_ids.push(res[0].vulnerability_id);
//                 innerResolve();
//               }
//             }
//           });
//         })
//       );
//     });

//     await Promise.all(promises);

//     resolve(vul_ids);
//   });
// }

async function parseVulnerability(vulnerability) {
  return new Promise(async (resolve, reject) => {
    const vul_ids = [];
    const promises = [];

    vulnerability.forEach((vul) => {
      const query = 'SELECT vulnerability_id FROM node_vulnerability WHERE vulnerability = ?';
      const params = [vul.vulnerability_name];

      promises.push(
        new Promise((innerResolve, innerReject) => {
          dbConn.query(query, params, async (err, res) => {
            if (err) {
              innerReject(err);
            } else {
              if (res.length === 0) {
                // Check for null
                if (vul.vulnerability_name !== null) {
                  const insertQuery = 'INSERT INTO node_vulnerability(vulnerability_description, vulnerability) VALUES (?, ?)';
                  const insertParams = [vul.vulnerability_description, vul.vulnerability_name];

                  dbConn.query(insertQuery, insertParams, async (err, insertResult) => {
                    if (err) {
                      console.log("Error in insertion Query",err)
                      innerReject(err);
                    } else {
                      const vulnerability_id = insertResult.insertId;
                      vul_ids.push(vulnerability_id);
                      innerResolve();
                    }
                  });
                } else {
                  console.log("Skipping insertion because vulnerability_name is null.");
                  innerResolve();
                }
              } else {
                vul_ids.push(res[0].vulnerability_id);
                innerResolve();
              }
            }
          });
        })
      );
    });

    await Promise.all(promises);

    resolve(vul_ids);
  });
}


async function vulPackage(package_id, vul_id, snapshot_id,profile_id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT map_id from node_vulnerability_package WHERE vulnerability_id = '${vul_id}' AND  package_id ='${package_id}' AND snapshot_id = '${snapshot_id}' AND profile_id =${profile_id}`,
        async (err, res) => {
          if (err) {
            reject(err);
          } else {
            if (res.length == 0) {
              dbConn.query(
                `INSERT INTO node_vulnerability_package(vulnerability_id, package_id,snapshot_id,profile_id) VALUES ('${vul_id}', '${package_id}','${snapshot_id}','${profile_id}')`,
                async (err, insertResult) => {
                  if (err) {
                    reject(err);
                  } else {
                    const map_id = insertResult.insertId;
                    resolve(map_id);
                  }
                }
              );
            } else {
              resolve(res[0].map_id);
            }
          }
        }
      );
    }, 300);
  });
}
Honeypot.getHighNode = (result) => {
  try {
    dbConn.query(
      'SELECT node_id FROM node where node_sensor_hp_type="HIHP";',
      (err, res) => {
        result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};
Honeypot.snapCount = async (req, result) => {
  let totalIotCount = await totalIot();
  let totalWebCount = await totalWeb();
  let totalScadaCount = await totalScada();
  let totalVulCount = await totalVul();
  let totalHpCount = await totalHp();
  let totalHiHpCount = await totalHiHp();
  let totalProtocolsCount = await totalprotocols();
  let totalPortsCount = await totalports();
  let totalImagesCount = await totalImages();
  let totalDeviceTypesCount = await totalDeviceTypes();
  let totalDeviceNamesCount = await totalDeviceNames();

  return result(
    await {
      totalIotCount,
      totalWebCount,
      totalScadaCount,
      totalVulCount,
      totalHpCount,
      totalHiHpCount,
      totalProtocolsCount,
      totalPortsCount,
      totalImagesCount,
      totalDeviceTypesCount,
      totalDeviceNamesCount
    }
  );
};

async function totalHp() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
     
      dbConn.query(
//         `SELECT 
//         (SELECT count(*) FROM node_snapshot_hp_profile) as totalCount,
//         (SELECT count(distinct profile_name) FROM node_hp_profile) as distinctCount;
// `,
`SELECT 
( SELECT COUNT(DISTINCT COALESCE(node_image.image_name, 'null'), COALESCE(node_image.image_tag, 'null'), node_hp_profile.profile_name)
FROM node_image
INNER JOIN node_snapshot ON node_snapshot.image_id = node_image.image_id
INNER JOIN node_snapshot_hp_profile ON node_snapshot_hp_profile.snapshot_id = node_snapshot.snapshot_id
INNER JOIN node_hp_profile ON node_hp_profile.profile_id = node_snapshot_hp_profile.profile_id) AS totalCount,
(SELECT COUNT(DISTINCT profile_name) FROM node_hp_profile) AS distinctCount;
`,
        async (err, res) => {
          resolve(res);
        }
      );
    }, 300);
  });
}

// async function totalHp() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       dbConn.query(
//                 // `SELECT count(*) as totalHpCount FROM node_snapshot;`,

//         `(SELECT count(*) FROM node_hp_profile) as totalCount,
//         (SELECT count(distinct profile_name) as totalHpCount FROM node_hp_profile) as distrinctCount;`,
//         async (err, res) => {
//           console.log(res)
//           resolve(res);
//         }
//       );
//     }, 300);
//   });
// }

async function totalHiHp() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `  SELECT
        (
            SELECT COUNT(DISTINCT node_hp_profile.profile_name)
            FROM node_snapshot_hp_profile
            INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
            INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
            WHERE node_snapshot.honeypot_type = 'HIHP'
        ) AS distinctCount,
        
        (
          SELECT COUNT(DISTINCT node_hp_profile.profile_name)
          FROM node_snapshot_hp_profile
          INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
          INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
          WHERE node_snapshot.honeypot_type = 'HIHP'
      ) AS totalCount`,
        async (err, res) => {
          resolve(res);
        }
      );
    }, 300);
  });
}

async function totalprotocols() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // `SELECT 
      // (SELECT count(*) FROM node_hp_profile) as totalCount,
      // (SELECT count(distinct profile_name) FROM node_hp_profile) as distinctCount;`,
      dbConn.query(
        `SELECT (SELECT COUNT(package_name) FROM node_package) AS totalCount
        ,
        (SELECT COUNT(DISTINCT package_name) FROM node_package) AS distinctCount
        `,
        async (err, res) => {
          resolve(res);
        }
      );
    }, 300);
  });
}

async function totalports() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT COUNT(port) AS totalPortsCount
        FROM node_package;`,
        async (err, res) => {
          resolve(res);
        }
      );
    }, 300);
  });
}

async function totalVul() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT
        (SELECT count(*) as totalVulCount FROM node_vulnerability) as totalCount,
        (SELECT count(distinct vulnerability) FROM node_vulnerability) as distinctCount`,
        async (err, res) => {

          resolve(res);
        }
      );
    }, 300);
  });
}

async function totalImages() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT    
        (SELECT count(vm_name) FROM node_image) as totalCount,
        (SELECT count(distinct vm_name) FROM node_image) as distinctCount`,
        async (err, res) => {

          resolve(res);
        }
      );
    }, 300);
  });
}

async function totalDeviceNames() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT    
        (SELECT COUNT(DISTINCT node_image.image_name, node_image.image_tag, node_hp_profile.device_name)
        FROM node_image
        INNER JOIN node_snapshot ON node_snapshot.image_id = node_image.image_id
        INNER JOIN node_snapshot_hp_profile ON node_snapshot_hp_profile.snapshot_id = node_snapshot.snapshot_id
        INNER JOIN node_hp_profile ON node_hp_profile.profile_id = node_snapshot_hp_profile.profile_id) AS totalCount,
                (SELECT count(distinct device_name) FROM node_hp_profile) as distinctCount`,
        async (err, res) => {

          resolve(res);
        }
      );
    }, 300);
  });
}

async function totalDeviceTypes() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT    
        (SELECT COUNT(DISTINCT node_image.image_name, node_image.image_tag, node_hp_profile.device_type)
 FROM node_image
 INNER JOIN node_snapshot ON node_snapshot.image_id = node_image.image_id
 INNER JOIN node_snapshot_hp_profile ON node_snapshot_hp_profile.snapshot_id = node_snapshot.snapshot_id
 INNER JOIN node_hp_profile ON node_hp_profile.profile_id = node_snapshot_hp_profile.profile_id) AS totalCount,
        (SELECT count(distinct device_type) FROM node_hp_profile) as distinctCount`,
        // (SELECT count(device_type) FROM node_hp_profile) as totalCount,

        async (err, res) => {

          resolve(res);
        }
      );
    }, 300);
  });
}

async function totalIot() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        // `SELECT COUNT(DISTINCT node_hp_profile.profile_name) AS totalIotCount
        // FROM node_snapshot_hp_profile
        // INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
        // INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
        // WHERE node_snapshot.honeypot_category = 'IoT';`,
        `SELECT
        (
            SELECT COUNT(DISTINCT node_hp_profile.profile_name)
            FROM node_snapshot_hp_profile
            INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
            INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
            WHERE node_snapshot.honeypot_category = 'IoT'
        ) AS distinctCount,
        (SELECT COUNT(DISTINCT node_image.image_name, node_image.image_tag, node_hp_profile.profile_name)
 FROM node_image
 INNER JOIN node_snapshot ON node_snapshot.image_id = node_image.image_id
 INNER JOIN node_snapshot_hp_profile ON node_snapshot_hp_profile.snapshot_id = node_snapshot.snapshot_id
 INNER JOIN node_hp_profile ON node_hp_profile.profile_id = node_snapshot_hp_profile.profile_id 
 WHERE node_snapshot.honeypot_category = 'IoT') AS totalCount;
        `,
      //   (
      //     SELECT COUNT(node_hp_profile.profile_name)
      //     FROM node_snapshot_hp_profile
      //     INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
      //     INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
      //     WHERE node_snapshot.honeypot_category = 'IoT'
      // ) AS totalCount;
        // `SELECT count(*) as totalIotCount FROM node_snapshot where honeypot_category="IoT";`,
        async (err, res) => {
          resolve(res);
        }
      );
    }, 300);
  });
}

async function totalWeb() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        // `SELECT COUNT(DISTINCT node_hp_profile.profile_name) AS totalWebCount
        // FROM node_snapshot_hp_profile
        // INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
        // INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
        // WHERE node_snapshot.honeypot_category = 'WEB';`,

        // `SELECT count(*) as totalWebCount FROM node_snapshot where honeypot_category="WEB";`,


        `SELECT
        (
            SELECT COUNT(DISTINCT node_hp_profile.profile_name)
            FROM node_snapshot_hp_profile
            INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
            INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
            WHERE node_snapshot.honeypot_category = 'WEB'
        ) AS distinctCount,
        (SELECT COUNT(DISTINCT node_image.image_name, node_image.image_tag, node_hp_profile.profile_name)
        FROM node_image
        INNER JOIN node_snapshot ON node_snapshot.image_id = node_image.image_id
        INNER JOIN node_snapshot_hp_profile ON node_snapshot_hp_profile.snapshot_id = node_snapshot.snapshot_id
        INNER JOIN node_hp_profile ON node_hp_profile.profile_id = node_snapshot_hp_profile.profile_id 
        WHERE node_snapshot.honeypot_category = 'WEB') AS totalCount;
        `,
      //   (
      //     SELECT COUNT(node_hp_profile.profile_name)
      //     FROM node_snapshot_hp_profile
      //     INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
      //     INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
      //     WHERE node_snapshot.honeypot_category = 'WEB'
      // ) AS totalCount;
        async (err, res) => {
      
          resolve(res);
        }
      );
    }, 300);
  });
}

async function totalScada() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        // `SELECT COUNT(DISTINCT node_hp_profile.profile_name) AS totalScadaCount
        // FROM node_snapshot_hp_profile
        // INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
        // INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
        // WHERE node_snapshot.honeypot_category = 'SCADA';`,
        // `SELECT count(*) as totalScadaCount FROM node_snapshot where honeypot_category="SCADA";`,
        `SELECT
        (
            SELECT COUNT(DISTINCT node_hp_profile.profile_name)
            FROM node_snapshot_hp_profile
            INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
            INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
            WHERE node_snapshot.honeypot_category = 'SCADA'
        ) AS distinctCount,
        (
          SELECT COUNT(DISTINCT node_hp_profile.profile_name)
          FROM node_snapshot_hp_profile
          INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
          INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
          WHERE node_snapshot.honeypot_category = 'SCADA'
      ) AS totalCount;
       `,
    //    (
    //     SELECT COUNT(node_hp_profile.profile_name)
    //     FROM node_snapshot_hp_profile
    //     INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
    //     INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
    //     WHERE node_snapshot.honeypot_category = 'SCADA'
    // ) AS totalCount;
        async (err, res) => {
          resolve(res);
        }
      );
    }, 300);
  });
}

Honeypot.profileCount = async (req, result) => {
  // let totalIotCount = await totalIotProfile();
  // let totalWebCount = await totalWebProfile();
  // let totalScadaCount = await totalScadaProfile();

  return result(await totalProfile());
  // return result(await { totalIotCount, totalWebCount, totalScadaCount });
};

async function totalProfile() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT
        node_snapshot.honeypot_category,
        COUNT(DISTINCT node_hp_profile.profile_name) AS unique_profile_count
    FROM
        node_snapshot_hp_profile
    INNER JOIN
        node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
    INNER JOIN
        node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
    GROUP BY
        node_snapshot.honeypot_category;
    `,
        // `SELECT COUNT(DISTINCT node_hp_profile.profile_name) AS unique_profile_count
        // FROM node_snapshot_hp_profile
        // INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
        // INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
        // WHERE node_snapshot.honeypot_category = 'IoT';`,
        // `SELECT count(*) as doc_count FROM node_snapshot_hp_profile inner join node_snapshot on node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id where node_snapshot.honeypot_category="IoT";`,
        async (err, res) => {
          resolve(res);
        }
      );
    }, 300);
  });
}

// async function totalWebProfile() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       dbConn.query(
//         `SELECT COUNT(DISTINCT node_hp_profile.profile_name) AS unique_profile_count
//         FROM node_snapshot_hp_profile
//         INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
//         INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
//         WHERE node_snapshot.honeypot_category = 'WEB';`,
//         // `SELECT count(*) as doc_count FROM node_snapshot_hp_profile inner join node_snapshot on node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id where node_snapshot.honeypot_category="WEB";`,
//         async (err, res) => {
//           resolve(res);
//         }
//       );
//     }, 300);
//   });
// }

// async function totalScadaProfile() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       dbConn.query(
//         `SELECT COUNT(DISTINCT node_hp_profile.profile_name) AS unique_profile_count
//         FROM node_snapshot_hp_profile
//         INNER JOIN node_snapshot ON node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
//         INNER JOIN node_hp_profile ON node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
//         WHERE node_snapshot.honeypot_category = 'SCADA';`,
//         // `SELECT count(*) as doc_count FROM node_snapshot_hp_profile inner join node_snapshot on node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id where node_snapshot.honeypot_category="SCADA";`,
//         async (err, res) => {
//           resolve(res);
//         }
//       );
//     }, 300);
//   });
// }

Honeypot.getProfiles = (req, result) => {
  try {
    dbConn.query(
      `SELECT  node_hp_profile.device_name, node_hp_profile.device_type, node_image.node_id,node_image.image_name, node_image.vm_name, node_image.image_tag,node_snapshot.snapshot_name,node_snapshot.honeypot_type FROM node_hp_profile
    inner join node_snapshot_hp_profile on node_snapshot_hp_profile.profile_id = node_hp_profile.profile_id
    inner join node_snapshot on node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id 
   inner join node_image on node_image.image_id = node_snapshot.image_id
    where node_snapshot.honeypot_category="${req.body.cat}" group by device_name`,
      //    `SELECT  node_profile_device.device_name, node_profile_device.device_type, node_image.node_id,node_image.image_name, node_image.vm_name, node_image.image_tag,node_snapshot.snapshot_name,node_snapshot.honeypot_type FROM node_profile_device
      //   inner join node_snapshot_hp_profile on node_snapshot_hp_profile.profile_id = node_profile_device.profile_id
      //   inner join node_snapshot on node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
      //  inner join node_image on node_image.image_id = node_snapshot.image_id
      //   where node_snapshot.honeypot_category="${req.body.cat}"`,
      (err, res) => {
        result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

Honeypot.timeGraph = (req, result) => {
  try {
    dbConn.query(
      // `SELECT  COUNT(DISTINCT  node_hp_profile.profile_name, node_image.image_name, node_image.image_tag) AS totalCount, DATE_FORMAT(node_snapshot_hp_profile.profile_time, '%Y-%m-%d %H:%i:%s') AS timestamp
      // FROM node_image
      // INNER JOIN node_snapshot ON node_snapshot.image_id = node_image.image_id
      // INNER JOIN node_snapshot_hp_profile ON node_snapshot_hp_profile.snapshot_id = node_snapshot.snapshot_id
      // INNER JOIN node_hp_profile ON node_hp_profile.profile_id = node_snapshot_hp_profile.profile_id;`,
      `SELECT DATE_FORMAT(profile_time, '%Y-%m-%d %H:%i:%s') AS timestamp, COUNT(*) AS count
      FROM node_snapshot_hp_profile
      GROUP BY timestamp;`,
      (err, res) => {
        result(null, {
          data: res,
        });
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

Honeypot.doubleProfilesDevices = (req, result) => {
  // console.log(req.body.cat)
  try {
    dbConn.query(
      `SELECT
      ndp.device_type,
      ndp.device_name,
      COUNT(*) AS device_count
  FROM
      node_hp_profile ndp
  JOIN (
      SELECT
          device_type,
          @row_number := @row_number + 1 AS row_num
      FROM
          (SELECT @row_number := 0) AS init,
          (SELECT device_type, COUNT(*) AS device_count
           FROM node_hp_profile
           GROUP BY device_type
           ORDER BY COUNT(*) DESC) AS counts
  ) AS rdt ON ndp.device_type = rdt.device_type
  WHERE
  rdt.row_num <= 10 and  ndp.profile_name LIKE '%:${req.body.cat}:%'
  GROUP BY
      ndp.device_type,
      ndp.device_name
  ORDER BY
      ndp.device_type,
      device_count DESC;
  
      `,
      //    `SELECT  node_profile_device.device_name, node_profile_device.device_type, node_image.node_id,node_image.image_name, node_image.vm_name, node_image.image_tag,node_snapshot.snapshot_name,node_snapshot.honeypot_type FROM node_profile_device
      //   inner join node_snapshot_hp_profile on node_snapshot_hp_profile.profile_id = node_profile_device.profile_id
      //   inner join node_snapshot on node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
      //  inner join node_image on node_image.image_id = node_snapshot.image_id
      //   where node_snapshot.honeypot_category="${req.body.cat}"`,
      (err, res) => {
        result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

Honeypot.doubleProtocols = (req, result) => {
  // console.log(req.body.cat)
  try {
    dbConn.query(
      `
      SELECT
      nhp.device_name,
      group_concat( distinct(nhp.device_name) separator ',') as device_name,
      np.package_name
       FROM node_snapshot AS ns
       JOIN node_snapshot_package AS nsp ON ns.snapshot_id = nsp.snapshot_id
       JOIN node_package AS np ON nsp.package_id = np.package_id
       JOIN node_hp_profile_package AS nhpp ON nhpp.package_id = nsp.package_id
       JOIN node_hp_profile AS nhp ON nhp.profile_id = nhpp.profile_id
       group by package_name;
      `,
      (err, res) => {
        result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

Honeypot.doubleDeviceVulnerabilities = (req, result) => {
  // console.log(req.body.cat)
  try {
    dbConn.query(
      `WITH RankedVulnerabilities AS (
        SELECT
            COUNT(*) AS doc_count,
            nv.vulnerability,
                          nhp.device_name,
            ROW_NUMBER() OVER (PARTITION BY nhp.device_name ORDER BY COUNT(*) DESC) AS rnk
        FROM
            node_vulnerability_package AS nvp
        INNER JOIN
            node_hp_profile AS nhp ON nhp.profile_id = nvp.profile_id
        INNER JOIN
            node_vulnerability AS nv ON nv.vulnerability_id = nvp.vulnerability_id
        WHERE
            nv.vulnerability IS NOT NULL AND nv.vulnerability != 'NULL'
        GROUP BY
            nhp.device_name, nv.vulnerability
    )
    SELECT
        doc_count,
        vulnerability,
        device_name
    FROM
        RankedVulnerabilities
    WHERE
        rnk <= 10
    ORDER BY
        device_name, doc_count DESC;
      `,
      (err, res) => {
        result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

Honeypot.getHoneypots = (req, result) => {
  try {
    // let query = `SELECT ns.snapshot_name, ns.honeypot_type, ns.honeypot_category, ni.image_name
    //              FROM node_snapshot AS ns
    //              JOIN node_image AS ni ON ns.image_id = ni.image_id`;
    let query = `SELECT
    nhp.device_name,
    nhp.device_type,
    ni.node_id,
    ni.image_name,
    ni.vm_name,
    ni.image_tag,
    ns.snapshot_name,
    ns.honeypot_type,
    ns.honeypot_category
  FROM
    node_hp_profile AS nhp
  INNER JOIN
    node_snapshot_hp_profile AS nshp ON nshp.profile_id = nhp.profile_id
  INNER JOIN
    node_snapshot AS ns ON ns.snapshot_id = nshp.snapshot_id
  INNER JOIN
    node_image AS ni ON ni.image_id = ns.image_id`;

    //   let query = `SELECT  node_profile_device.device_name, node_profile_device.device_type, node_image.node_id,node_image.image_name, node_image.vm_name, node_image.image_tag,node_snapshot.snapshot_name,node_snapshot.honeypot_type , node_snapshot.honeypot_category FROM node_profile_device
    //   inner join node_snapshot_hp_profile on node_snapshot_hp_profile.profile_id = node_profile_device.profile_id
    //   inner join node_snapshot on node_snapshot.snapshot_id = node_snapshot_hp_profile.snapshot_id
    //  inner join node_image on node_image.image_id = node_snapshot.image_id`;

    if (req.query.honeypot_type) {
      query += ` WHERE ns.honeypot_type = ?`;
    }

    dbConn.query(query, [req.query.honeypot_type], (err, res) => {
      if (err) {
        return result(null, err);
      }
      result(null, res);
    });
  } catch (err) {
    return result(null, err);
  }
};

Honeypot.vulnerabilityCount = async (req, result) => {
  let totalIotCount = await totalIotVul();
  let totalWebCount = await totalWebVul();
  let totalScadaCount = await totalScadaVul();

  return result(await { totalIotCount, totalWebCount, totalScadaCount });
};

async function totalIotVul() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT count(*) as doc_count FROM node_vulnerability_package inner join node_snapshot on node_snapshot.snapshot_id = node_vulnerability_package.snapshot_id where node_snapshot.honeypot_category="IoT"`,
        async (err, res) => {
          resolve(res);
        }
      );
    }, 300);
  });
}

async function totalWebVul() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT count(*) as doc_count FROM node_vulnerability_package inner join node_snapshot on node_snapshot.snapshot_id = node_vulnerability_package.snapshot_id where node_snapshot.honeypot_category="WEB"`,
        async (err, res) => {
          resolve(res);
        }
      );
    }, 300);
  });
}

async function totalScadaVul() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT count(*) as doc_count FROM node_vulnerability_package inner join node_snapshot on node_snapshot.snapshot_id = node_vulnerability_package.snapshot_id where node_snapshot.honeypot_category="SCADA"`,
        async (err, res) => {
          resolve(res);
        }
      );
    }, 300);
  });
}

Honeypot.getVulnerabilities = (req, result) => {
  try {
    dbConn.query(
      //   `SELECT node_snapshot.image_id, node_vulnerability.vulnerability,node_vulnerability.vulnerability_description,node_package.package_name,node_package.port, node_package.package_version FROM node_vulnerability
      // inner join node_vulnerability_package on node_vulnerability_package.vulnerability_id = node_vulnerability.vulnerability_id
      // inner join node_package on node_vulnerability_package.package_id = node_package.package_id
      // inner join node_snapshot on node_snapshot.snapshot_id = node_vulnerability_package.snapshot_id where node_snapshot.honeypot_category="${req.body.cat}"`,
      `SELECT
    node_image.vm_name,
    node_snapshot.image_id,
    node_vulnerability.vulnerability,
    node_vulnerability.vulnerability_description,
    node_package.package_name,
    node_package.port,
    node_package.package_version
FROM
    node_vulnerability
INNER JOIN
    node_vulnerability_package ON node_vulnerability_package.vulnerability_id = node_vulnerability.vulnerability_id
INNER JOIN
    node_package ON node_vulnerability_package.package_id = node_package.package_id
INNER JOIN
    node_snapshot ON node_snapshot.snapshot_id = node_vulnerability_package.snapshot_id
INNER JOIN
    node_image ON node_snapshot.image_id = node_image.image_id
WHERE
    node_snapshot.honeypot_category = "${req.body.cat}"`,

      (err, res) => {
        result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

Honeypot.totalVulnerabilities = (req, result) => {
  try {
    dbConn.query(
  //     `SELECT 
  //     nv.vulnerability_id, 
  //     nv.vulnerability_description, 
  //     nv.vulnerability,
  //     ns.snapshot_name,
  //     ns.honeypot_category,
  //     GROUP_CONCAT(DISTINCT IFNULL(nhp.profile_name, '') SEPARATOR ', ') AS profile_names
  // FROM 
  //     node_vulnerability AS nv
  // INNER JOIN 
  //     node_vulnerability_package AS nvp 
  //     ON nv.vulnerability_id = nvp.vulnerability_id
  // INNER JOIN 
  //            node_hp_profile AS nhp 
  //     ON nvp.profile_id = nhp.profile_id
  // INNER JOIN 
  //     node_snapshot AS ns
  //     ON nvp.snapshot_id = ns.snapshot_id
  // GROUP BY 
  //     nv.vulnerability_id, 
  //     nv.vulnerability_description, 
  //     nv.vulnerability`,
      `SELECT 
      nv.vulnerability_id, 
      nv.vulnerability_description, 
      nv.vulnerability
      from 
      node_vulnerability AS nv
  GROUP BY 
      nv.vulnerability_id, 
      nv.vulnerability_description, 
      nv.vulnerability`,
      (err, res) => {
        result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

Honeypot.protocolTable = (req, result) => {
  try {
    dbConn.query(
    //   `SELECT
    //   ns.honeypot_name,
    //   ns.honeypot_category,
    //   nhp.device_name,
    //   nhp.device_type,
    //   np.package_name
    // FROM node_snapshot AS ns
    // JOIN node_snapshot_package AS nsp ON ns.snapshot_id = nsp.snapshot_id
    // JOIN node_package AS np ON nsp.package_id = np.package_id
    // JOIN node_hp_profile_package AS nhpp ON nhpp.package_id = nsp.package_id
    // JOIN node_hp_profile AS nhp ON nhp.profile_id = nhpp.profile_id`,
    `SELECT
ns.honeypot_name,
ns.honeypot_category,
 nhp.device_name,
group_concat( distinct(nhp.device_name) separator ',') as device_name,
nhp.device_type,
np.package_name,
np.port,
nhpp.package_id
 FROM node_snapshot AS ns
 JOIN node_snapshot_package AS nsp ON ns.snapshot_id = nsp.snapshot_id
 JOIN node_package AS np ON nsp.package_id = np.package_id
 JOIN node_hp_profile_package AS nhpp ON nhpp.package_id = nsp.package_id
 JOIN node_hp_profile AS nhp ON nhp.profile_id = nhpp.profile_id
 group by package_id`,    

      (err, res) => {
        result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

Honeypot.imageTable = (req, result) => {
  try {
    dbConn.query(
    // `SELECT os_name, vm_name, os_type, vm_type,image_name, image_tag, node_hardware FROM node_image;
    // `,    
    `SELECT DISTINCT vm_name, os_name, os_type, vm_type, image_name, image_tag, node_hardware
    FROM node_image group by vm_name;
    `,    

      (err, res) => {
        result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

Honeypot.deviceNameTable = (req, result) => {
  try {
    dbConn.query(
    //   `SELECT
    //   ns.honeypot_name,
    //   ns.honeypot_category,
    //   nhp.device_name,
    //   nhp.device_type,
    //   np.package_name
    // FROM node_snapshot AS ns
    // JOIN node_snapshot_package AS nsp ON ns.snapshot_id = nsp.snapshot_id
    // JOIN node_package AS np ON nsp.package_id = np.package_id
    // JOIN node_hp_profile_package AS nhpp ON nhpp.package_id = nsp.package_id
    // JOIN node_hp_profile AS nhp ON nhp.profile_id = nhpp.profile_id`,
    `SELECT
ns.honeypot_name,
ns.honeypot_category,
-- nhp.device_name,
group_concat( distinct(nhp.device_name) separator ',') as device_name,
nhp.device_type,
np.package_name,
nhpp.package_id
 FROM node_snapshot AS ns
 JOIN node_snapshot_package AS nsp ON ns.snapshot_id = nsp.snapshot_id
 JOIN node_package AS np ON nsp.package_id = np.package_id
 JOIN node_hp_profile_package AS nhpp ON nhpp.package_id = nsp.package_id
 JOIN node_hp_profile AS nhp ON nhp.profile_id = nhpp.profile_id
 group by package_id`,    

      (err, res) => {
        result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};
Honeypot.deviceTable = (req, result) => {
  try {
    dbConn.query(
      `SELECT
        nhp.device_name,
        nhp.device_type
      FROM
        node_hp_profile AS nhp`,
      (err, res) => {
        if (err) {
          return result(null, err);
        }
        result(null, res);
      }
    );


  } catch (err) {
    return result(null, err);
  }
};

Honeypot.protocolsChart = (req, result) => {
  try {
    dbConn.query(
//     `SELECT
//   np.package_name,
//   nhp.device_name,
//   COUNT(*) AS doc_count
// FROM
//   node_package np
// LEFT JOIN
//   node_snapshot_package nsp ON np.package_id = nsp.package_id
// LEFT JOIN
//   node_snapshot_hp_profile nsph ON nsp.snapshot_id = nsph.snapshot_id
// LEFT JOIN
//   node_hp_profile nhp ON nsph.profile_id = nhp.profile_id
// GROUP BY
//   np.package_name, nhp.device_name
// ORDER BY
//   np.package_name, doc_count DESC;    
`SELECT
distinct nhp.device_name,
  np.package_name,
 COUNT(distinct nhp.device_name) AS doc_count
FROM
 node_hp_profile nhp
INNER JOIN
 node_hp_profile_package nhpp ON nhp.profile_id = nhpp.profile_id
INNER JOIN
 node_package np ON np.package_id = nhpp.package_id
 where device_name is not null
GROUP BY
 np.package_name
ORDER BY
 np.package_name, doc_count DESC;    
    `,    

      (err, res) => {
        result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};


Honeypot.profileImage = (req, result) => {

  const vm_name = req.query.vm_name;
  try {
    dbConn.query(
      `SELECT distinct nhp.profile_name, nhp.device_type, nhp.device_name from 
    node_hp_profile as nhp
    inner join node_snapshot_hp_profile nshp on nshp.profile_id = nhp.profile_id
    inner join node_snapshot ns on ns.snapshot_id = nshp.snapshot_id
    inner join node_image ni on ni.image_id = ns.image_id
    where ni.vm_name = '${vm_name}'`,
      (err, res) => {
        result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

Honeypot.doubleVulnerabilities = async (req, result) => {
  // let IoT = await totalIotVulnerabilities();
  // let WEB = await totalWebVulnerabilities();
  // let SCADA = await totalScadaVulnerabilities();

  return result(await totalDoubleVulnerabilities());
};

async function totalDoubleVulnerabilities() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `WITH RankedVulnerabilities AS (
          SELECT
              COUNT(distinct vulnerability) AS doc_count,
              nv.vulnerability,
              ns.honeypot_category,
              ROW_NUMBER() OVER (PARTITION BY ns.honeypot_category ORDER BY COUNT(*) DESC) AS rnk
          FROM
              node_vulnerability_package AS nvp
          INNER JOIN
              node_snapshot AS ns ON ns.snapshot_id = nvp.snapshot_id
          INNER JOIN
              node_vulnerability AS nv ON nv.vulnerability_id = nvp.vulnerability_id
          WHERE
              nv.vulnerability IS NOT NULL AND nv.vulnerability != 'NULL'
          GROUP BY
              ns.honeypot_category, nv.vulnerability
      )
      SELECT
          doc_count,
          vulnerability,
          honeypot_category
      FROM
          RankedVulnerabilities
      WHERE
          rnk <= 10
      ORDER BY
          honeypot_category, doc_count DESC;      
        `,
        async (err, res) => {
          resolve(res);
        }
      );
    }, 300);
  });
}

// async function totalIotVulnerabilities() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       dbConn.query(
//         `SELECT COUNT(*) AS doc_count, nv.vulnerability
//         FROM node_vulnerability_package AS nvp
//         INNER JOIN node_snapshot AS ns ON ns.snapshot_id = nvp.snapshot_id
//         INNER JOIN node_vulnerability AS nv ON nv.vulnerability_id = nvp.vulnerability_id
//         WHERE ns.honeypot_category = "IoT" AND nv.vulnerability != 'null'
//         GROUP BY nvp.vulnerability_id
//         ORDER BY doc_count DESC
//         LIMIT 10;
//         `,
//         async (err, res) => {
//           resolve(res);
//         }
//       );
//     }, 300);
//   });
// }

// async function totalWebVulnerabilities() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       dbConn.query(
//         `SELECT COUNT(*) AS doc_count, nv.vulnerability
//         FROM node_vulnerability_package AS nvp
//         INNER JOIN node_snapshot AS ns ON ns.snapshot_id = nvp.snapshot_id
//         INNER JOIN node_vulnerability AS nv ON nv.vulnerability_id = nvp.vulnerability_id
//         WHERE ns.honeypot_category = "WEB" AND nv.vulnerability != 'null'
//         GROUP BY nvp.vulnerability_id
//         ORDER BY doc_count DESC
//         LIMIT 10;
//         `,
//         async (err, res) => {
//           resolve(res);
//         }
//       );
//     }, 300);
//   });
// }

// async function totalScadaVulnerabilities() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       dbConn.query(
//         `SELECT COUNT(*) AS doc_count, nv.vulnerability
//         FROM node_vulnerability_package AS nvp
//         INNER JOIN node_snapshot AS ns ON ns.snapshot_id = nvp.snapshot_id
//         INNER JOIN node_vulnerability AS nv ON nv.vulnerability_id = nvp.vulnerability_id
//         WHERE ns.honeypot_category = "SCADA" AND nv.vulnerability != 'null'
//         GROUP BY nvp.vulnerability_id
//         ORDER BY doc_count DESC
//         LIMIT 10;
//         `,
//         async (err, res) => {
//           resolve(res);
//         }
//       );
//     }, 300);
//   });
// }

Honeypot.protocols = async (req, result) => {
  // let IoT = await iotProtocols();
  // let WEB = await webProtocols();
  // let SCADA = await scadaProtocols();

  // return result(await { IoT, WEB, SCADA });
  return result(await Protocols());
};
async function Protocols() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `WITH RankedPackages AS (
          SELECT
              COUNT(distinct package_name) AS doc_count,
              np.package_name,
              ns.honeypot_category,
              ROW_NUMBER() OVER (PARTITION BY ns.honeypot_category ORDER BY COUNT(*) DESC) AS rnk
          FROM
              node_package AS np
          INNER JOIN
              node_snapshot_package AS nsp ON nsp.package_id = np.package_id
          INNER JOIN
              node_snapshot AS ns ON ns.snapshot_id = nsp.snapshot_id
          GROUP BY
              ns.honeypot_category, np.package_name
      )
      SELECT
          doc_count,
          package_name,
          honeypot_category
      FROM
          RankedPackages
      WHERE
          rnk <= 10
      ORDER BY
          honeypot_category, doc_count DESC;
        `,
        async (err, res) => {
          resolve(res);
        }
      );
    }, 300);
  });
}
// async function iotProtocols() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       dbConn.query(
//         `SELECT COUNT(*) AS doc_count , np.package_name
//         FROM node_package as np 
//           INNER JOIN node_snapshot_package as nsp on nsp.package_id = np.package_id
//           INNER JOIN node_snapshot as ns on ns.snapshot_id = nsp.snapshot_id
//           WHERE ns.honeypot_category = "IOT" 
//           GROUP BY np.package_name
//           ORDER BY doc_count DESC
//               LIMIT 10;
//         `,
//         async (err, res) => {
//           resolve(res);
//         }
//       );
//     }, 300);
//   });
// }

// async function webProtocols() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       dbConn.query(
//         `SELECT COUNT(*) AS doc_count , np.package_name
//         FROM node_package as np 
//           INNER JOIN node_snapshot_package as nsp on nsp.package_id = np.package_id
//           INNER JOIN node_snapshot as ns on ns.snapshot_id = nsp.snapshot_id
//           WHERE ns.honeypot_category = "WEB" 
//           GROUP BY np.package_name
//           ORDER BY doc_count DESC
//               LIMIT 10;
//         `,
//         async (err, res) => {
//           resolve(res);
//         }
//       );
//     }, 300);
//   });
// }

// async function scadaProtocols() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       dbConn.query(
//         `SELECT COUNT(*) AS doc_count , np.package_name
//         FROM node_package as np 
//           INNER JOIN node_snapshot_package as nsp on nsp.package_id = np.package_id
//           INNER JOIN node_snapshot as ns on ns.snapshot_id = nsp.snapshot_id
//           WHERE ns.honeypot_category = "SCADA" 
//           GROUP BY np.package_name
//           ORDER BY doc_count DESC
//               LIMIT 10;
//         `,
//         async (err, res) => {
//           resolve(res);
//         }
//       );
//     }, 300);
//   });
// }

Honeypot.devices = async (req, result) => {
  // let IoT = await iotDevices();
  // let WEB = await webDevices();
  // let SCADA = await scadaDevices();

  return result(await Devices());
};

async function Devices() {
   return new Promise((resolve, reject) => {
  setTimeout(() => {
    dbConn.query(
      `SELECT
      COUNT(distinct device_type) AS doc_count,
      nhp.device_type,
      ns.honeypot_category
  FROM
      node_hp_profile AS nhp
  INNER JOIN
      node_snapshot_hp_profile AS nshp ON nshp.profile_id = nhp.profile_id
  INNER JOIN
      node_snapshot AS ns ON ns.snapshot_id = nshp.snapshot_id
  GROUP BY
      nhp.device_type, ns.honeypot_category
  ORDER BY
      doc_count DESC;
  `,

      async (err, res) => {
        resolve(res);
      }
    );
  }, 300);
});
}

Honeypot.pieDevices = async (req, result) => {
  // let IoT = await iotDevices();
  // let WEB = await webDevices();
  // let SCADA = await scadaDevices();

  return result(await PieDevices());
};

async function PieDevices() {
   return new Promise((resolve, reject) => {
  setTimeout(() => {
    dbConn.query(
      `select count(distinct device_type) as doc_count ,
      ns.honeypot_category
      from node_hp_profile as nhp
  INNER JOIN
      node_snapshot_hp_profile AS nshp ON nshp.profile_id = nhp.profile_id
  INNER JOIN
      node_snapshot AS ns ON ns.snapshot_id = nshp.snapshot_id
      GROUP BY
       ns.honeypot_category
  ORDER BY
      doc_count DESC;
  `,

      async (err, res) => {
        resolve(res);
      }
    );
  }, 300);
});
}

// async function iotDevices() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       dbConn.query(
//         `SELECT COUNT(*) AS doc_count, nhp.device_type
//         FROM node_hp_profile AS nhp
//         INNER JOIN node_snapshot_hp_profile AS nshp ON nshp.profile_id = nhp.profile_id
//         INNER JOIN node_snapshot AS ns ON ns.snapshot_id = nshp.snapshot_id
//         WHERE ns.honeypot_category = "IOT"
//         GROUP BY nhp.device_type
//         ORDER BY doc_count DESC
//         LIMIT 10;`,
//         // `SELECT COUNT(*) AS doc_count, npd.device_name
//         // FROM node_profile_device AS npd
//         // INNER JOIN node_snapshot_hp_profile AS nshp ON nshp.profile_id = npd.profile_id
//         // INNER join node_snapshot AS ns ON ns.snapshot_id = nshp.snapshot_id
//         // WHERE ns.honeypot_category = "IOT"
//         // GROUP BY npd.device_name
//         // ORDER BY doc_count DESC
//         // LIMIT 10;
//         // `,
//         async (err, res) => {
//           resolve(res);
//         }
//       );
//     }, 300);
//   });
// }

// async function webDevices() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       dbConn.query(
//         `SELECT COUNT(*) AS doc_count, nhp.device_type
//         FROM node_hp_profile AS nhp
//         INNER JOIN node_snapshot_hp_profile AS nshp ON nshp.profile_id = nhp.profile_id
//         INNER JOIN node_snapshot AS ns ON ns.snapshot_id = nshp.snapshot_id
//         WHERE ns.honeypot_category = "WEB"
//         GROUP BY nhp.device_type
//         ORDER BY doc_count DESC
//         LIMIT 10;`,
//         async (err, res) => {
//           resolve(res);
//         }
//       );
//     }, 300);
//   });
// }

// async function scadaDevices() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       dbConn.query(
//         `SELECT COUNT(*) AS doc_count, nhp.device_type
//         FROM node_hp_profile AS nhp
//         INNER JOIN node_snapshot_hp_profile AS nshp ON nshp.profile_id = nhp.profile_id
//         INNER JOIN node_snapshot AS ns ON ns.snapshot_id = nshp.snapshot_id
//         WHERE ns.honeypot_category = "SCADA"
//         GROUP BY nhp.device_type
//         ORDER BY doc_count DESC
//         LIMIT 10;`,
//         async (err, res) => {
//           resolve(res);
//         }
//       );
//     }, 300);
//   });
// }

Honeypot.configData = async (req, result) => {
  const builder = new xml2js.Builder({
    renderOpts: { pretty: true, indent: "    " },
    xmldec: { version: "1.0", encoding: "UTF-8" },
  });

  data = req.body;
  let node_id; 
  // console.log("----data-----",data)
  var mac_address = await checkMac(data);
  // console.log("mac_address",mac_address)
  if (mac_address.length > 0) {
    return result(null, { msg: "Mac Address already Registered", status: 0 });
  } else {
    try {
      const userIp = requestIp.getClientIp(req);

      const xmlData = {
        INIT: {
          server_ip: userIp,
          network_type: data.network_type,
          interface: data.interface,
          node_ip: data.node_ip,
          subnet: data.subnet,
          netmask: data.netmask,
          gateway: data.gateway,
          dns: data.dns,
          virtual_tech: data.virtual_tech,
          image_path: "/images/os",
          conf_timer: "300",
          data_timer: "14400",
          pcap_timer: "3600",
          organization: data.node_location,
          organization_sector: data.sector,
          organization_region: data.region,
          longitude: data.lat,
          latitude: data.lng,
        },
      };

      const xml = builder.buildObject(xmlData);
      const xmlWithoutDeclaration = xml.split("\n").slice(1).join("\n");
      node_id = await addNode(data);


const folderPath =  `./av_repo/${node_id}`;
// Create the subfolder if it doesn't exist
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath);
}

// Write the file inside the subfolder
fs.writeFileSync(`${folderPath}/initials.xml`, xmlWithoutDeclaration, 'utf8');


      const configData = {
        config: {
          flag: "1",
          location: data.node_location,
          organization_sector: data.sector,
          organization_region: data.region,
          longitude: data.lng,
          latitude: data.lat,
          mac_address: data.mac_address || "",
          network_type: data.network_type,
          static_ip: data.node_ip,
          public_ip: data.node_ip,
          netmask: data.netmask,
          gateway: data.gateway,
          dns: data.dns,
        },
      };

      const conf = builder.buildObject(configData);
      const configWithoutDeclaration = conf.split("\n").slice(1).join("\n");


// Create the subfolder if it doesn't exist
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath);
}

// // Write the file inside the subfolder
fs.writeFileSync(`${folderPath}/config.conf`, configWithoutDeclaration, 'utf8');


      addNodeLocation(data);
      if (node_id) {
        // console.log("passed the if  condition")
        addNodeNetwork(data, node_id);
      }
      return result(null, { msg: "Node Registered Successfully", status: 1 });
    } catch (err) {
      return result(null, { msg: err, status: 0 });
    }
  }
};

async function addNode(data) {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Months are 0-based, so add 1
  const day = currentDate.getDate();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();

  var date =
    year +
    "-" +
    month +
    "-" +
    day +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `insert into node(node_location, node_reg_date, email_address, mac_address, network_type,node_status, base_ip, node_ip, port, node_hardware, node_sensor_hp_type, interface, virtual_tech) values ('${data.node_location}','${date}','${data.email}','${data.mac_address}','${data.network_type}','Down','${data.base_ip}','${data.node_ip}','${data.port}','${data.node_hardware}','${data.node_sensor_hp_type}','${data.interface}','${data.virtual_tech}')`,
        async (err, insertResult) => {
          if (err) {
            // console.log("Error", err)
            reject(err);
          } else {
            // console.log("Result-----",insertResult)
            const node_id = insertResult.insertId;
            // console.log("-----nodeId",node_id)
            resolve(node_id);
          }
        }
      );
    });
  });
}

async function addNodeLocation(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `insert into node_location(lat, lng, place, region, sector, organization, city, state) values ('${data.lat}','${data.lng}','${data.node_location}','${data.region}','${data.sector}','${data.node_location}','${data.city}','${data.state}')`,
        async (err, res) => {
          // console.log("Error from addnodeLocation",err)
          // console.log("Response from addLocation", res)
          resolve(res);
        }
      );
    }, 300);
  });
}

async function addNodeNetwork(data, node_id) {
  return new Promise((resolve, reject) => {
    dbConn.query(
      `insert into node_network(node_id, ip_address, type, status, mapped_ip) values ('${node_id}','${data.subnet}','subnet',0,''),('${node_id}','${data.netmask}','netmask',0,''),('${node_id}','${data.gateway}','gateway',0,''),('${node_id}','${data.dns}','dns',0,''),('${node_id}','${data.node_ip}','static_ip',0,'${data.base_ip}')`,
      async (err, res) => {
        // console.log("Error from addNodeNetwork 1st query -----",err)
        // console.log("Response from addNodeNetwork 1st query---", res)

        for (i = 0; i < data.ipAddresses.length; i++) {
          dbConn.query(
            `insert into node_network(node_id, ip_address, type, status, mapped_ip) values ('${node_id}','${data.ipAddresses[i].private_ip}','public',0,'${data.ipAddresses[i].mapped_ip}')`,
            async (err, res) => {
              // console.log("Error from addNodeNetwork 2nd query -----",err)
              // console.log("Response from addNodeNetwork 2nd query---", res)
      
              if (err) {
                console.log("err", err);
              }
            }
          );
        }
//         console.log("last resolve addNodeNetwork  -----",res)
        resolve(res);
      }
    );
  });
}

async function checkMac(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dbConn.query(
        `SELECT node_id FROM node where mac_address = '${data.mac_address}'`,
        async (err, res) => {
          resolve(res);
        }
      );
    }, 300);
  });
}

Honeypot.getStates = (req, result) => {
  try {
    dbConn.query(
      `SELECT state_name from states where region_name ="${req.body.eve}"`,
      (err, res) => {
        result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

Honeypot.getCities = (req, result) => {
  try {
    dbConn.query(
      `SELECT city_name FROM cities where state_id = (select id from states where state_name ="${req.body.eve}")`,
      (err, res) => {
        result(null, res);
      }
    );
  } catch (err) {
    return result(null, err);
  }
};

Honeypot.addCity = (req, result) => {
  const city_name = req.body.otherCity;
  const state_name = req.body.state;

  // state_id 
  dbConn.query(
    `SELECT id FROM states WHERE state_name = '${state_name}'`,
    (err, res) => {
      if (err) {
        return result(null, err);
      }

      if (res.length === 0) {
        // If the state doesn't exist, return an error
        return result({ message: 'State not found' }, null);
      }

      const state_id = res[0].id;

 // Check if the city_name is empty or null
 if (!city_name || city_name.trim() === '') {
  return result({ message: 'City name cannot be empty or null' }, null);
}
      // Check on city_name 
      dbConn.query(
        `SELECT * FROM cities WHERE city_name = '${city_name}' AND state_id = ${state_id}`,
        (err, res) => {
          if (err) {
            return result(null, err);
          }

          if (res.length > 0) {
            // If the city already exists, return an error
            return result({ message: 'City already exists' }, null);
          }

          // Insert the new city
          dbConn.query(
            `INSERT INTO cities(city_name, state_id) VALUES ('${city_name}', ${state_id})`,
            (err, res) => {
              if (err) {
                return result(null, err);
              }
              result(null, res);
            }
          );
        }
      );
    }
  );
};


Honeypot.imageCheck = async (req, result) => {
  try {
    // const apiUrl = `${process.env.ImageApi}/v2/${req.body.image}/tags/list`;
    // const response = await axios.get(apiUrl);
    // console.log("response", response.data);
    result(null, { status: 1, msg: "Image Found"});
  } catch (error) {
    console.error(error);
    return result(null, { status: 1, msg: "Image Not Found In Docker Repo" });
  }
};
module.exports = Honeypot;
