// 패키지(모듈)
const process = require("process");
const path = require("path");

// 환경 변수 파일
const envFile = process.env.NODE_ENV === "production" ? ".env" : "tmp.env";
require("dotenv").config({ path: path.resolve(__dirname, envFile) });

// 데이터베이스 접근 로직
const ctrlOracle = require("./controller/oracle");
const ctrlSerial = require("./controller/serial");

// 상수
// 해당 구역에 대한 식별자, 종류
const SECTION_ID = process.env.ORACLEDB_TABLE_ALL_SECTION;
const SECTION_TYPE = process.env.ORACLEDB_TABLE_SECTION_TYPE;

// 컨텍스트
// if (!SECTION_ID || !SECTION_TYPE) {
//   console.log(`No Constants:\n${__filename}`);
//   process.exit(0);
// }

(async (process) => {
  // 데이터베이스 연결 대기
  await ctrlOracle.fnOperInAdvance();

  // 기기에서 아두이노 포트를 찾고 해당 포트의 시리얼을 제어
  ctrlSerial.fnHandleSerialPort();

  // 종료 시 데이터베이스 연결 해제
  process
    .once("SIGTERM", ctrlOracle.fnOperAtTerminatation)
    .once("SIGINT", ctrlOracle.fnOperAtTerminatation);
})(process);
