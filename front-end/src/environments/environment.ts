

const API_URL = "http://localhost:5000";

export const environment = {
  production: false, 
  openMapToken: 'pk.eyJ1IjoiaGpvaG4xMjMiLCJhIjoiY2xma3FjcXAxMGQ5azQ2czRmNnAzMHV2cSJ9.JvHcg6FFTSFr1UFPmjwJ6g',
  API_URL: API_URL,
  recoverUrl : '/#/recoverpassword',
  assetPath: 'assets',
  recaptchasiteKey : "6LeZaHImAAAAAOJaHVFOfRbOY9G8FvDtwGmyQjx2",
  threat_mapIP :'164.164.32.25',
  threat_mapPort :'61615',
  //sign up component 
  createUser: API_URL + '/api/v1/users/createUser',
  

  // recover-password component
  recoverPassword: API_URL + '/api/v1/users/recoverPassword',

  // Notification component
  getNotifications: API_URL + '/api/v1/users/notifications/',
  markNotificationRead: API_URL + '/api/v1/users/markNotificationRead',
  getNotificationCount: API_URL + '/api/v1/users/notificationCount/',

  //common api 
  region: API_URL + '/region',
  getAllSectors: API_URL + '/getAllSectors',
  getAllOrganization: API_URL + '/getAllOrganization',
  getAllNodes: API_URL + '/api/v1/users/getallnodes',

  //permission comp 
  getRegion: API_URL + '/permission/getRegion',
  getSector: API_URL + '/permission/getSector',
  getOrganization: API_URL + '/permission/getOrganization',
  getNodeId: API_URL + '/permission/getNodeId',
  getNodeAllId: API_URL + '/permission/getNodeAllId',
  nodePermission: API_URL + '/permission/nodePermission',

  // parent chart 
  topPorts:API_URL+'/topPorts',
  topAttackerIPs: API_URL + '/topAttackerIPs',
  topAttackCountry: API_URL + '/topAttackCountry',
  topMalwareFamily: API_URL + '/topMalwareFamily',
  trendPorts: API_URL+'/trendPorts',
  topAttackTrend: API_URL+'/topAttackTrend',

  // chips component
  getOrg: API_URL+'/getOrg',

  // Indian IPs
  allcountries:API_URL+'/api/v1/users/allcountries',
  indiaIPsHash:API_URL+'/indiaIPsHash',
  indiaIPs:API_URL+'/indiaips',

  //usermanagement
  viewUsers: API_URL + '/api/v1/users/viewUsers/',
  viewPendUsers: API_URL + '/api/v1/users/viewPendingUsers/',
  deleteUser: API_URL + '/api/v1/users/deleteUser/',
  editUser: API_URL + '/api/v1/users/editUser/',
  addUser: API_URL + '/api/v1/users/addUser',

  // login component
  login: API_URL + '/api/v1/users/login/',

  //header component
  logOut: API_URL + '/api/v1/users/logOut/',

  // change password
  change_passsword: API_URL + '/api/v1/users/change-password/',

  //forgot password
  forgot: API_URL + '/api/v1/users/forgot',

  //dashboard
  searchOperation: API_URL + '/searchOperation',

  //attack map
  orgWiseAttack: API_URL + '/getOrgWiseAttack',
  getAllAttackNodes: API_URL + '/api/v1/users/getAllAttackNodes',

  //search by indicator
  restapi: API_URL + '/restapi',



  // heat map
  // stateWiseAttackData: API_URL + '/getRegionWiseRecords',
  // sectorNodes: API_URL + '/getSectorNodes',
  // heat map
  stateWiseAttackData: API_URL + '/getRegionWiseRecords',
  sectorNodes: API_URL + '/getSectorNodes',
  deployedHoneypotCategory: API_URL + '/deployedHoneypotCategory',
  deployedHoneypotType: API_URL + '/deployedHoneypotType',
  deployedHoneypotStatus: API_URL + '/deployedHoneypotStatus',
  deployedNodeStatus: API_URL + '/deployedNodeStatus',
  deployedNodeHardware: API_URL + '/deployedNodeHardware',
  deployedNodeSectorWise: API_URL + '/deployedNodeSectorWise',
  deployedNodeRegionWise: API_URL + '/deployedNodeRegionWise',
  deployedHoneypotGraph: API_URL + '/deployedHoneypotGraph',
  sectorFilterData: API_URL + '/sectorFilterData',
  regionFilterData: API_URL + '/regionFilterData',
  organizationFilterData: API_URL + '/organizationFilterData',

  // high severity alert
  severityAlert:API_URL+'/api/v1/users/severityAlert',

  // honeypot detail
  honeypotDetail: API_URL + '/honeypotDetail',

  // Node detail
  nodeDetail: API_URL + '/nodeDetail',
  getNodeHealthConnection: API_URL+'/getNodeHealthConnection',
  getHoneypotHealthConnection: API_URL+'/getHoneypotHealthConnection',

  // user session
  userSession: API_URL+ '/api/v1/users/userSession',

  // Search by criteria
  searchCriteria: API_URL + '/searchCriteria',
  jsonCriteria: API_URL + '/jsonCriteria',

    //  unique/Unclassified binaries
    uniqueBinary: API_URL + '/uniqueBinary',
    binNodes: API_URL + '/binNodes',
    downloadbinary: API_URL + '/downloadbinary',
    pdfbinary: API_URL + '/pdfbinary',
    adarLabelData: API_URL + '/adarlabeldata',
    getThreatScore: API_URL + '/getThreatScore',
    sqlBinaries: API_URL + '/sqlBinaries',
    sqlAVdetails: API_URL + '/sqlAVdetails',
    sqlpdfbinary: API_URL + '/sqlpdfbinary',
    getYaraData: API_URL + '/yaraData',
    getMlData: API_URL + '/mlData',
    getHybridReport: API_URL + '/getHybridReport',

  // threat intel events
  threatEvents: API_URL + '/threatEvents',
  eventsData: API_URL + '/eventsData',
  getAllOrgIps: API_URL + '/getAllOrgIps',
  getAllOrgIpJson: API_URL + '/getAllOrgIpJson',

  // Report Download
  reportGenerateList: API_URL + '/api/v1/users/reportGenerateList',
  generateCsvReport: API_URL+'/generateCsvReport',
  reportLogGenerate: API_URL + '/api/v1/users/reportLogGenerate',

  // deployed config honeypot
  getConfigDetails: API_URL+'/getConfigDetails',
  delteHoneypot : API_URL+'/permission/delteHoneypot',

  // get binary pcap
  getBinaryPcap: API_URL+'/getBinaryPcap',
  getBinary: API_URL+'/getBinary',
  getSnort: API_URL + '/getSnort',
  getNodePcap: API_URL + '/getNodePcap',


  // config honeypot
  honeypotConfig :API_URL+'/honeypotConfig',
  hpProfileConfig :API_URL+'/hpProfileConfig',
  hp_image : API_URL+'/hp_image',
  hp_service : API_URL+'/hp_service',
  getHoneypotData : API_URL+'/getHoneypotData',
  gethpProfile : API_URL+'/gethpProfile',
  saveHoneypotConfig: API_URL+'/saveHoneypotConfig',
  getNodeConfig: API_URL+'/getNodeConfig',
  getImageName: API_URL + '/getImageName',
  deviceType: API_URL + '/deviceType',
  deviceName: API_URL + '/deviceName',

  //config-hihp
  getHoneypotDataHiHp: API_URL + '/getHoneypotDataHiHp',
  deviceNameHiHp: API_URL + '/deviceNameHiHp',
  deviceTypeHiHp: API_URL + '/deviceTypeHiHp',
  getNodeConfigHIHP: API_URL + '/getNodeConfigHIHP',
  saveHoneypotConfigHiHp: API_URL + '/saveHoneypotConfigHiHp',

  // rest services
  filePath: API_URL + '/getFile',
  url: API_URL + '/url',
  findeone: API_URL + '/findeone',

  //blueprint
  blueprintSubmit: API_URL + '/honeypot/blueprintSubmit',
  getHighNode: API_URL + '/honeypot/getHighNode',

    // image check api
    imageCheck: API_URL + '/honeypot/imageCheck',

      //honeypot stats
  snapCount: API_URL + '/honeypot/snapCount',
  profileCount: API_URL + '/honeypot/profileCount',
  vulnerabilityCount: API_URL + '/honeypot/vulnerabilityCount',
  getProfiles: API_URL + '/honeypot/getProfiles',
  getVulnerabilities: API_URL + '/honeypot/getVulnerabilities',
  totalVulnerabilities: API_URL + '/honeypot/totalVulnerabilities',
  doubleVulnerabilities: API_URL + '/honeypot/doubleVulnerabilities',
  getHoneypots: API_URL + '/honeypot/getHoneypots',
  protocols: API_URL + '/honeypot/protocols',
  devices: API_URL + '/honeypot/devices',
  pieDevices: API_URL + '/honeypot/pieDevices',
  protocolTable: API_URL + '/honeypot/protocolTable',
  imageTable: API_URL + '/honeypot/imageTable',
  deviceNameTable: API_URL + '/honeypot/deviceNameTable',
  doubleProfilesDevices: API_URL + '/honeypot/doubleProfilesDevices',
  doubleDeviceVulnerabilities: API_URL + '/honeypot/doubleDeviceVulnerabilities',
  doubleProtocols: API_URL + '/honeypot/doubleProtocols',
  deviceTable: API_URL + '/honeypot/deviceTable',
  protocolsChart: API_URL + '/honeypot/protocolsChart',
  profileImage: API_URL + '/honeypot/profileImage',
  timeGraph: API_URL + '/honeypot/timeGraph',
  honeyotDeviceType: API_URL + '/honeyotDeviceType',
  deployedHoneyotDeviceType: API_URL + '/deployedHoneyotDeviceType',

  // node registration
  configData: API_URL + '/honeypot/configData',

    // config new honeypot
    statesList: API_URL + '/honeypot/statesList',
    citiesList: API_URL + '/honeypot/citiesList',
    addCity: API_URL + '/honeypot/addCity',
  

      //profileEdit
  editProfile: API_URL + '/api/v1/users/editProfile',
  getuser: API_URL + '/api/v1/users/getuserList/',

};
