"use strict";

const oracledb = require('oracledb');
const oracleConfig = require('../config/oracle');

const oracleCtrl = {
  fnCreatePool: async function(_config)
  {
    this.pool = await oracledb.createPool(_config || oracleConfig);
  },
  fnGetConnection: async function()
  {
    this.conn = await oracledb.getConnection();
  },
  fnOperInAdvance: async function(_config)
  {
    if (_config || oracleConfig) {
      await this.fnCreatePool(_config);
      await this.fnGetConnection();
    } else {
      console.error(`Error:\n${__filename}`);
      process.exit(1);
    }
  },
  fnDMLInsert: async function(_sec, _ssn, _obj)
  {
    const q = `INSERT INTO ${_sec}${_ssn} VALUES (:MIN, :MAX, :AVG, :LEN, SYSDATE)`;
    const bindParams = [_obj.min, _obj.max, _obj.avg, _obj.len];
    const qOpts = {
      autoCommit: true,
      bindDefs: {
        MIN: { type: this.oracledb.DB_TYPE_NUMBER },
        MAX: { type: this.oracledb.DB_TYPE_NUMBER },
        AVG: { type: this.oracledb.DB_TYPE_NUMBER },
        LEN: { type: this.oracledb.DB_TYPE_NUMBER },
      },
    };
    await this.conn.execute(q, bindParams, qOpts);
  },
  fnCloseConnection: async function()
  {
    if (this.conn) {
      await this.conn.close();
    }
  },
  fnOperAtTerminatation: async function()
  {
    try {
      await this.fnCloseConnection();
      await oracledb.getPool().close(10);
      process.exit(0);
    } catch {
      process.exit(1);
    }
  },
}

module.exports = oracleCtrl;