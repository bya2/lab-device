const envFile = process.env.NODE_ENV === "production" ? ".env" : "tmp.env";

const path = require("path");
const appRoot = require("app-root-path");
require("dotenv").config({ path: path.resolve(`${appRoot}`, envFile) });

require("./db");

require("./app");
