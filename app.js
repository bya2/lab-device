const process = require("process");

const serialCtrl = require("./controller/serial");

const SECTION_ID = process.env.ORACLEDB_TABLE_ALL_SECTION;
const SENSOR_ID = process.env.ORACLEDB_TABLE_SENSOR_ID;

module.exports = (async function (process) {
  if (!(SECTION_ID || SENSOR_ID)) {
    process.exit(0);
  }

  serialCtrl.fnHandleSerialPort();
})(process);
