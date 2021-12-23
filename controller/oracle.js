"use strict";

const process = require("process");
const oracledb = require("oracledb");
const { configOracle } = require("../config/oracle");

const CONST_NUM_OF_SENSORS = 6;

const ctrlOracle = {
  fnCreatePool: async function (_config) {
    this.pool = await oracledb.createPool(_config || configOracle);
  },
  fnGetConnection: async function () {
    this.conn = await oracledb.getConnection();
  },
  fnOperInAdvance: async function (_config) {
    if (_config || configOracle) {
      await this.fnCreatePool(_config);
      await this.fnGetConnection();
    } else {
      console.error(`Error:\n${__filename}`);
      process.exit(1);
    }
  },
  fnDMLInsert: async function (_sec, _arrObj) {
    // 섹터(_sec)의 수에 따라 유동적으로 INSERT를 할 수 있도록 쿼리 작성.
    // 테이블 컬럼의 변경에도 무난하게 작동.

    // 현재 AVG(평균)값만 데이터베이스 테이블에 INSERT.

    let q; // INSERT INTO ${_sec} VALUES (:AVG1,:AVG2,:AVG3,:AVG4,:AVG5,:AVG6)
    const bindParams = [];
    const qOpts = {
      autoCommit: true,
      bindDefs: {},
    };

    q = `INSERT INTO ${_sec} VALUES (`;
    for (let i = 0; i < CONST_NUM_OF_SENSORS; ++i) {
      q += `:AVG${i},`;
      bindParams = [...bindParams, _arrObj[i].avg];
      qOpts.bindDefs[`AVG${i}`] = { type: oracledb.DB_TYPE_NUMBER };
    }
    q += "SYSDATE)";

    await this.conn.execute(q, bindParams, qOpts);
  },
  fnCloseConnection: async function () {
    if (this.conn) {
      await this.conn.close();
    }
  },
  fnOperAtTerminatation: async function () {
    try {
      await this.fnCloseConnection();
      await oracledb.getPool().close(10);
      process.exit(0);
    } catch {
      process.exit(1);
    }
  },
};

module.exports = ctrlOracle;
