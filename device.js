// Mode
const NODE_ENV = process.env.NODE_ENV; console.log(NODE_ENV);

// Modules
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), NODE_ENV === 'production' ? '.env' : '.env.dev') });

// Loads
const obj__oracle_controller = require('./src/controller/oracle');
const obj__serial_controller = require('./src/controller/serial');

// Main
(async () => {
  await obj__serial_controller.fn_find__port__arduino();

  await obj__oracle_controller.fn_oper__in_advance();

  await obj__serial_controller.fn_handle__stream();
})();