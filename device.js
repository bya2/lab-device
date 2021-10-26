// Mode
const NODE_ENV = process.env.NODE_ENV; console.log(NODE_ENV);

// Modules
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), NODE_ENV === 'production' ? '.env' : '.env.dev') });

// Loads
const obj_controller__oracle = require('./src/controller/oracle_controller');
const obj_controller__serial = require('./src/controller/serial_controller');

// Main
(async () => {
  await obj_controller__serial.fn_find__port__arduino();

  await obj_controller__oracle.fn_oper__in_advance();

  await obj_controller__serial.fn_handle__stream();
})();