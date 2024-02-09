const sequelize = require("sequelize");
const { check, validationResult } = require("express-validator");

const validation = {
  NODE_REGISTER: [
    check("node_location")
      .notEmpty()
      .withMessage("Please enter node location.")
      .matches(/^[a-zA-Z\-_\s]+$/)
      .withMessage(
        "Please enter valid characters: alphabets, '-', '_', or spaces"
      ),

    // check("mac_address")
    //   .notEmpty()
    //   .withMessage("Please enter MAC address.")
    //   .matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
    //   .withMessage("Please enter a valid MAC address in the valid format."),
    check("mac_address")
    .notEmpty()
    .withMessage("Please enter MAC address.")
    .matches(/^([0-9A-Za-z]{2}[:-]){5}([0-9A-Za-z]{2})$/)
    .withMessage("Please enter a valid MAC address in the valid format."),
  
    check("node_hardware")
      .notEmpty()
      .withMessage("Please select node hardware.")
      .matches(/^[A-Za-z ]+$/)
      .withMessage(
        "Node hardware should be only aplhabetic or it may contain white spaces"
      ),

    check("network_type")
      .notEmpty()
      .withMessage("Please select network type.")
      .isAlpha()
      .withMessage("Network type should be only Alphabetic"),

    check("node_ip")
      .notEmpty()
      .withMessage("Please enter node IP.")
      .matches(
        /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      )
      .withMessage("Please enter a valid IP address in the valid format."),

    check("base_ip")
      .optional()
      .matches(
        /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      )
      .withMessage("Please enter a valid IP address in the valid format."),

    check("port").optional(),
    check("node_sensor_hp_type")
      .notEmpty()
      .withMessage("Please select honeypot type.")
      .isAlpha()
      .withMessage("Honeypot type should be only alphabetic"),

    check("interface").notEmpty().withMessage("Please enter interface."),

    check("virtual_tech")
      .notEmpty()
      .withMessage("Please select virtual tech.")
      .matches(/^[A-Za-z ]+$/)
      .withMessage(
        "Virtual Tech should be only Alphabetic or it may contain whitespace"
      ),

    check("lat")
      .notEmpty()
      .withMessage("Please enter latitude.")
      .matches(/^[-+]?([0-8]?[0-9]|90)(\.\d+)?$/)
      .withMessage("Please enter a valid latitude (-90 to 90)."),

    check("lng")
      .notEmpty()
      .withMessage("Please enter longitude.")
      .matches(/^[-+]?([0-9]|[1-9][0-9]|1[0-7][0-9]|180)(\.\d+)?$/)
      .withMessage("Please enter a valid longitude (-180 to 180)."),

    check("region")
      .notEmpty()
      .withMessage("Please select region.")
      .matches(/^[A-Za-z-_]+$/)
      .withMessage(
        "Region must be aplhabetic or it may include hyphon and underscore"
      ),

    check("sector")
      .notEmpty()
      .withMessage("Please select sector.")
      .matches(/^[A-Za-z-_]+$/)
      .withMessage(
        "Sector needs to be only Alphabetic or it may include hyphon and underscore"
      ),

    check("state")
      .notEmpty()
      .withMessage("Please select state.")
      .matches(/^[A-Za-z -_]+$/)
      .withMessage(
        "State should only be alphabetic or it may contain hyphon , underscore or whitespace"
      ),
    check("city")
      .notEmpty()
      .withMessage("Please select city.")
      .matches(/^[A-Za-z -_]+$/)
      .withMessage(
        "City needs to be only Alphabetic or it may contain hyphon, underscore and whitespace"
      ),

      check('subnet')
      .notEmpty().withMessage('Please enter subnet IP address.')
      .matches(/^((25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(25[0-5]|2[0-4]\d|[01]?\d{1,2})(\/([0-9]|[1-2]\d|3[0-2]))?$/)
      .withMessage('Please enter a valid IP address in the valid format.'),
    

    check("netmask")
      .notEmpty()
      .withMessage("Please enter netmask IP address.")
      .matches(
        /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      )
      .withMessage("Please enter a valid IP address in the valid format."),

    check("gateway")
      .notEmpty()
      .withMessage("Please enter gateway IP address.")
      .matches(
        /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      )
      .withMessage("Please enter a valid IP address in the valid format."),

    check("total_hp")
      .notEmpty()
      .withMessage("Please enter the total number of honeypots.")
      .isNumeric()
      .withMessage(
        "Please enter a valid numeric value for the total number of honeypots."
      ),

    check("dns")
      .notEmpty()
      .withMessage("Please enter DNS.")
      .matches(
        /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      )
      .withMessage("Please enter a valid IP address in the valid format."),

    check("ipAddresses.*.private_ip")
      .notEmpty()
      .withMessage("Please enter Private IP.")
      .matches(
        /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      )
      .withMessage("Please enter a valid IP address in the valid format."),

    check("ipAddresses.*.mapped_ip")
    .notEmpty()
    .withMessage("Please enter Private IP.")
      .matches(
        /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      )
      .withMessage("Please enter a valid IP address in the valid format."),
  ],

  BLUEPRINT_DATA: [
    check("base_system")
      .notEmpty()
      .withMessage("Please enter a value for base system.")
      .matches(/^[A-Za-z/]+$/)
      .withMessage(
        "Base System should be only alphabetic or it may contain a slash"
      ),
    check("image_name")
      .optional()
      .matches(/^[A-Za-z0-9_]+$/)
      .withMessage("Please enter only alphanumeric values or underscore"),
    check("image_tag")
      .optional()
      .matches(/^[0-9.]+$/)
      .withMessage("Please enter only numeric values"),
    check("vm_type")
      .notEmpty()
      .withMessage("Please select Environment type.")
      .matches(/^[A-Za-z ]+$/)
      .withMessage(
        "Environment type should be only alphabetic or can contain whitespace"
      ),
    check("vm_name")
      .notEmpty()
      .withMessage("Please enter vm name.")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Virtual Machine name should be only alphanumeric or it can contain '_'"),
    check("os_type")
      .notEmpty()
      .withMessage("Please select a valid operating system type.")
      .isAlpha()
      .withMessage("Operating System type should be only alphabetic"),
    check("os_name")
      .notEmpty()
      .withMessage("Please enter operating system name.")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Operating System name should be only alphanumeric or it can contain '_'"),
    check("node_id").optional(),
    check("honeypot_name")
      .notEmpty()
      .withMessage("Please enter honeypot name.")
      .matches(/^[a-zA-Z0-9_ ]+$/)
      .withMessage(
        "Honeypot name should be only alphanumeric and can contain underscore"
      ),
    check("snap_name").optional(),
    check("honeypot_type")
      .notEmpty()
      .withMessage("Please enter honeypot type.")
      .isAlpha()
      .withMessage("Network type should be only Alphabetic")
      .isAlpha()
      .withMessage("Honeypot category should be only alphabetic"),
    check("honeypot_cat")
      .notEmpty()
      .withMessage("Please enter honeypot category.")
      .isAlpha()
      .withMessage("Honeypot category should be only alphabetic"),
    check("honeypot_detail")
      .notEmpty()
      .withMessage("Please enter honeypot detail."),
    check("version").optional(),
    // check("honeypot_profiles")
    //   .notEmpty()
    //   .withMessage("Please enter honeypot profiles"),
    check("honeypot_profiles.*.profile_name")
      .notEmpty()
      .withMessage("Please enter profile name")
      .matches(/^[A-Za-z0-9:_-]+$/)
      .withMessage(
        "Profile name should be only alphanumeric or can contain colon"
      ),
    // check("honeypot_profiles.*.service")
    //   .notEmpty()
    //   .withMessage("Please enter service"),
    check("honeypot_profiles.service.*.name")
    .matches(/^[A-Za-z0-9 _-]+$/)
    .withMessage("Service Name should be only alphanumeric or it can contain '-' or '_' or whitespace ")
      .notEmpty()
      .withMessage("Please enter name"),
    check("honeypot_profiles.service.*.port")
      .notEmpty()
      .withMessage("Please enter port")
      .isNumeric("Port should be only numeric"),
    check("honeypot_profiles.service.*.version")
      .matches(/^[A-Za-z0-9 _.//-]+$/)
      .withMessage(
        "Version should be only alphanumeric or can contain space and underscore"
      ),
    check("honeypot_profiles.service.*.protocol")
      .isAlpha("Protocol should be only alphabetic"),
    check("honeypot_profiles.service.*.description")
      .matches(/^[A-Za-z0-9 _&,'"-]+$/)
      .withMessage(
        "Description can only contain letters, numbers, spaces, and special characters: _, ', \", -, &"
      ),
    // check("honeypot_profiles.service.*.vulnerability")
    //   .notEmpty()
    //   .withMessage("Please enter vulnerability"),
    check("honeypot_profiles.vulnerability.*.vulnerability_name")
      .notEmpty()
      .withMessage("Please enter vulnerability name")
      .matches(/^[A-Za-z0-9 _]+$/)
      .withMessage(
        "Vulnerabiity name should be only alphanumeric or can contain hyphon"
      ),
    check("honeypot_profiles.vulnerability.*.vulnerability_description")
      .notEmpty()
      .withMessage("Please enter vulnerability description"),
  ],

  CONFIGDETAIL: [
    check("node")
      .notEmpty()
      .withMessage("Required Field is Empty")
      .isInt()
      .withMessage("Invaild Node"),
  ],

  HONEYPOTDETAIL: [
    check("node_id")
      .notEmpty()
      .withMessage("Required Field is Empty")
      .isInt()
      .withMessage("Invaild Node ID"),
  ],
  handleValidationErrors: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
};

module.exports = validation;
