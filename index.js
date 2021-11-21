const path = require('path');
const appRoot = require('app-root-path');

require('dotenv').config({
  path: path.resolve(
    `${appRoot}`,
    process.env.NODE_ENV === 'production' ? '.env' : '.env.dev'
  )
});

require('./db');
require('./app');




