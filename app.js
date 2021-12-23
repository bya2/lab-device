// 환경 변수 파일
const envFile = process.env.NODE_ENV === "production" ? ".env" : "tmp.env";

// 모듈
const process = require("process");
const path = require("path");
const appRoot = require("app-root-path");
require("dotenv").config({ path: path.resolve(`${appRoot}`, envFile) });

// 비즈니스 로직
const ctrlOracle = require("./controller/oracle");
const ctrlSerial = require("./controller/serial");

// 상수
// 해당 구역에 대한 식별자, 종류
const SECTION_ID = process.env.ORACLEDB_TABLE_ALL_SECTION;
const SECTION_TYPE = process.env.ORACLEDB_TABLE_SECTION_TYPE;

if (!SECTION_ID || !SECTION_TYPE) {
  console.log(`No section_id and section_type:\n${filename}`);
  process.exit(0);
}

(async (process) => {
  // DB 연결이 될 때까지 대기
  await ctrlOracle.fnOperInAdvance();

  // 기기에서 아두이노 포트를 찾고 해당 포트의 시리얼을 제어
  ctrlSerial.fnHandleSerialPort();

  process
    .once("SIGTERM", oracleCtrl.fnOperAtTerminatation)
    .once("SIGINT", oracleCtrl.fnOperAtTerminatation);
})(process);
