const NODE_ENV = process.env.NODE_ENV;


const path = require('path');
const appRoot = require('app-root-path');
require('dotenv').config({ path: path.resolve(`${appRoot}`, NODE_ENV === 'production' ? '.env' : '.env.dev') });



