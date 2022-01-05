"use strict";

// 패키지(모듈)
const process = require("process");
const oracledb = require("oracledb");
const configOracle = require("../config/oracle");

// 상수
// 테이블 명, 해당 구역의 환경 타입, 해당 구역의 센서의 수, 해당 구역의 센서 종류
const CONST__ORACLE_XE__TABLE_NAME =
  process.env.ORACLE_XE__TABLE_NAME || "GENERAL";
const CONST__ORACLE_XE__TEST_TABLE_NAME = `TEST_${CONST__ORACLE_XE__TABLE_NAME}`;
const CONST__SECTION__ENV_TYPE = process.env.SECTION__ENV_TYPE || "TUNNEL";
const CONST__SECTION__SENSORS_NUM =
  process.env.CONST__SECTION__SENSORS_NUM || 9;
const OBJECT__SECTION__ETC_SENSORS_TYPES = {
  TUNNEL: ["DUST_1", "DUST_2", "DUST_3"],
  BRIDGE: ["Accelation_X", "Accelation_Y", "Accelation_Z"],
  RESIDENTIAL_AREA: ["DUST_1", "DUST_2", "DUST_3"],
  INTERSECTION: ["DUST_1", "DUST_2", "DUST_3"],
};
const ARRAY__SECTION__ETC_SENSORS_TYPE =
  OBJECT__SECTION__ETC_SENSORS_TYPES[CONST__SECTION__ENV_TYPE];

// 컨텍스트

// DML 삽입 쿼리
let STR_DML_INSERT_QUERY = `INSERT INTO ${CONST__ORACLE_XE__TEST_TABLE_NAME} VALUES (`;
for (let i = 1; i <= CONST__SECTION__SENSORS_NUM; ++i) {
  STR_DML_INSERT_QUERY += `:VAL${i},`;
}
STR_DML_INSERT_QUERY += "SYSDATE)";
// TEST_GENERAL:
// CREATE TABLE (
//   vibration_1_avg NUMBER, vibration_2_avg NUMBER, vibration_3_avg NUMBER,
//   sound_1_avg NUMBER, sound_2_avg NUMBER, sound_3_avg NUMBER,
//   any_1_val NUMBER, any_2_val NUMBER, any_3_val NUMBER,
//   occured_at DATE
// );
// INSERT INTO ${CONST__ORACLE_XE__TEST_TABLE_NAME} VALUES (:AVG1,:AVG2,:AVG3,:AVG4,:AVG5,:AVG6,AVG7,AVG8,AVG9,SYSDATE)

// GENERAL:
// INSERT INTO ${CONST__} (vibration_1_avg,vibration_2_avg,vibration_3_avg,sound_1_avg,sound_2_avg,sound_3_avg)
// VALUES (...)

const ctrlOracle = {
  STR_DML_INSERT_QUERY: STR_DML_INSERT_QUERY,

  fnCreatePool: async function () {
    this.pool = await oracledb.createPool(configOracle);
  },
  fnGetConnection: async function () {
    this.conn = await oracledb.getConnection();
  },
  fnOperInAdvance: async function () {
    try {
      await this.fnCreatePool();
      await this.fnGetConnection();
    } catch (err) {
      console.error(`Error:\n${__filename}.fnOperInAdvance:\n${err}`);
      process.exit(1);
    }
  },
  fnDMLInsert: async function (_arrObj) {
    let bindParams = [];
    const qOpts = {
      autoCommit: true,
      bindDefs: {},
    };

    for (let i = 0; i < CONST__SECTION__SENSORS_NUM; ++i) {
      bindParams = [...bindParams, _arrObj[i].avg];
      qOpts.bindDefs[`VAL${i}`] = { type: oracledb.DB_TYPE_NUMBER };
    }

    await this.conn.execute(this.STR_DML_INSERT_QUERY, bindParams, qOpts);
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
